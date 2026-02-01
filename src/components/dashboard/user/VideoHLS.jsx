"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import "plyr/dist/plyr.css";

export default function VideoHLS({ 
  src, 
  onPlay, 
  onProgress, 
  initialProgress = 0, 
  onEnded 
}) {
  const videoRef = useRef(null);
  const plyrRef = useRef(null);
  const hlsRef = useRef(null);
  
  // Progress tracking refs
  const lastProgressEmitRef = useRef(0);
  const progressHandlerRef = useRef(null);
  const progressDebounceRef = useRef(null);
  const hasSetInitialTimeRef = useRef(false);
  
  // Event handler refs
  const stallHandlerRef = useRef(null);
  const playHandlerRef = useRef(null);
  const endedHandlerRef = useRef(null);
  const metadataHandlerRef = useRef(null);
  
  // Quality control
  const targetQualityRef = useRef(720); // Target 720p
  const qualitySetRef = useRef(false);
  
  // Recovery refs
  const lastStallRecoveryRef = useRef(0);
  
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoized function to set initial time
  const setInitialTime = useCallback(() => {
    if (hasSetInitialTimeRef.current) return false;
    
    const video = videoRef.current;
    if (!video || !video.duration || initialProgress <= 0) return false;
    
    const seekTime = (initialProgress / 100) * video.duration;
    
    // Only seek if we're not already close to the target time
    if (Math.abs(video.currentTime - seekTime) > 1) {
      video.currentTime = seekTime;
      hasSetInitialTimeRef.current = true;
      console.log(`Set initial time to ${seekTime}s (${initialProgress}%)`);
      return true;
    }
    
    return false;
  }, [initialProgress]);

  // Function to find and set 720p quality
  const set720pQuality = useCallback((hls, plyr) => {
    if (!hls || !hls.levels || qualitySetRef.current) return;
    
    const levels = hls.levels;
    console.log('Available quality levels:', levels.map(l => ({ height: l.height, bitrate: l.bitrate })));
    
    // Find 720p quality
    let targetLevel = -1;
    
    // First try exact 720p match
    targetLevel = levels.findIndex(level => level.height === 720);
    
    // If no exact match, find closest to 720p
    if (targetLevel === -1 && levels.length > 0) {
      // Sort by closeness to 720p
      const sortedLevels = [...levels]
        .map((level, idx) => ({ ...level, index: idx }))
        .sort((a, b) => Math.abs(a.height - 720) - Math.abs(b.height - 720));
      
      targetLevel = sortedLevels[0].index;
      console.log(`No exact 720p, using closest: ${levels[targetLevel].height}p`);
    }
    
    // Also try to find 720p in available options for Plyr
    if (plyr && plyr.options && plyr.options.quality) {
      const qualityOptions = plyr.options.quality.options || [];
      console.log('Plyr quality options:', qualityOptions);
      
      // Check if 720 is in available options
      if (qualityOptions.includes(720)) {
        plyr.currentQuality = 720;
        console.log('Set Plyr quality to 720p');
      } else if (qualityOptions.length > 0) {
        // Find closest to 720p
        const closestQuality = qualityOptions.reduce((prev, curr) => 
          Math.abs(curr - 720) < Math.abs(prev - 720) ? curr : prev
        );
        plyr.currentQuality = closestQuality;
        console.log(`Set Plyr quality to closest: ${closestQuality}p`);
      }
    }
    
    if (targetLevel !== -1 && targetLevel !== hls.currentLevel) {
      console.log(`Setting HLS level to ${targetLevel} (${levels[targetLevel].height}p)`);
      hls.currentLevel = targetLevel;
      qualitySetRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isClient || !src) return;

    setIsLoading(true);
    setError(null);
    hasSetInitialTimeRef.current = false;
    qualitySetRef.current = false;

    const initPlayer = async () => {
      try {
        const Hls = (await import("hls.js")).default;
        const Plyr = (await import("plyr")).default;

        const video = videoRef.current;
        if (!video) return;

        // Cleanup previous instances
        if (plyrRef.current) {
          try {
            plyrRef.current.destroy();
          } catch (e) {
            console.error("Error destroying previous Plyr:", e);
          }
          plyrRef.current = null;
        }
        
        if (hlsRef.current) {
          try {
            hlsRef.current.destroy();
          } catch (e) {
            console.error("Error destroying previous HLS:", e);
          }
          hlsRef.current = null;
        }

        // Reset video
        video.pause();
        video.src = "";
        video.load();

        // Clear all previous event listeners
        const oldHandlers = [
          { event: 'timeupdate', handler: progressHandlerRef.current },
          { event: 'waiting', handler: stallHandlerRef.current },
          { event: 'stalled', handler: stallHandlerRef.current },
          { event: 'play', handler: playHandlerRef.current },
          { event: 'ended', handler: endedHandlerRef.current },
          { event: 'loadedmetadata', handler: metadataHandlerRef.current },
        ];
        
        oldHandlers.forEach(({ event, handler }) => {
          if (handler) {
            video.removeEventListener(event, handler);
          }
        });

        // Define ended handler
        const handleEnded = () => {
          console.log('Video ended');
          if (onEnded) {
            onEnded();
          }
        };
        endedHandlerRef.current = handleEnded;

        // Define stall handler with improved buffer hole handling
        const handleStall = () => {
          const now = Date.now();
          
          // Don't attempt recovery more than once per 3 seconds
          if (now - lastStallRecoveryRef.current < 3000) {
            console.log('Stall recovery on cooldown');
            return;
          }
          
          console.log('Video stalled, attempting recovery...');
          
          setTimeout(() => {
            if (video && video.paused === false && video.readyState < 3) {
              lastStallRecoveryRef.current = now;
              
              const currentTime = video.currentTime;
              const buffered = video.buffered;
              
              // Try to seek to the next available buffer
              if (buffered.length > 0) {
                for (let i = 0; i < buffered.length; i++) {
                  const start = buffered.start(i);
                  const end = buffered.end(i);
                  
                  // If current time is before buffer start, seek to buffer start
                  if (currentTime < start) {
                    console.log(`Buffer hole detected, seeking to ${start}s`);
                    video.currentTime = start;
                    return;
                  }
                  
                  // If current time is in buffer but near end, seek a bit forward
                  if (currentTime >= start && currentTime <= end && (end - currentTime) < 0.5) {
                    const seekTime = Math.min(currentTime + 0.5, end);
                    console.log(`Near buffer end, seeking forward to ${seekTime}s`);
                    video.currentTime = seekTime;
                    return;
                  }
                }
              }
              
              // If HLS is available, try to restart loading
              if (hlsRef.current) {
                console.log('Restarting HLS loading');
                hlsRef.current.startLoad();
              }
            }
          }, 1000);
        };
        stallHandlerRef.current = handleStall;

        // Store play handler
        playHandlerRef.current = onPlay;

        // Force HLS.js even on Safari for quality control
        if (Hls.isSupported()) {
          const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: false,
            startLevel: -1, // Auto quality initially
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.1, // Reduced from 0.5 to be more sensitive to buffer holes
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
            // Add these for better buffer handling
            fragLoadingLoopThreshold: 3,
            abrEwmaDefaultEstimate: 500000, // 500kbps default estimate
            abrEwmaFastLive: 3,
            abrEwmaSlowLive: 9,
            abrEwmaFastVoD: 3,
            abrEwmaSlowVoD: 9,
            abrBandWidthFactor: 0.95,
            abrBandWidthUpFactor: 0.7,
            // Buffer hole recovery
            nudgeOffset: 0.1,
            nudgeMaxRetry: 2,
            xhrSetup: (xhr) => {
              xhr.withCredentials = true;
              xhr.timeout = 30000;
            },
          });

          hlsRef.current = hls;

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed');
            
            // Get quality levels
            const levels = hls.levels.map((level, index) => ({
              height: level.height,
              width: level.width,
              bitrate: level.bitrate,
              index: index,
            }));

            levels.sort((a, b) => b.height - a.height);
            const availableQualities = levels.map((level) => level.height);

            console.log('Available qualities:', availableQualities);

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
                default: availableQualities.includes(720) ? 720 : availableQualities[0],
                options: availableQualities,
                forced: true,
                onChange: (newQuality) => {
                  const currentTime = video.currentTime;
                  const wasPlaying = !video.paused;
                  
                  const levelIndex = hls.levels.findIndex(
                    (l) => l.height === newQuality
                  );
                  
                  if (levelIndex !== -1) {
                    console.log(`Switching quality to ${newQuality}p`);
                    hls.currentLevel = levelIndex;
                    
                    // Restore playback state after quality change
                    const restorePlayback = () => {
                      video.currentTime = currentTime;
                      if (wasPlaying) {
                        video.play().catch(e => console.error('Play failed after quality change:', e));
                      }
                      hls.off(Hls.Events.LEVEL_SWITCHED, restorePlayback);
                    };
                    
                    hls.once(Hls.Events.LEVEL_SWITCHED, restorePlayback);
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

            // Set 720p quality after manifest is parsed
            setTimeout(() => {
              set720pQuality(hls, plyrRef.current);
            }, 500);

            // Define metadata handler
            const handleMetadata = () => {
              console.log('Video metadata loaded, duration:', video.duration);
              setInitialTime();
            };
            metadataHandlerRef.current = handleMetadata;

            // Progress tracking with debouncing
            const handleTimeUpdate = () => {
              if (!video.duration || !onProgress) return;

              const percent = Math.floor((video.currentTime / video.duration) * 100);

              // Set initial time if needed
              if (!hasSetInitialTimeRef.current && initialProgress > 0) {
                setInitialTime();
              }

              const now = Date.now();
              const timeSinceLastEmit = now - lastProgressEmitRef.current;

              // Emit immediately every 5 seconds OR at key milestones
              if (timeSinceLastEmit > 5000 || [25, 50, 75, 95].includes(percent)) {
                lastProgressEmitRef.current = now;
                onProgress(percent);
                console.log(`Progress: ${percent}% (${video.currentTime.toFixed(1)}s / ${video.duration.toFixed(1)}s)`);
              } else {
                // Debounce for intermediate updates
                if (progressDebounceRef.current) {
                  clearTimeout(progressDebounceRef.current);
                }

                progressDebounceRef.current = setTimeout(() => {
                  onProgress(percent);
                  console.log(`Progress (debounced): ${percent}%`);
                }, 2000);
              }
            };

            progressHandlerRef.current = handleTimeUpdate;
            video.addEventListener("timeupdate", handleTimeUpdate);

            // Handle metadata loaded
            video.addEventListener('loadedmetadata', handleMetadata);

            // Handle play event
            if (onPlay) {
              video.addEventListener('play', onPlay);
            }

            // Handle ended event
            video.addEventListener('ended', handleEnded);

            // Listen for buffer stalls
            video.addEventListener('waiting', handleStall);
            video.addEventListener('stalled', handleStall);

            // Add buffered event listener to monitor buffer state
            video.addEventListener('progress', () => {
              const buffered = video.buffered;
              if (buffered.length > 0) {
                for (let i = 0; i < buffered.length; i++) {
                  console.log(`Buffer range ${i}: ${buffered.start(i).toFixed(2)} - ${buffered.end(i).toFixed(2)}`);
                }
              }
            });

            setIsLoading(false);
          });

          hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
            console.log(`Level loaded: ${data.details} quality`);
            // Ensure 720p is set after level is loaded
            if (!qualitySetRef.current) {
              set720pQuality(hls, plyrRef.current);
            }
          });

          hls.on(Hls.Events.FRAG_LOADED, () => {
            // Reset retry count on successful fragment load
            if (retryCount > 0) {
              console.log('Fragment loaded successfully, resetting retry count');
              setRetryCount(0);
            }
          });

          hls.on(Hls.Events.BUFFER_APPENDING, (event, data) => {
            // Log buffer appending to debug buffer holes
            console.log(`Buffer appending: type=${data.type}, start=${data.frag.start.toFixed(2)}`);
          });

          hls.on(Hls.Events.BUFFER_APPENDED, (event, data) => {
            // Buffer has been appended successfully
            console.log(`Buffer appended: type=${data.type}, end=${data.frag.end.toFixed(2)}`);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error("Network error, trying to recover...");
                  if (retryCount < maxRetries) {
                    const newRetryCount = retryCount + 1;
                    setRetryCount(newRetryCount);
                    setTimeout(() => {
                      console.log(`Retry attempt ${newRetryCount}/${maxRetries}`);
                      setRetryTrigger(prev => prev + 1);
                    }, 1000 * newRetryCount); // Exponential backoff
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
                  console.error("Unhandled fatal error:", data.details);
                  setError(`Video error: ${data.details}`);
                  setIsLoading(false);
                  break;
              }
            } else {
              // Handle non-fatal errors (like buffer holes)
              if (data.details === 'bufferSeekOverHole') {
                console.warn('Buffer hole detected, attempting recovery...');
                // HLS.js should handle this automatically, but we can also trigger our stall handler
                handleStall();
              }
            }
          });

          // Auto-play with user interaction
          const tryAutoPlay = () => {
            video.play().catch(error => {
              console.log('Autoplay failed (expected), showing controls:', error);
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
          console.log('Using native HLS support');
          video.src = src;

          // Handle native HLS metadata
          const handleMetadata = () => {
            console.log('Native HLS metadata loaded, duration:', video.duration);
            setIsLoading(false);
            
            // Set initial time
            setInitialTime();

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

            // Add progress tracking
            const handleTimeUpdate = () => {
              if (!video.duration || !onProgress) return;

              const percent = Math.floor((video.currentTime / video.duration) * 100);
              const now = Date.now();
              
              if (now - lastProgressEmitRef.current > 5000 || [25, 50, 75, 95].includes(percent)) {
                lastProgressEmitRef.current = now;
                onProgress(percent);
                console.log(`Progress: ${percent}%`);
              }
            };

            progressHandlerRef.current = handleTimeUpdate;
            video.addEventListener("timeupdate", handleTimeUpdate);

            // Handle play event
            if (onPlay) {
              video.addEventListener('play', onPlay);
            }

            // Handle ended event
            video.addEventListener('ended', handleEnded);

            // Add stall handlers
            video.addEventListener('waiting', handleStall);
            video.addEventListener('stalled', handleStall);
          };

          metadataHandlerRef.current = handleMetadata;
          video.addEventListener('loadedmetadata', handleMetadata);
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
      console.log('Cleaning up video player');
      
      // Clear debounce timeout
      if (progressDebounceRef.current) {
        clearTimeout(progressDebounceRef.current);
        progressDebounceRef.current = null;
      }
      
      // Cleanup video event listeners
      const video = videoRef.current;
      if (video) {
        const handlers = [
          { event: 'timeupdate', handler: progressHandlerRef.current },
          { event: 'waiting', handler: stallHandlerRef.current },
          { event: 'stalled', handler: stallHandlerRef.current },
          { event: 'play', handler: playHandlerRef.current },
          { event: 'ended', handler: endedHandlerRef.current },
          { event: 'loadedmetadata', handler: metadataHandlerRef.current },
        ];
        
        handlers.forEach(({ event, handler }) => {
          if (handler) {
            video.removeEventListener(event, handler);
          }
        });
        
        // Pause and reset
        video.pause();
        video.src = '';
        video.load();
      }
      
      // Destroy Plyr
      if (plyrRef.current) {
        try {
          plyrRef.current.destroy();
        } catch (e) {
          console.error("Error destroying Plyr:", e);
        }
        plyrRef.current = null;
      }
      
      // Destroy HLS
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch (e) {
          console.error("Error destroying HLS:", e);
        }
        hlsRef.current = null;
      }
      
      // Clear all refs
      progressHandlerRef.current = null;
      stallHandlerRef.current = null;
      playHandlerRef.current = null;
      endedHandlerRef.current = null;
      metadataHandlerRef.current = null;
      qualitySetRef.current = false;
    };
  }, [src, isClient, retryTrigger, onPlay, onEnded, setInitialTime, onProgress, set720pQuality]);

  // Handle retry
  const handleRetry = useCallback(() => {
    console.log('Manual retry triggered');
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    setRetryTrigger(prev => prev + 1);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center">
        <div className="text-white text-sm">Initializing player...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-sm">
              {retryCount > 0 
                ? `Loading video (attempt ${retryCount + 1}/${maxRetries})...` 
                : "Loading video..."}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 p-4">
          <div className="text-center text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-bold mb-2">Video Error</p>
            <p className="text-sm mb-4 text-gray-300">{error}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Buffering indicator */}
      <div 
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm opacity-0 transition-opacity duration-300 pointer-events-none"
        id="buffering-indicator"
      >
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
        onCanPlay={() => {
          const indicator = document.getElementById('buffering-indicator');
          if (indicator) indicator.style.opacity = '0';
        }}
        onError={(e) => {
          console.error('Video element error:', e);
        }}
      />
    </div>
  );
}