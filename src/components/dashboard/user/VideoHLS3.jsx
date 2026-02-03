"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export default function VideoHLS3({
  src,
  onPlayy,
  onProgress,
  initialProgress = 0,
  onEnded,
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);

  // Timers & state refs
  const idleTimerRef = useRef(null);
  const lastProgressEmitRef = useRef(0);
  const hasSetInitialTimeRef = useRef(false);

  // Double-tap / tap detection
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);
  const tapStartXRef = useRef(0);

  // Seek indicator flash
  const seekFlashTimerRef = useRef(null);

  // ── UI State ──────────────────────────────────────────────
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Quality
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);

  // Seek flash overlay
  const [seekFlash, setSeekFlash] = useState(null);

  const maxRetries = 3;
  const SEEK_AMOUNT = 10;

  // ── Helpers ──────────────────────────────────────────────
  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Controls auto-hide logic ─────────────────────────────
  const resetIdleTimer = useCallback(() => {
    setShowControls(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
    // Don't hide controls if video is paused
    if (!isPlaying) {
      return;
    }
    
    // In fullscreen, we hide controls regardless of hover
    // On normal screen, we hide only if not hovering
    if (!isFullscreen && isHovering) {
      return;
    }
    
    idleTimerRef.current = setTimeout(() => {
      setShowControls(false);
      setShowSettings(false);
    }, 2000);
  }, [isPlaying, isHovering, isFullscreen]);

  // ── Handle mouse/touch enter/leave ──────────────────────
  const handlePointerEnter = useCallback(() => {
    setIsHovering(true);
    setShowControls(true);
    resetIdleTimer();
  }, [resetIdleTimer]);

  const handlePointerLeave = useCallback(() => {
    setIsHovering(false);
    // Only hide controls if video is playing AND we're not in fullscreen
    if (isPlaying && !isFullscreen) {
      setShowControls(false);
    }
    setShowSettings(false);
  }, [isPlaying, isFullscreen]);

  // ── Handle any activity in the player ───────────────────
  const handleActivity = useCallback(() => {
    setShowControls(true);
    resetIdleTimer();
  }, [resetIdleTimer]);

  // ── Fullscreen handling ─────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
    handleActivity();
  }, [handleActivity]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      // When entering fullscreen, always show controls briefly
      if (isNowFullscreen) {
        setShowControls(true);
        resetIdleTimer();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [resetIdleTimer]);

  // ── Seek helpers ──────────────────────────────────────────
  const seekBy = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.min(Math.max(video.currentTime + seconds, 0), video.duration);
    video.currentTime = target;
    setCurrentTime(target);

    const dir = seconds > 0 ? "right" : "left";
    setSeekFlash({ direction: dir, amount: Math.abs(seconds) });
    if (seekFlashTimerRef.current) clearTimeout(seekFlashTimerRef.current);
    seekFlashTimerRef.current = setTimeout(() => setSeekFlash(null), 900);
    
    handleActivity();
  }, [handleActivity]);

  // ── Play / Pause ──────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
    handleActivity();
  }, [handleActivity]);

  // ── Volume ────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) setVolume(video.volume);
    handleActivity();
  }, [handleActivity]);

  const handleVolumeChange = useCallback((e) => {
    const v = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = v;
    video.muted = v === 0;
    setIsMuted(v === 0);
    setVolume(v);
    handleActivity();
  }, [handleActivity]);

  // ── Quality / Speed ───────────────────────────────────────
  const handleQualityChange = useCallback((idx) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = idx;
      setCurrentLevel(idx);
    }
    setShowSettings(false);
    handleActivity();
  }, [handleActivity]);

  const changePlaybackRate = useCallback((rate) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    }
    setShowSettings(false);
    handleActivity();
  }, [handleActivity]);

  // ── Progress bar click ────────────────────────────────────
  const handleProgressClick = useCallback((e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const video = videoRef.current;
    if (video && video.duration) {
      video.currentTime = pct * video.duration;
      setCurrentTime(video.currentTime);
    }
    handleActivity();
  }, [handleActivity]);

  // ── Pointer / Tap handling ────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    // Ignore if it hits a control button / settings / progress bar
    if (
      e.target.closest("[data-controls]") ||
      e.target.closest("[data-settings]") ||
      e.target.closest("[data-progress]")
    ) {
      return;
    }

    tapStartXRef.current = e.clientX;
    tapCountRef.current += 1;

    if (tapCountRef.current === 1) {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
        togglePlay();
        handleActivity();
      }, 250);
    } else if (tapCountRef.current === 2) {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapCountRef.current = 0;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      seekBy(x < rect.width / 2 ? -SEEK_AMOUNT : SEEK_AMOUNT);
      handleActivity();
    }
  }, [togglePlay, seekBy, handleActivity]);

  // ── Client-side guard ─────────────────────────────────────
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ── Event listeners for controls visibility ──────────────
  useEffect(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    // Always show controls when video is paused
    if (!isPlaying) {
      setShowControls(true);
    }

    // Set up event listeners
    el.addEventListener("pointerenter", handlePointerEnter);
    el.addEventListener("pointerleave", handlePointerLeave);
    el.addEventListener("pointermove", handleActivity);
    el.addEventListener("touchstart", handleActivity);

    // For fullscreen: track mouse movement on the whole screen
    const handleFullscreenMouseMove = (e) => {
      if (isFullscreen) {
        handleActivity();
      }
    };

    // Also track mouse movement on the video itself in fullscreen
    const handleVideoMouseMove = (e) => {
      if (isFullscreen) {
        handleActivity();
      }
    };

    if (isFullscreen) {
      document.addEventListener("mousemove", handleFullscreenMouseMove);
      video.addEventListener("mousemove", handleVideoMouseMove);
    }

    video.addEventListener("play", () => {
      setIsPlaying(true);
      resetIdleTimer();
    });

    video.addEventListener("pause", () => {
      setIsPlaying(false);
      setShowControls(true);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    });

    return () => {
      el.removeEventListener("pointerenter", handlePointerEnter);
      el.removeEventListener("pointerleave", handlePointerLeave);
      el.removeEventListener("pointermove", handleActivity);
      el.removeEventListener("touchstart", handleActivity);
      document.removeEventListener("mousemove", handleFullscreenMouseMove);
      video.removeEventListener("mousemove", handleVideoMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [handlePointerEnter, handlePointerLeave, handleActivity, resetIdleTimer, isPlaying, isFullscreen]);

  // ── Click outside settings handler ──────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Only close settings if clicking outside the settings dropdown
      if (showSettings && !e.target.closest('[data-settings]')) {
        setShowSettings(false);
      }
    };

    // Use setTimeout to ensure this runs after the click event that opened the settings
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showSettings]);

  // ── HLS initialisation ──────────────────────────────────
  useEffect(() => {
    if (!isClient || !src) return;

    setIsLoading(true);
    setError(null);
    hasSetInitialTimeRef.current = false;

    let destroyed = false;
    const video = videoRef.current;
    if (!video) return;

    // Reset video element cleanly
    video.pause();
    video.removeAttribute("src");
    video.load();

    const initPlayer = async () => {
      try {
        const Hls = (await import("hls.js")).default;

        if (destroyed) return;

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

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (destroyed) return;
            const lvls = hls.levels.map((l, i) => ({ height: l.height, index: i }));
            setLevels([{ height: "Auto", index: -1 }, ...lvls]);
            setCurrentLevel(-1);
          });

          hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
            if (destroyed) return;
            setCurrentLevel(hls.autoLevelEnabled ? -1 : data.level);
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (destroyed) return;
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setRetryCount((c) => {
                  if (c < maxRetries) {
                    setTimeout(() => setRetryTrigger((t) => t + 1), 1000 * (c + 1));
                    return c + 1;
                  }
                  setError("Network error – failed to load video.");
                  setIsLoading(false);
                  return c;
                });
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                setError(`Video error: ${data.details}`);
                setIsLoading(false);
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else {
          setError("HLS is not supported in this browser.");
          setIsLoading(false);
          return;
        }

        const onLoadedMetadata = () => {
          if (destroyed) return;
          setDuration(video.duration);
          setVolume(video.volume);
          setIsMuted(video.muted);

          if (!hasSetInitialTimeRef.current && initialProgress > 0 && video.duration) {
            video.currentTime = (initialProgress / 100) * video.duration;
            hasSetInitialTimeRef.current = true;
          }
          setIsLoading(false);
        };

        const onTimeUpdate = () => {
          if (destroyed) return;
          setCurrentTime(video.currentTime);

          if (video.buffered.length > 0) {
            setBuffered(video.buffered.end(video.buffered.length - 1));
          }

          if (onProgress && video.duration) {
            const pct = Math.floor((video.currentTime / video.duration) * 100);
            const now = Date.now();
            if (now - lastProgressEmitRef.current > 5000 || [25, 50, 75, 95].includes(pct)) {
              lastProgressEmitRef.current = now;
              onProgress(pct);
            }
          }
        };

        const onPlay = () => { if (!destroyed) setIsPlaying(true); if (onPlayy) onPlayy(); };
        const onPlayCb = () => { if (!destroyed) { setIsPlaying(true); if (onPlayy) onPlayy(); } };
        const onPause = () => { if (!destroyed) setIsPlaying(false); };
        const onEnded_ = () => { if (!destroyed) { setIsPlaying(false); if (onEnded) onEnded(); } };
        const onWaiting = () => { };

        video.addEventListener("loadedmetadata", onLoadedMetadata);
        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("play", onPlayCb);
        video.addEventListener("pause", onPause);
        video.addEventListener("ended", onEnded_);
        video.addEventListener("waiting", onWaiting);

        video._cleanupHandlers = { onLoadedMetadata, onTimeUpdate, onPlayCb, onPause, onEnded_, onWaiting };

        video.play().catch(() => setShowControls(true));

      } catch (err) {
        if (!destroyed) {
          console.error("Player init error:", err);
          setError(`Player initialization failed: ${err.message}`);
          setIsLoading(false);
        }
      }
    };

    initPlayer();

    return () => {
      destroyed = true;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
        const h = video._cleanupHandlers;
        if (h) {
          video.removeEventListener("loadedmetadata", h.onLoadedMetadata);
          video.removeEventListener("timeupdate", h.onTimeUpdate);
          video.removeEventListener("play", h.onPlayCb);
          video.removeEventListener("pause", h.onPause);
          video.removeEventListener("ended", h.onEnded_);
          video.removeEventListener("waiting", h.onWaiting);
          delete video._cleanupHandlers;
        }
      }
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (seekFlashTimerRef.current) clearTimeout(seekFlashTimerRef.current);
    };
  }, [src, isClient, retryTrigger, initialProgress, onPlayy, onProgress, onEnded]);

  // ── Keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          seekBy(5);
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekBy(-5);
          break;
        case "ArrowUp":
          e.preventDefault();
          {
            const video = videoRef.current;
            if (video) {
              const nv = Math.min(video.volume + 0.1, 1);
              video.volume = nv;
              video.muted = false;
              setVolume(nv);
              setIsMuted(false);
            }
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          {
            const video = videoRef.current;
            if (video) {
              const nv = Math.max(video.volume - 0.1, 0);
              video.volume = nv;
              setVolume(nv);
              if (nv === 0) setIsMuted(true);
            }
          }
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
      handleActivity();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seekBy, toggleMute, toggleFullscreen, handleActivity]);

  // ── Retry ─────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    setRetryTrigger((t) => t + 1);
  }, []);

  // ── Derived ───────────────────────────────────────────────
  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  // ── Controls visibility logic ───────────────────────────
  const shouldShowControls = showControls || !isPlaying;

  // ── Render ────────────────────────────────────────────────
  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center">
        <span className="text-white text-sm">Initializing…</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative group w-full h-full bg-black overflow-hidden select-none"
      style={{ touchAction: "manipulation" }}
      onPointerDown={handlePointerDown}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
      />

      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#63953a] mx-auto mb-3" />
            <p className="text-xs text-gray-400">Loading video…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-4">
          <p className="text-red-400 mb-4 font-semibold text-center">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {seekFlash && (
        <div
          className={`absolute top-0 bottom-0 z-10 flex items-center justify-center pointer-events-none
            ${seekFlash.direction === "left" ? "left-0 w-1/3" : "right-0 w-1/3"}`}
          style={{ animation: "seekFlashIn 0.9s ease-out forwards" }}
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 flex flex-col items-center gap-2">
            {seekFlash.direction === "left" ? (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6v12l8.5-6zm12 0h-2v12h2z" />
              </svg>
            )}
            <span className="text-white font-bold text-lg">
              {seekFlash.direction === "left" ? "-" : "+"}
              {seekFlash.amount}s
            </span>
          </div>
        </div>
      )}

      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-3">
            <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* ── Controls gradient + bar ────────────────────────── */}
      <div
        data-controls
        className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 
          ${shouldShowControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          paddingTop: "48px",
          paddingBottom: "12px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        {/* Progress bar */}
        <div
          data-progress
          className="relative h-1 bg-gray-600 rounded-full mb-3 cursor-pointer group/prog"
          onClick={handleProgressClick}
          style={{ touchAction: "manipulation" }}
        >
          <div
            className="absolute inset-y-0 left-0 bg-gray-500 rounded-full"
            style={{ width: `${bufferedPct}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-[#63953a] rounded-full z-10 group-hover/prog:bg-[#71de18] transition-colors"
            style={{ width: `${progressPct}%` }}
          />
          <div
            className="absolute top-1/2 z-20 w-3.5 h-3.5 bg-white rounded-full shadow-md -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/prog:opacity-100 transition-opacity"
            style={{ left: `${progressPct}%` }}
          />
        </div>

        {/* Bottom row: play | vol | time ···· settings | fullscreen */}
        <div className="flex items-center justify-between">
          {/* Left cluster */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-300 transition-transform hover:scale-110 w-6 h-6 flex items-center justify-center"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <div className="group/vol flex items-center">
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-transform hover:scale-110 w-6 h-6 flex items-center justify-center"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27l16.73 16.73L21 19.73l-4.3-4.3c-.16.1-.32.2-.5.28-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64L19.73 21 21 19.73 4.27 3z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <div className="hidden sm:flex items-center overflow-hidden w-0 group-hover/vol:w-20 transition-all duration-250 ease-out ml-0 group-hover/vol:ml-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 accent-[#63953a] cursor-pointer"
                />
              </div>
            </div>

            <span className="text-white text-xs font-mono">
              {formatTime(currentTime)}
              <span className="text-gray-500 mx-1">/</span>
              <span className="text-gray-400">{formatTime(duration)}</span>
            </span>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            {/* Settings and Fullscreen buttons */}
            <div className="flex items-center gap-3">
              {/* Settings gear */}
              <div className="relative" data-settings>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettings((s) => !s);
                  }}
                  className="text-white hover:text-gray-300 transition-transform hover:scale-110 hover:rotate-90 duration-200 w-6 h-6 flex items-center justify-center"
                  aria-label="Settings"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                  </svg>
                </button>

                {/* Settings dropdown - Fixed z-index and positioning */}
                {showSettings && (
                  <div
                    className="absolute bottom-full right-0 mb-2 w-48 bg-black/95 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <div className="p-3">
                      <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                        Quality
                      </div>
                      <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto">
                        {levels.map((l) => (
                          <button
                            key={l.index}
                            onClick={() => handleQualityChange(l.index)}
                            className={`flex items-center justify-between text-sm px-2 py-1.5 rounded transition-colors ${
                              currentLevel === l.index
                                ? "text-[#63953a] bg-white/10"
                                : "text-white hover:bg-white/5"
                            }`}
                          >
                            <span>{l.height === "Auto" ? "Auto" : `${l.height}p`}</span>
                            {currentLevel === l.index && (
                              <svg className="w-4 h-4 text-[#63953a]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="h-px bg-white/10 my-2" />

                      <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                        Speed
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                          <button
                            key={r}
                            onClick={() => changePlaybackRate(r)}
                            className={`text-xs py-1 rounded transition-colors ${
                              playbackRate === r
                                ? "text-[#63953a] bg-white/10 font-bold"
                                : "text-white hover:bg-white/5"
                            }`}
                          >
                            {r}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen button */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-transform hover:scale-110 w-6 h-6 flex items-center justify-center"
                aria-label="Fullscreen"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes seekFlashIn {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}