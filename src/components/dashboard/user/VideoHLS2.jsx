"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function VideoHLS2({
  src,
  initialProgress = 0,
  onProgress,
  onPlay,
  onEnded,
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [playbackRate, setPlaybackRate] = useState(1);

  const lastEmit = useRef(0);
  const lastTap = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const q = hls.levels.map((l, i) => ({
          height: l.height,
          index: i,
        }));
        setLevels([{ height: "Auto", index: -1 }, ...q]);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(hls.autoLevelEnabled ? -1 : data.level);
      });
    } else {
      video.src = src;
    }

    const handleLoaded = () => {
      if (initialProgress > 0 && video.duration) {
        video.currentTime = (initialProgress / 100) * video.duration;
      }
    };

    const handleTime = () => {
      if (!video.duration || !onProgress) return;
      const pct = Math.floor((video.currentTime / video.duration) * 100);
      const now = Date.now();
      if (now - lastEmit.current > 5000 || [25,50,75,95].includes(pct)) {
        lastEmit.current = now;
        onProgress(pct);
      }
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTime);
    video.addEventListener("play", onPlay || (()=>{}));
    video.addEventListener("ended", onEnded || (()=>{}));

    return () => {
      video.pause();
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [src]);

  const changeQuality = (index) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = index;
    setCurrentLevel(index);
  };

  const handleTap = (e) => {
    const now = Date.now();
    const delta = now - lastTap.current;
    lastTap.current = now;

    if (delta < 300) {
      const rect = videoRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const seek = x < rect.width / 2 ? -10 : 10;
      videoRef.current.currentTime += seek;
    }
  };

  return (
    <div className="w-full h-full bg-black relative">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-contain"
        onTouchStart={handleTap}
      />

      {/* Simple overlay settings */}
      <div className="absolute top-2 right-2 bg-black/60 rounded p-2 text-white text-xs">
        <div className="mb-1">Quality</div>
        {levels.map((l) => (
          <button
            key={l.index}
            onClick={() => changeQuality(l.index)}
            className={`block px-2 py-1 ${
              currentLevel === l.index ? "text-green-400" : ""
            }`}
          >
            {l.height === "Auto" ? "Auto" : `${l.height}p`}
          </button>
        ))}

        <div className="mt-2">Speed</div>
        {[0.5,1,1.25,1.5,2].map((r) => (
          <button
            key={r}
            onClick={() => {
              videoRef.current.playbackRate = r;
              setPlaybackRate(r);
            }}
            className={`block px-2 py-1 ${
              playbackRate === r ? "text-green-400" : ""
            }`}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}
