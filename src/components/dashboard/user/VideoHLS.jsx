"use client";
import { useEffect, useRef, useState, useCallback } from "react";
// Plyr CSS is kept just in case, though we use custom controls
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
  const hasSetInitialTimeRef = useRef(false);
  
  // Event handler refs
  const stallHandlerRef = useRef(null);
  const playHandlerRef = useRef(null);
  const endedHandlerRef = useRef(null);
  const metadataHandlerRef = useRef(null);
  
  // Quality control
  const targetQualityRef = useRef(720);
  
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
  const [isMuted, setIsMuted] = useState(false);
  
  // Settings Menu states
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Quality States
  const [levels, setLevels] = useState([]); // Available quality levels
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 is Auto

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
        if (isPlaying && !showSettings) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', resetIdleTimer);
    container.addEventListener('mouseenter', resetIdleTimer);
    container.addEventListener('mouseleave', () => {
      setShowControls(false);
      setShowSettings(false);
    });

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      container.removeEventListener('mousemove', resetIdleTimer);
      container.removeEventListener('mouseenter', resetIdleTimer);
    };
  }, [isPlaying, showSettings]);

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
      return true;
    }
    return false;
  }, [initialProgress]);

  // Double tap seek functionality
  const handleDoubleTapSeek = useCallback((event, direction) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;

    const isLeftTap = direction === 'left' || x < width / 2;
    const seekDir = isLeftTap ? 'backward' : 'forward';
    
    const currentVideoTime = video.currentTime;
    const seekTime = seekDir === 'forward' 
      ? Math.min(currentVideoTime + seekAmount, video.duration)
      : Math.max(currentVideoTime - seekAmount, 0);

    const wasPlaying = !video.paused;
    
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
    
    setSeekDirection(seekDir);
    setShowSeekIndicator(true);
    
    if (wasPlaying) {
      const playAfterSeek = () => {
        video.play().catch(console.error);
        video.removeEventListener('seeked', playAfterSeek);
      };
      video.addEventListener('seeked', playAfterSeek);
    }
    
    setTimeout(() => {
      setShowSeekIndicator(false);
    }, 800);
  }, [seekAmount]);

  const handleTap = useCallback((event) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    
    if (tapCountRef.current === 1 && timeSinceLastTap < 300) {
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
    
    lastTapRef.current = now;
  }, [handleDoubleTapSeek]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleVideoClick = useCallback((event) => {
    if (event.target.closest('.video-controls') || event.target.closest('.center-play-button') || event.target.closest('.settings-menu')) {
      return;
    }
    togglePlay();
  }, [togglePlay]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    setVolume(video.muted ? 0 : video.volume);
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      video.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
      setVolume(newVolume);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  const changePlaybackRate = useCallback((rate) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const handleQualityChange = useCallback((levelIndex) => {
    const hls = hlsRef.current;
    if (hls) {
      hls.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
    }
  }, []);

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

    const initPlayer = async () => {
      try {
        const Hls = (await import("hls.js")).default;
        const Plyr = (await import("plyr")).default;

        const video = videoRef.current;
        if (!video) return;

        // Cleanup
        if (plyrRef.current) plyrRef.current.destroy();
        if (hlsRef.current) hlsRef.current.destroy();
        plyrRef.current = null;
        hlsRef.current = null;

        video.pause();
        video.src = "";
        video.load();

        // Listeners cleanup
        const handlers = [
          { event: 'timeupdate', handler: progressHandlerRef.current },
          { event: 'waiting', handler: stallHandlerRef.current },
          { event: 'stalled', handler: stallHandlerRef.current },
          { event: 'play', handler: playHandlerRef.current },
          { event: 'ended', handler: endedHandlerRef.current },
          { event: 'loadedmetadata', handler: metadataHandlerRef.current },
        ];
        handlers.forEach(({ event, handler }) => {
          if (handler) video.removeEventListener(event, handler);
        });

        const handleEnded = () => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        };
        endedHandlerRef.current = handleEnded;

        const handleStall = () => {
          const now = Date.now();
          if (now - lastStallRecoveryRef.current < 3000) return;
          console.log('Stall detected, attempting recovery...');
          setTimeout(() => {
            if (video && !video.paused && video.readyState < 3) {
              lastStallRecoveryRef.current = now;
              video.currentTime += 0.1; 
              if (hlsRef.current) hlsRef.current.startLoad();
            }
          }, 1000);
        };
        stallHandlerRef.current = handleStall;
        playHandlerRef.current = onPlay;

        if (Hls.isSupported()) {
          const hls = new Hls({
            debug: false,
            enableWorker: true,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          });
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            const availableLevels = hls.levels.map((level, index) => ({
              height: level.height,
              index: index,
            }));
            // Add Auto option at the beginning
            setLevels([{ height: 'Auto', index: -1 }, ...availableLevels]);
            setCurrentLevel(hls.autoLevelEnabled ? -1 : hls.currentLevel);

            plyrRef.current = new Plyr(video, {
              controls: [],
              keyboard: { focused: true, global: true },
            });

            const handleMetadata = () => {
              setDuration(video.duration);
              setVolume(video.volume);
              setInitialTime();
              setIsLoading(false);
            };
            metadataHandlerRef.current = handleMetadata;

            const handleTimeUpdate = () => {
              if (!video.duration || !onProgress) return;
              const percent = Math.floor((video.currentTime / video.duration) * 100);
              setCurrentTime(video.currentTime);
              if (!hasSetInitialTimeRef.current && initialProgress > 0) setInitialTime();
              
              const now = Date.now();
              if (now - lastProgressEmitRef.current > 5000 || [25, 50, 75, 95].includes(percent)) {
                lastProgressEmitRef.current = now;
                onProgress(percent);
              }
            };

            progressHandlerRef.current = handleTimeUpdate;
            video.addEventListener("timeupdate", handleTimeUpdate);
            video.addEventListener('loadedmetadata', handleMetadata);
            video.addEventListener('play', () => { setIsPlaying(true); if (onPlay) onPlay(); });
            video.addEventListener('pause', () => setIsPlaying(false));
            video.addEventListener('ended', handleEnded);
            video.addEventListener('waiting', handleStall);
            video.addEventListener('stalled', handleStall);
          });

          hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            setCurrentLevel(hls.autoLevelEnabled ? -1 : data.level);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (retryCount < maxRetries) {
                    setRetryCount(retryCount + 1);
                    setTimeout(() => setRetryTrigger(prev => prev + 1), 1000 * retryCount);
                  } else {
                    setError("Network error: Failed to load video");
                    setIsLoading(false);
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  setError(`Video error: ${data.details}`);
                  setIsLoading(false);
                  break;
              }
            }
          });

          setTimeout(() => video.play().catch(() => setShowControls(true)), 500);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          const handleMetadata = () => {
            setIsLoading(false);
            setDuration(video.duration);
            setVolume(video.volume);
            setInitialTime();
            plyrRef.current = new Plyr(video, { controls: [], keyboard: { focused: true, global: true }});
            
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
            video.addEventListener('play', () => setIsPlaying(true));
            video.addEventListener('pause', () => setIsPlaying(false));
            video.addEventListener('ended', handleEnded);
          };
          metadataHandlerRef.current = handleMetadata;
          video.addEventListener('loadedmetadata', handleMetadata);
        } else {
          setError("HLS not supported in this browser");
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
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.src = '';
        video.load();
        [
          { event: 'timeupdate', handler: progressHandlerRef.current },
          { event: 'waiting', handler: stallHandlerRef.current },
          { event: 'stalled', handler: stallHandlerRef.current },
          { event: 'play', handler: playHandlerRef.current },
          { event: 'ended', handler: endedHandlerRef.current },
          { event: 'loadedmetadata', handler: metadataHandlerRef.current },
        ].forEach(({ event, handler }) => { if (handler) video.removeEventListener(event, handler); });
      }
      if (plyrRef.current) plyrRef.current.destroy();
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [src, isClient, retryTrigger, onPlay, onEnded, setInitialTime, onProgress, retryCount]);

  const handleRetry = useCallback(() => {
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
      // Changed rounded-lg to remove rounded corners in fullscreen for a cleaner look
      className="relative w-full h-full bg-black overflow-hidden select-none group"
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
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#63953a] mx-auto mb-3"></div>
            <p className=" text-xs text-gray-400">Loading video...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20 p-4">
          <p className="text-red-500 mb-4 font-semibold">{error}</p>
          <button onClick={handleRetry} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Seek Indicator - Modern Circular UI */}
      {showSeekIndicator && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="flex flex-col items-center justify-center animate-fade-in-up">
             <div className="bg-black/60 backdrop-blur-sm rounded-full p-6 border border-white/10 shadow-2xl flex items-center justify-center">
                {seekDirection === 'forward' ? (
                  <svg className="md:w-12 md:h-12 w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
                  </svg>
                ) : (
                  <svg className="md:w-12 md:h-12 w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 18V6l-8.5 6L11 18zm1.5-6l8.5 6V6l-8.5 6z"/>
                  </svg>
                )}
             </div>
            <div className="mt-4 bg-black/80 px-4 py-1 rounded-full text-white font-medium md:text-lg text-sm shadow-lg">
              {seekDirection === 'forward' ? '+' : '-'}{seekAmount}s
            </div>
          </div>
        </div>
      )}

      {/* Controls Container */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent 
        pt-12 pb-4 px-4 transition-opacity duration-300 video-controls z-10
        ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}>
        
        {/* Progress Bar - YouTube Style */}
        <div 
          className="relative h-1.5 bg-gray-600 rounded-full mb-4 cursor-pointer group/progress"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const video = videoRef.current;
            if (video) {
              const wasPlaying = !video.paused;
              video.currentTime = percent * video.duration;
              setCurrentTime(video.currentTime);
              if (wasPlaying) video.play().catch(console.error);
            }
          }}
        >
          <div 
          className="absolute h-full bg-[#63953a] rounded-full group-hover/progress:bg-[#71de18] transition-colors"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
          {/* Hover Thumb */}
          <div 
            className="absolute h-3.5 w-3.5 bg-white rounded-full shadow top-[0.75] opacity-0 group-hover/progress:opacity-100 transition-opacity transform scale-0 group-hover/progress:scale-100 duration-75"
            style={{ left: `${(currentTime / duration) * 100 || 0}%`, transform: 'translate(-50%, -50%) scale(1)' }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          
          {/* Left Group: Play, Volume, Time */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-transform hover:scale-105">
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            {/* YouTube Style Volume Slider */}
            <div className="group/vol flex items-center relative">
              <button 
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-transform hover:scale-105"
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                )}
              </button>
              
              <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 ease-out flex items-center ml-0 group-hover/vol:ml-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                />
              </div>
            </div>

            <div className="text-white text-xs sm:text-sm font-mono font-medium">
              <span>{formatTime(currentTime)}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Group: Settings, Fullscreen */}
          <div className="flex items-center space-x-3 sm:space-x-4 relative">
            
            {/* Settings Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-gray-300 transition-transform hover:scale-105 hover:rotate-90 duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
              </button>

              {showSettings && (
                <div className="absolute bottom-full right-0 z-20 mb-3 w-48 bg-black/90 backdrop-blur-md rounded-lg shadow-2xl border
                 border-white/10 overflow-hidden settings-menu animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-3">
                    <div className="text-gray-400 text-xs font-bold uppercase mb-2 tracking-wider">Quality</div>
                    <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto">
                      {levels.map((level) => (
                        <button
                          key={level.index}
                          onClick={() => handleQualityChange(level.index)}
                          className={`flex items-center justify-between text-sm px-3 py-1.5 rounded-md transition-colors ${
                            currentLevel === level.index ? 'text-[#63953a] bg-white/10' : 'text-white hover:bg-white/5'
                          }`}
                        >
                          <span>{level.height === 'Auto' ? 'Auto' : `${level.height}p`}</span>
                          {currentLevel === level.index && (
                            <svg className="w-4 h-4 text-[#63953a]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="h-px bg-white/10 my-3"></div>

                    <div className="text-gray-400 text-xs font-bold uppercase mb-2 tracking-wider">Speed</div>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`text-xs py-1 rounded transition-colors ${
                            playbackRate === rate ? 'text-[#63953a] bg-white/10 font-bold' : 'text-white hover:bg-white/5'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Double Tap Hint Areas (Invisible) */}
      <div className="absolute inset-0 flex pointer-events-none z-0">
        <div className="flex-1 h-full" /> {/* Left Side Hint Area */}
        <div className="flex-1 h-full" /> {/* Right Side Hint Area */}
      </div>

      <video
        ref={videoRef}
        // CHANGED object-contain to object-cover
        className="w-full h-full object-cover"
        playsInline
        preload="metadata"
      />

      {/* Center Play Button */}
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-2 animate-in zoom-in duration-300">
            <svg className="lg:w-12 lg:h-12 md:w-8 md:h-8 h-6 w-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}