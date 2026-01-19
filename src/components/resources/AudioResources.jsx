"use client";

import React, { useEffect, useRef, useState } from "react";

export default function AudioResources({ audioList = [] }) {
  const audioRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nowPlayingId, setNowPlayingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durations, setDurations] = useState({});

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);

      const id = audioList[currentIndex]?._id;
      if (id && !durations[id]) {
        setDurations((p) => ({ ...p, [id]: audio.duration || 0 }));
      }
    };

    const onTimeUpdate = () => {
      if (!audio.duration) return;
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [currentIndex, audioList, durations]);

  const togglePlayOnIndex = (index) => {
    const audio = audioRef.current;
    if (!audio) return;
    setNowPlayingId(audioList[index]._id);

    if (index === currentIndex) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(() => { });
        setIsPlaying(true);
      }
      return;
    }

    setCurrentIndex(index);
    setCurrentTime(0);
    setProgress(0);
    setIsPlaying(true);
  };


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = getPlayableSrc(audioList[currentIndex]?.links?.[0]);
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;

    audio.currentTime = ratio * audio.duration;
    setCurrentTime(audio.currentTime);
    setProgress(ratio * 100);
  };

  const formatTime = (s = 0) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60)
      .toString()
      .padStart(2, "0")}`;

  const getPlayableSrc = (url = "") => {
    if (url.includes("drive.google.com/uc")) return url;
    const id = url.match(/\/d\/([^/]+)/)?.[1];
    return id
      ? `https://drive.google.com/uc?export=download&id=${id}`
      : url;
  };

  if (!audioList.length) return null;

  return (
    <div className="max-w-[900px] mx-auto px-4 space-y-2 mb-10 md:mt-6 mt-0">
      <audio ref={audioRef} preload="metadata" />

      {audioList.map((audio, idx) => {
        const isCurrent = nowPlayingId === audio._id;
        const isPlayingCurrent = isCurrent && isPlaying;

        return (
          <div
            key={audio._id}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl border
              ${isCurrent
                ? "bg-green/5 border-green"
                : "bg-white border-gray-200"}
            `}
          >
            {/* Play Button */}
            <button
              onClick={() => togglePlayOnIndex(idx)}
              className={`w-10 h-10 rounded-full flex items-center justify-center
                ${isPlayingCurrent ? "bg-green" : "bg-gray-100"}
              `}
            >
              {isPlayingCurrent ? (
                <svg width="18" height="18" fill="#fff" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="#63953a" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Title + Timeline */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {idx + 1}. {audio.title}
              </p>

              {isCurrent && (
                <>
                  <div
                    onClick={handleSeek}
                    className="mt-1 h-1 bg-gray-200 rounded-full cursor-pointer"
                  >
                    <div
                      className="h-full bg-green"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>
                      {formatTime(durations[audio._id] || duration)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Equalizer */}
            {isPlayingCurrent && (
              <div className="flex gap-[2px] h-4 items-end">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="w-[3px] bg-green animate-[eq_1s_infinite]"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            <a
              href={getPlayableSrc(audio.links?.[0])}
              download
              className="p-2 rounded-full hover:bg-gray-100"
              title="Download"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#63953a"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
            </a>
          </div>
        );
      })}
    </div>
  );
}
