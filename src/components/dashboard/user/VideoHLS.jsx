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
  const containerRef = useRef(null);
  
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
  const targetQualityRef = useRef(720);
  const qualitySetRef = useRef(false);
  
  // Recovery refs
  const lastStallRecoveryRef = useRef(0);
  
  // Double tap seek
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef(null);
  const tapCountRef = useRef(0);
  const [showSeekIndicator, setShowSeekIndicator] = useState(false);
  const [seekDirection, setSeekDirection] = useState(null);
  const [seekAmount, setSeekAmount] = useState(5);
  
  // UI states
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [mouseIdle, setMouseIdle] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const maxRetries = 3;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hide controls when mouse is idle
  useEffect(() => {
    if (!containerRef.current) return;

    let idleTimer;
    const resetIdleTimer = () => {
      setMouseIdle(false);
      setShowControls(true);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setMouseIdle(true);
        if (isPlaying && !showVolumeSlider && !showSettings) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', resetIdleTimer);
    container.addEventListener('mouseenter', resetIdleTimer);
    container.addEventListener('mouseleave', () => {
      setShowControls(false);
      setShowVolumeSlider(false);
      setShowSettings(false);
    });

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      container.removeEventListener('mousemove', resetIdleTimer);
      container.removeEventListener('mouseenter', resetIdleTimer);
      container.removeEventListener('mouseleave', () => {
        setShowControls(false);
        setShowVolumeSlider(false);
        setShowSettings(false);
      });
    };
  }, [isPlaying, showVolumeSlider, showSettings]);

  // Memoized function to set initial time
  const setInitialTime = useCallback(() => {
    if (hasSetInitialTimeRef.current) return false;
    
    const video = videoRef.current;
    if (!video || !video.duration || initialProgress <= 0) return false;
    
    const seekTime = (initialProgress / 100) * video.duration;
    
    if (Math.abs(video.currentTime - seekTime) > 1) {
      video.currentTime = seekTime;
      hasSetInitialTimeRef.current = true;
      setCurrentTime(seekTime);
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
    
    let targetLevel = -1;
    targetLevel = levels.findIndex(level => level.height === 720);
    
    if (targetLevel === -1 && levels.length > 0) {
      const sortedLevels = [...levels]
        .map((level, idx) => ({ ...level, index: idx }))
        .sort((a, b) => Math.abs(a.height - 720) - Math.abs(b.height - 720));
      
      targetLevel = sortedLevels[0].index;
      console.log(`No exact 720p, using closest: ${levels[targetLevel].height}p`);
    }
    
    if (plyr && plyr.options && plyr.options.quality) {
      const qualityOptions = plyr.options.quality.options || [];
      console.log('Plyr quality options:', qualityOptions);
      
      if (qualityOptions.includes(720)) {
        plyr.currentQuality = 720;
        console.log('Set Plyr quality to 720p');
      } else if (qualityOptions.length > 0) {
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

  // Double tap seek functionality
  const handleDoubleTapSeek = useCallback((event, direction) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;

    const isLeftTap = direction === 'left' || x < width / 2;
    const seekDirection = isLeftTap ? 'backward' : 'forward';
    
    const currentVideoTime = video.currentTime;
    const seekTime = seekDirection === 'forward' 
      ? Math.min(currentVideoTime + seekAmount, video.duration)
      : Math.max(currentVideoTime - seekAmount, 0);

    // Store playback state
    const wasPlaying = !video.paused;
    
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
    
    // Show seek indicator
    setSeekDirection(seekDirection);
    setShowSeekIndicator(true);
    
    // Resume playback if it was playing before seek
    if (wasPlaying) {
      const playAfterSeek = () => {
        video.play().catch(console.error);
        video.removeEventListener('seeked', playAfterSeek);
      };
      video.addEventListener('seeked', playAfterSeek);
    }
    
    // Hide indicator after 1 second
    setTimeout(() => {
      setShowSeekIndicator(false);
    }, 1000);
    
    console.log(`Double tap seek ${seekDirection} to ${seekTime.toFixed(2)}s`);
  }, [seekAmount]);

  // Handle tap events
  const handleTap = useCallback((event) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTapRef.current;
    
    // Clear previous timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    // If double tap within 300ms
    if (tapCountRef.current === 1 && tapLength < 300) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = event.touches ? event.touches[0] : event;
      const x = touch.clientX - rect.left;
      const direction = x < rect.width / 2 ? 'left' : 'right';
      handleDoubleTapSeek(event, direction);
      tapCountRef.current = 0;
    } else {
      tapCountRef.current = 1;
      tapTimeoutRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 300);
    }
    
    lastTapRef.current = currentTime;
  }, [handleDoubleTapSeek]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle video click
  const handleVideoClick = useCallback((event) => {
    // Don't handle click if clicking on controls or center play button
    if (event.target.closest('.video-controls') || event.target.closest('.center-play-button')) {
      return;
    }
    
    togglePlay();
  }, [togglePlay]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setVolume(video.muted ? 0 : video.volume);
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      video.muted = newVolume === 0;
      setVolume(newVolume);
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  // Change playback rate
  const changePlaybackRate = useCallback((rate) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  }, []);

  // Format time to MM:SS
  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          setIsPlaying(false);
          if (onEnded) {
            onEnded();
          }
        };
        endedHandlerRef.current = handleEnded;

        // Define stall handler with improved buffer hole handling
        const handleStall = () => {
          const now = Date.now();
          
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
              
              if (buffered.length > 0) {
                for (let i = 0; i < buffered.length; i++) {
                  const start = buffered.start(i);
                  const end = buffered.end(i);
                  
                  if (currentTime < start) {
                    console.log(`Buffer hole detected, seeking to ${start}s`);
                    video.currentTime = start;
                    return;
                  }
                  
                  if (currentTime >= start && currentTime <= end && (end - currentTime) < 0.5) {
                    const seekTime = Math.min(currentTime + 0.5, end);
                    console.log(`Near buffer end, seeking forward to ${seekTime}s`);
                    video.currentTime = seekTime;
                    return;
                  }
                }
              }
              
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
            startLevel: -1,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.1,
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
            fragLoadingLoopThreshold: 3,
            abrEwmaDefaultEstimate: 500000,
            abrEwmaFastLive: 3,
            abrEwmaSlowLive: 9,
            abrEwmaFastVoD: 3,
            abrEwmaSlowVoD: 9,
            abrBandWidthFactor: 0.95,
            abrBandWidthUpFactor: 0.7,
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
            
            const levels = hls.levels.map((level, index) => ({
              height: level.height,
              width: level.width,
              bitrate: level.bitrate,
              index: index,
            }));

            levels.sort((a, b) => b.height - a.height);
            const availableQualities = levels.map((level) => level.height);

            console.log('Available qualities:', availableQualities);

            // Initialize Plyr with custom controls disabled
            plyrRef.current = new Plyr(video, {
              settings: ["quality", "speed"],
              controls: [],
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
              setDuration(video.duration);
              setVolume(video.volume);
              setInitialTime();
            };
            metadataHandlerRef.current = handleMetadata;

            // Progress tracking with debouncing
            const handleTimeUpdate = () => {
              if (!video.duration || !onProgress) return;

              const percent = Math.floor((video.currentTime / video.duration) * 100);
              setCurrentTime(video.currentTime);

              // Set initial time if needed
              if (!hasSetInitialTimeRef.current && initialProgress > 0) {
                setInitialTime();
              }

              const now = Date.now();
              const timeSinceLastEmit = now - lastProgressEmitRef.current;

              if (timeSinceLastEmit > 5000 || [25, 50, 75, 95].includes(percent)) {
                lastProgressEmitRef.current = now;
                onProgress(percent);
              }
            };

            progressHandlerRef.current = handleTimeUpdate;
            video.addEventListener("timeupdate", handleTimeUpdate);

            // Handle metadata loaded
            video.addEventListener('loadedmetadata', handleMetadata);

            // Handle play event
            video.addEventListener('play', () => {
              setIsPlaying(true);
              if (onPlay) onPlay();
            });

            video.addEventListener('pause', () => {
              setIsPlaying(false);
            });

            // Handle ended event
            video.addEventListener('ended', handleEnded);

            // Listen for buffer stalls
            video.addEventListener('waiting', handleStall);
            video.addEventListener('stalled', handleStall);

            setIsLoading(false);
          });

          hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
            console.log(`Level loaded: ${data.details} quality`);
            if (!qualitySetRef.current) {
              set720pQuality(hls, plyrRef.current);
            }
          });

          hls.on(Hls.Events.FRAG_LOADED, () => {
            if (retryCount > 0) {
              console.log('Fragment loaded successfully, resetting retry count');
              setRetryCount(0);
            }
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
                    }, 1000 * newRetryCount);
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
              if (data.details === 'bufferSeekOverHole') {
                console.warn('Buffer hole detected, attempting recovery...');
                handleStall();
              }
            }
          });

          // Auto-play with user interaction
          const tryAutoPlay = () => {
            video.play().then(() => {
              setIsPlaying(true);
            }).catch(error => {
              console.log('Autoplay failed (expected):', error);
              setShowControls(true);
            });
          };

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
            setDuration(video.duration);
            setVolume(video.volume);
            
            setInitialTime();

            // Initialize minimal Plyr
            plyrRef.current = new Plyr(video, {
              controls: [],
              keyboard: { focused: true, global: true },
              fullscreen: { enabled: true, fallback: true, iosNative: true },
            });

            // Add progress tracking
            const handleTimeUpdate = () => {
              if (!video.duration || !onProgress) return;

              const percent = Math.floor((video.currentTime / video.duration) * 100);
              setCurrentTime(video.currentTime);
              const now = Date.now();
              
              if (now - lastProgressEmitRef.current > 5000 || [25, 50, 75, 95].includes(percent)) {
                lastProgressEmitRef.current = now;
                onProgress(percent);
              }
            };

            progressHandlerRef.current = handleTimeUpdate;
            video.addEventListener("timeupdate", handleTimeUpdate);

            // Handle play/pause events
            video.addEventListener('play', () => setIsPlaying(true));
            video.addEventListener('pause', () => setIsPlaying(false));
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
      
      if (progressDebounceRef.current) {
        clearTimeout(progressDebounceRef.current);
        progressDebounceRef.current = null;
      }
      
      // Clear tap timeout
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      
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
        
        video.pause();
        video.src = '';
        video.load();
      }
      
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
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black rounded-lg overflow-hidden select-none"
      onClick={handleVideoClick}
      onDoubleClick={(e) => {
        e.preventDefault();
        const direction = e.clientX < e.currentTarget.clientWidth / 2 ? 'left' : 'right';
        handleDoubleTapSeek(e, direction);
      }}
      onTouchStart={handleTap}
    >
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20 p-4">
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

      {/* Double Tap Seek Indicator */}
      {showSeekIndicator && (
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30
          ${seekDirection === 'forward' ? 'text-green-400' : 'text-yellow-400'}`}>
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-bold mb-2">
              {seekDirection === 'forward' ? '⏩' : '⏪'}
            </div>
            <div className="text-2xl font-bold bg-black/70 px-6 py-3 rounded-full border-2 border-white/50">
              {seekAmount}s
            </div>
          </div>
        </div>
      )}

      {/* Custom YouTube-like Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent 
        p-2 sm:p-4 transition-opacity duration-300 video-controls z-10
        ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}>
        
        {/* Progress Bar */}
        <div className="relative h-1.5 sm:h-2 bg-gray-700 rounded-full mb-3 sm:mb-4 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const video = videoRef.current;
            if (video) {
              const wasPlaying = !video.paused;
              video.currentTime = percent * video.duration;
              setCurrentTime(video.currentTime);
              
              if (wasPlaying) {
                const playAfterSeek = () => {
                  video.play().catch(console.error);
                  video.removeEventListener('seeked', playAfterSeek);
                };
                video.addEventListener('seeked', playAfterSeek);
              }
            }
          }}>
          <div 
            className="absolute h-full rounded-full"
            style={{ 
              width: `${(currentTime / duration) * 100 || 0}%`,
              backgroundColor: '#63953a'
            }}
          />
          <div className="absolute h-3 w-3 sm:h-4 sm:w-4 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            style={{ 
              left: `${(currentTime / duration) * 100 || 0}%`, 
              transform: 'translateX(-50%)',
              backgroundColor: '#63953a'
            }}
          />
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Play/Pause Button */}
            <button 
              onClick={togglePlay}
              className="text-white hover:scale-110 transition-transform"
            >
              {isPlaying ? (
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Volume Control */}
            <div className="relative">
              <button 
                onClick={toggleMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => !document.activeElement.closest('.volume-slider') && setShowVolumeSlider(false)}
                className="text-white hover:scale-110 transition-transform"
              >
                {volume === 0 || videoRef.current?.muted ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>
              
              {/* Volume Slider */}
              {showVolumeSlider && (
                <div 
                  className="absolute bottom-full left-0 mb-2 p-3 bg-black/90 rounded-lg volume-slider"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#63953a]"
                  />
                </div>
              )}
            </div>

            {/* Time Display */}
            <div className="text-white text-xs sm:text-sm font-mono min-w-[80px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Playback Speed Selector */}
            {showSettings && (
              <div className="absolute bottom-full right-0 mb-2 p-3 bg-black/90 rounded-lg">
                <div className="text-white text-xs mb-2 font-semibold">Playback Speed</div>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-gray-800 ${
                      playbackRate === rate ? 'text-[#63953a] font-bold' : 'text-gray-300'
                    }`}
                  >
                    {rate === 1 ? 'Normal' : rate}x
                  </button>
                ))}
              </div>
            )}

            {/* Settings Button */}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:scale-110 transition-transform relative"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
              </svg>
            </button>

            {/* Fullscreen Button */}
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:scale-110 transition-transform"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Double Tap Seek Hints */}
      <div className="absolute inset-0 flex pointer-events-none z-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/0 hover:text-white/30 transition-all duration-300 text-lg sm:text-xl md:text-2xl font-semibold bg-black/0 hover:bg-black/30 p-4 rounded-full">
            <div className="flex items-center">
              <span className="text-2xl sm:text-3xl mr-2">⏪</span>
              <span>5s</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/0 hover:text-white/30 transition-all duration-300 text-lg sm:text-xl md:text-2xl font-semibold bg-black/0 hover:bg-black/30 p-4 rounded-full">
            <div className="flex items-center">
              <span>5s</span>
              <span className="text-2xl sm:text-3xl ml-2">⏩</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        preload="metadata"
        poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      />

      {/* Center Play Button when paused */}
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button 
            onClick={togglePlay}
            className="center-play-button bg-black/50 hover:bg-black/70 rounded-full p-3 sm:p-4 md:p-6 transition-colors transform hover:scale-105"
          >
            <svg className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}