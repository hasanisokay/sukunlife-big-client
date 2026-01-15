"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import BlogContent from "../blogs/BlogContnet";

export default function AudioSection({ audioList = [] }) {
  const audioRef = useRef(null);
  const pendingSeekRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [nowPlayingId, setNowPlayingId] = useState(audioList?.[0]?._id ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      const pending = pendingSeekRef.current;
      if (pending && pending.index === currentIndex) {
        audio.currentTime = (pending.ratio || 0) * (audio.duration || 0);
        setProgress((pending.ratio || 0) * 100);
        pendingSeekRef.current = null;
      }
    };

    const onTimeUpdate = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
        return;
      }
      handleNext();
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, repeat]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioList?.length) return;

    if (isPlaying) {
      audio
        .play()
        .then(() => {
          /* playing */
        })
        .catch((err) => {
          // autoplay blocked or network error
          console.warn("Audio play failed:", err);
          setIsPlaying(false);
        });
    } else {
      audio.pause();
    }
    // reset progress when switching tracks (progress will then update on 'timeupdate')
    setProgress(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isPlaying]);

  // --- control helpers
  const playIndex = (index) => {
    if (!audioList || !audioList[index]) return;
    setCurrentIndex(index);
    setNowPlayingId(audioList[index]._id || null);
    setIsPlaying(true);
  };

  const togglePlayOnIndex = (index) => {
    // If clicking play/pause on the same track
    if (index === currentIndex) {
      // toggle play/pause
      setIsPlaying((p) => {
        const next = !p;
        // attempt immediate play/pause on the element to keep UI in sync
        const audio = audioRef.current;
        if (audio) {
          if (next) audio.play().catch(() => setIsPlaying(false));
          else audio.pause();
        }
        return next;
      });
      return;
    }

    // If clicking on different track -> start that track
    setCurrentIndex(index);
    setNowPlayingId(audioList[index]._id || null);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (!audioList || audioList.length === 0) return;
    if (shuffle) {
      // try to get a different index than current
      if (audioList.length === 1) {
        setCurrentIndex(0);
        setNowPlayingId(audioList[0]._id || null);
        setIsPlaying(true);
        return;
      }
      let next;
      do {
        next = Math.floor(Math.random() * audioList.length);
      } while (next === currentIndex);
      setCurrentIndex(next);
      setNowPlayingId(audioList[next]._id || null);
      setIsPlaying(true);
      return;
    }

    const nextIndex = (currentIndex + 1) % audioList.length;
    setCurrentIndex(nextIndex);
    setNowPlayingId(audioList[nextIndex]._id || null);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!audioList || audioList.length === 0) return;
    const prevIndex =
      currentIndex === 0 ? audioList.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setNowPlayingId(audioList[prevIndex]._id || null);
    setIsPlaying(true);
  };

  // Seek by clicking on progress bar of a card.
  // If user clicks on a non-loaded track, we set a pending seek and switch to that track.
  const handleProgressClick = (e, index) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));

    const audio = audioRef.current;
    if (!audio) return;

    if (index !== currentIndex) {
      // set pending seek so it will be applied once metadata loads for the new track
      pendingSeekRef.current = { index, ratio };
      setCurrentIndex(index);
      setNowPlayingId(audioList[index]._id || null);
      setIsPlaying(true);
      // progress will be updated after loadedmetadata handler sets currentTime
      return;
    }

    // same track -> set currentTime immediately
    if (audio.duration) {
      audio.currentTime = ratio * audio.duration;
      setProgress(ratio * 100);
    }
  };

  // Small helpers to format time (optional)
  const formatTime = (seconds = 0) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // If audioList changes, reset to first track gracefully
  useEffect(() => {
    if (!audioList || audioList.length === 0) return;
    if (!audioList[currentIndex]) {
      setCurrentIndex(0);
      setNowPlayingId(audioList[0]._id || null);
      setIsPlaying(false);
      setProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioList]);

  // protect when list empty
  if (!audioList || audioList.length === 0) {
    return null;
  }

  // get the direct download link if its not direct
  const getPlayableSrc = (url = "") => {
    if (!url) return "";

    // Already a direct Drive download link
    if (url.includes("drive.google.com/uc?")) {
      return url;
    }

    // /file/d/FILE_ID/...
    let match = url.match(/\/file\/d\/([^/]+)/);
    if (match?.[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }

    // open?id=FILE_ID
    match = url.match(/[?&]id=([^&]+)/);
    if (match?.[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }

    return url;
  };


  return (
    <div >

      <audio
        ref={audioRef}
        src={getPlayableSrc(audioList[currentIndex]?.links?.[0])}
        preload="metadata"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 max-w-[1200px] mx-auto justify-center  gap-8">
        {audioList.map((audio, idx) => {
          const isCurrent = nowPlayingId === audio._id;
          return (
            <div
              key={audio._id}
              className={`flex md:gap-[30px] gap-2 items-start  flex-wrap transition-all `}
            >

              {audio?.coverPhoto && <Image
                src={audio.coverPhoto}
                alt={audio.title}
                width={400}
                height={300}
                className={`h-[244px] w-[255px] rounded-[27px] object-cover `}
              />}
              <div className="p-2 flex-1 w-[258px] h-[244px] ">
                <h3 className="font-bold text-[20px] line-clamp-2 min-h-[48px]" title={audio.title}>{audio.title}</h3>

                <div className="h-[100px]  overflow-y-auto text-sm text-gray-700 mt-2 mb-3">
                  <BlogContent content={audio?.description || ""} />
                </div>

                {/* Progress bar */}
                <div
                  className="w-full h-1 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => handleProgressClick(e, idx)}
                >
                  <div
                    className="h-3 bg-green transition-all"
                    style={{
                      width: `${isCurrent ? progress : 0}%`,
                    }}
                  />
                </div>
                {/* time of playing */}
                {!isCurrent ? <div className="flex text-sm text-black font-semibold leading-none h-[16px] items-center justify-between">
                  <p >0:00</p>
                  <p className="pr-2" >0:00</p>

                </div> : <div className="flex text-sm text-black font-semibold leading-none h-[16px] items-center justify-between">
                  <p>{formatTime((progress / 100) * duration)}</p>
                  <p className="pr-2">{formatTime(
                    duration
                  )}</p>

                </div>}

                <div className="flex items-center justify-between mt-3">
                  {/* shuffle button */}
                  <button
                    onClick={() => setShuffle((s) => !s)}
                    title="Shuffle"
                    className={`p-1`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      fill="none"
                      viewBox="0 0 19 19"
                    >
                      <path
                        stroke={`${(shuffle && isCurrent) ? "#000000" : "#63953a"}`}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12.666 2.747h3.958v3.75M3.166 15.497l13.458-12.75M16.624 12.497v3.75h-3.958M11.875 11.747l4.75 4.5M3.166 3.497l3.958 3.75"
                      ></path>
                    </svg>
                  </button>
                  {/* left controls (prev) */}
                  <button
                    onClick={() => {
                      // If user clicks prev on a non-current track: jump to that track's previous
                      if (!isCurrent) {
                        playIndex(idx === 0 ? audioList.length - 1 : idx - 1);
                      } else {
                        handlePrev();
                      }
                    }}
                    aria-label="Previous"
                    className="p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      fill="none"
                      viewBox="0 0 19 19"
                    >
                      <path
                        stroke="#63953A"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m15.042 15.497-7.917-6 7.917-6zM3.959 14.747v-10.5"
                      ></path>
                    </svg>

                  </button>
                  {/* center play button */}
                  <button
                    onClick={() => togglePlayOnIndex(idx)}
                    aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
                    className={`bg-green border play-button-shadow ${isCurrent && isPlaying && 'play-button'} border-gray-200 rounded-full p-3 shadow hover:scale-105 transition-transform`}
                  >
                    {isCurrent && isPlaying ? (
                      // Pause large
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        fill="#ffffff"
                        viewBox="0 0 24 24"
                        className="text-white bg-green"
                      >
                        <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                      </svg>
                    ) : (
                      // Play large
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        fill="#ffffff"
                        viewBox="0 0 24 24"
                        className="text-white bg-green"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>


                  {/* right controls: Next */}
                  <button
                    onClick={() => {
                      if (!isCurrent) {
                        const nextIdx = (idx + 1) % audioList.length;
                        playIndex(nextIdx);
                      } else {
                        handleNext();
                      }
                    }}
                    aria-label="Next"
                    className="p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      fill="none"
                      viewBox="0 0 19 19"
                    >
                      <path
                        stroke="#63953A"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m3.959 3.497 7.917 6-7.917 6zM15.041 4.247v10.5"
                      ></path>
                    </svg>
                  </button>
                  {/* repeat button */}
                  <button
                    onClick={() => setRepeat((r) => !r)}
                    title="Repeat"
                    className={`p-1 `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      fill="none"
                      viewBox="0 0 19 19"
                    >
                      <g
                        stroke={`${(repeat && isCurrent) ? "#000000" : "#63953a"}`}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        clipPath="url(#clip0_135_701)"
                      >
                        <path d="m13.459 1.247 3.167 3-3.167 3"></path>
                        <path d="M2.375 8.747v-1.5c0-.796.334-1.559.928-2.121a3.26 3.26 0 0 1 2.239-.879h11.083M5.542 17.747l-3.167-3 3.167-3"></path>
                        <path d="M16.625 10.247v1.5c0 .796-.334 1.559-.928 2.121-.593.563-1.399.88-2.239.88H2.375"></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_135_701">
                          <path fill="#fff" d="M0 .497h19v18H0z"></path>
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
