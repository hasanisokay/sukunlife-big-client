import { useEffect, useRef } from "react";
import "plyr/dist/plyr.css";

export function useHlsPlayer({
  videoRef,
  src,
  initialProgress = 0,
  onPlay,
  onProgress,
  onEnded,
  onError,
}) {
  const hlsRef = useRef(null);
  const plyrRef = useRef(null);
  const hasSeekedRef = useRef(false);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    let destroyed = false;
    const video = videoRef.current;

    const cleanup = () => {
      if (plyrRef.current) {
        plyrRef.current.destroy();
        plyrRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    const init = async () => {
      const Hls = (await import("hls.js")).default;
      const Plyr = (await import("plyr")).default;

      cleanup();

      const setInitialTime = () => {
        if (hasSeekedRef.current) return;
        if (!video.duration || !initialProgress) return;

        video.currentTime = (initialProgress / 100) * video.duration;
        hasSeekedRef.current = true;
      };

      const handleTimeUpdate = () => {
        if (!video.duration || !onProgress) return;
        const percent = (video.currentTime / video.duration) * 100;
        if (percent - lastProgressRef.current >= 5) {
          lastProgressRef.current = percent;
          onProgress(Math.round(percent));
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", setInitialTime);
      if (onPlay) video.addEventListener("play", onPlay);
      if (onEnded) video.addEventListener("ended", onEnded);

      if (Hls.isSupported()) {
        const hls = new Hls({
          startLevel: -1,
          maxBufferLength: 30,
          backBufferLength: 30,
        });

        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const qualities = hls.levels
            .map(l => l.height)
            .filter(Boolean)
            .sort((a, b) => b - a);

          plyrRef.current = new Plyr(video, {
            controls: [
              "play",
              "progress",
              "current-time",
              "mute",
              "volume",
              "settings",
              "fullscreen",
            ],
            quality: {
              default: qualities[0],
              options: qualities,
              forced: true,
              onChange: q => {
                const i = hls.levels.findIndex(l => l.height === q);
                if (i !== -1) hls.currentLevel = i;
              },
            },
          });

          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              onError?.(data.details || "Video error");
            }
          }
        });
      } 
      // Safari native HLS
      else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;

        plyrRef.current = new Plyr(video, {
          controls: [
            "play",
            "progress",
            "current-time",
            "mute",
            "volume",
            "fullscreen",
          ],
        });

        video.addEventListener("loadedmetadata", () => {
          setInitialTime();
          video.play().catch(() => {});
        });
      } else {
        onError?.("HLS not supported");
      }

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", setInitialTime);
        if (onPlay) video.removeEventListener("play", onPlay);
        if (onEnded) video.removeEventListener("ended", onEnded);
      };
    };

    let removeListeners;

    init().then(fn => {
      if (!destroyed) removeListeners = fn;
    });

    return () => {
      destroyed = true;
      removeListeners?.();
      cleanup();
    };
  }, [src, videoRef, initialProgress, onPlay, onProgress, onEnded, onError]);
}
