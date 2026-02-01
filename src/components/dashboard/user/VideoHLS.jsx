"use client";
import { useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";

export default function VideoHLS({ src, onPlay, onProgress, initialProgress = 0, onEnded }) {
  const videoRef = useRef(null);
  const plyrRef = useRef(null);
  const hlsRef = useRef(null);
  const lastProgressEmitRef = useRef(0);
  const progressHandlerRef = useRef(null);
  const hasSetInitialTimeRef = useRef(false);

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Store event handlers in refs so they persist through renders
  const stallHandlerRef = useRef(null);
  const playHandlerRef = useRef(null);
  const endedHandlerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !src) return;

    setIsLoading(true);
    setError(null);
    hasSetInitialTimeRef.current = false;

    const initPlayer = async () => {
      try {
        const Hls = (await import("hls.js")).default;
        const Plyr = (await import("plyr")).default;

        const video = videoRef.current;
        if (!video) return;

        // Cleanup previous instances
        if (plyrRef.current) {
          plyrRef.current.destroy();
          plyrRef.current = null;
        }
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        // Reset video
        video.src = "";
        video.load();

        // Function to set initial time
        const setInitialTime = () => {
          if (!hasSetInitialTimeRef.current && initialProgress > 0 && video.duration) {
            const seekTime = (initialProgress / 100) * video.duration;
            video.currentTime = seekTime;
            hasSetInitialTimeRef.current = true;
          }
        };

        // Define ended handler
        const handleEnded = () => {
          if (onEnded) {
            onEnded();
          }
        };

        // Define stall handler
        const handleStall = () => {
          // Check if we're actually stalled or just buffering
          setTimeout(() => {
            if (video && video.paused === false && video.readyState < 3) {
              // Try to skip small gaps in buffer
              const currentTime = video.currentTime;
              const buffered = video.buffered;

              if (buffered.length > 0) {
                let foundNextBuffer = false;
                for (let i = 0; i < buffered.length; i++) {
                  if (buffered.start(i) > currentTime + 0.5) {
                    video.currentTime = buffered.start(i);
                    foundNextBuffer = true;
                    break;
                  }
                }

                // If no buffer ahead, try restarting
                if (!foundNextBuffer && hlsRef.current) {
                  hlsRef.current.startLoad();
                }
              }
            }
          }, 1000); // Wait 1 second before attempting recovery
        };

        // Store handlers in refs for cleanup
        stallHandlerRef.current = handleStall;
        playHandlerRef.current = onPlay;
        endedHandlerRef.current = handleEnded;

        // Force HLS.js even on Safari for quality control
        if (Hls.isSupported()) {
          const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: false,
            startLevel: -1, // Auto quality
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
            maxFragLookUpTolerance: 0.2,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 10,
            liveDurationInfinity: false,
            liveBackBufferLength: Infinity,
            enableSoftwareAES: true,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 2,
            manifestLoadingRetryDelay: 500,
            manifestLoadingMaxRetryTimeout: 10000,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 4,
            levelLoadingRetryDelay: 500,
            levelLoadingMaxRetryTimeout: 10000,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            fragLoadingRetryDelay: 500,
            fragLoadingMaxRetryTimeout: 60000,
            startFragPrefetch: true,
            testBandwidth: true,
            xhrSetup: (xhr) => {
              xhr.withCredentials = true;
              xhr.timeout = 30000;
            },
          });

          hlsRef.current = hls;

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            // Get quality levels
            const levels = hls.levels.map((level, index) => ({
              height: level.height,
              width: level.width,
              bitrate: level.bitrate,
              index: index,
            }));

            levels.sort((a, b) => b.height - a.height);
            const availableQualities = levels.map((level) => level.height);

            // Initialize Plyr with quality controls
            plyrRef.current = new Plyr(video, {
              settings: ["quality", "speed"],
              controls: [
                "play",
                "progress",
                "current-time",
                "mute",
                "volume",
                "settings",
                "pip",
                "fullscreen",
              ],
              quality: {
                default: availableQualities[0],
                options: availableQualities,
                forced: true,
                onChange: (newQuality) => {
                  const levelIndex = hls.levels.findIndex(
                    (l) => l.height === newQuality
                  );
                  if (levelIndex !== -1) {
                    hls.currentLevel = levelIndex;
                  }
                },
              },
              keyboard: { focused: true, global: true },
              tooltips: { controls: true, seek: true },
              ratio: "16:9",
              fullscreen: { enabled: true, fallback: true, iosNative: true },
              seekTime: 10,
              hideControls: true,
            });

            // ---- PROGRESS TRACKING ----
            const handleTimeUpdate = () => {
              if (!video.duration || !onProgress) return;

              const percent = Math.floor((video.currentTime / video.duration) * 100);

              // Set initial time if needed
              if (!hasSetInitialTimeRef.current && initialProgress > 0) {
                setInitialTime();
              }

              const now = Date.now();
              if (now - lastProgressEmitRef.current > 5000) { // every 5s
                lastProgressEmitRef.current = now;
                onProgress(percent);
              }
            };

            progressHandlerRef.current = handleTimeUpdate;
            video.addEventListener("timeupdate", handleTimeUpdate);

            // Handle metadata loaded
            video.addEventListener('loadedmetadata', () => {
              setInitialTime();
            });

            // Handle play event
            if (onPlay) {
              video.addEventListener('play', onPlay);
            }

            // Handle ended event
            video.addEventListener('ended', handleEnded);

            // Listen for buffer stalls
            video.addEventListener('waiting', handleStall);
            video.addEventListener('stalled', handleStall);

            setIsLoading(false);
          });

          hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
            // Reset retry count on successful fragment load
            setRetryCount(0);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error("Network error, trying to recover...");
                  if (retryCount < maxRetries) {
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                      hls.startLoad();
                    }, 1000 * (retryCount + 1)); // Exponential backoff
                  } else {
                    setError("Network error: Failed to load video after multiple attempts");
                    setIsLoading(false);
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error("Media error, trying to recover...");
                  hls.recoverMediaError();
                  break;
                default:
                  console.error("Unhandled fatal error");
                  setError(`Video error: ${data.details}`);
                  setIsLoading(false);
                  break;
              }
            }
          });

          // Auto-play with user interaction
          const tryAutoPlay = () => {
            video.play().catch(error => {
              if (plyrRef.current) {
                plyrRef.current.toggleControls(true);
              }
            });
          };

          // Try autoplay after a short delay
          setTimeout(tryAutoPlay, 500);

        }
        // Fallback for native HLS support (Safari, iOS)
        else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;

          // Handle native HLS events
          video.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
            
            // Set initial time
            if (initialProgress > 0) {
              const seekTime = (initialProgress / 100) * video.duration;
              video.currentTime = seekTime;
            }

            // Initialize Plyr without quality control
            plyrRef.current = new Plyr(video, {
              controls: [
                "play",
                "progress",
                "current-time",
                "mute",
                "volume",
                "pip",
                "fullscreen",
              ],
              keyboard: { focused: true, global: true },
              fullscreen: { enabled: true, fallback: true, iosNative: true },
            });

            // Add progress tracking for native HLS
            const handleTimeUpdate = () => {
              if (!video.duration || !onProgress) return;

              const percent = Math.floor((video.currentTime / video.duration) * 100);
              const now = Date.now();
              if (now - lastProgressEmitRef.current > 5000) {
                lastProgressEmitRef.current = now;
                onProgress(percent);
              }
            };

            progressHandlerRef.current = handleTimeUpdate;
            video.addEventListener("timeupdate", handleTimeUpdate);

            // Handle play event
            if (onPlay) {
              video.addEventListener('play', onPlay);
            }

            // Handle ended event for native HLS
            video.addEventListener('ended', handleEnded);

            // Add stall handler for native HLS too
            video.addEventListener('waiting', handleStall);
            video.addEventListener('stalled', handleStall);
          });
        }
        else {
          const errorMsg = "HLS not supported in this browser";
          console.error(errorMsg);
          setError(errorMsg);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing player:", error);
        setError(`Player initialization failed: ${error.message}`);
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      // Cleanup
      const video = videoRef.current;

      if (video) {
        if (progressHandlerRef.current) {
          video.removeEventListener("timeupdate", progressHandlerRef.current);
        }
        if (stallHandlerRef.current) {
          video.removeEventListener('waiting', stallHandlerRef.current);
          video.removeEventListener('stalled', stallHandlerRef.current);
        }
        if (playHandlerRef.current) {
          video.removeEventListener('play', playHandlerRef.current);
        }
        if (endedHandlerRef.current) {
          video.removeEventListener('ended', endedHandlerRef.current);
        }
      }

      progressHandlerRef.current = null;

      if (plyrRef.current) {
        try {
          plyrRef.current.destroy();
        } catch (e) {
          console.error("Error destroying Plyr:", e);
        }
        plyrRef.current = null;
      }

      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch (e) {
          console.error("Error destroying HLS:", e);
        }
        hlsRef.current = null;
      }

      // Clear refs
      stallHandlerRef.current = null;
      playHandlerRef.current = null;
      endedHandlerRef.current = null;
    };
  }, [src, isClient, retryCount, onPlay, initialProgress, onEnded]);

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
  };

  if (!isClient) {
    return <div className="w-full h-full bg-gray-900 animate-pulse" />;
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-sm">
              {retryCount > 0 ? `Loading video (attempt ${retryCount + 1}/${maxRetries})...` : "Loading video..."}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 p-4">
          <div className="text-center text-red-500 mb-4">
            <p className="font-bold mb-2">Video Error</p>
            <p className="text-sm mb-4">{error}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Fallback overlay for buffering */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm opacity-0 transition-opacity duration-300"
        id="buffering-indicator">
        Buffering...
      </div>

      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        preload="metadata"
        poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        onWaiting={() => {
          const indicator = document.getElementById('buffering-indicator');
          if (indicator) indicator.style.opacity = '1';
        }}
        onPlaying={() => {
          const indicator = document.getElementById('buffering-indicator');
          if (indicator) indicator.style.opacity = '0';
        }}
      />
    </div>
  );
}