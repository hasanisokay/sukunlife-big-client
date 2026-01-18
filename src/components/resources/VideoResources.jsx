"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ReactPlayer from "react-player";
import { useRouter, useSearchParams } from "next/navigation";
import capitalize from "@/utils/capitalize.mjs";
import resourceCover from "@/../public/images/resources.jpg";
import EmptyState from "../shared/EmptyState";

// detect direct video file
const isDirectVideo = (url) => /\.(mp4|webm|ogg|mov)$/i.test(url || "");

const LANG_OPTIONS = [
  { key: "all", label: "All Languages" },
  { key: "arabic", label: "Arabic" },
  { key: "english", label: "English" },
  { key: "bangla", label: "Bangla" },
  { key: "urdu", label: "Urdu" },
  { key: "other", label: "Others" },
];

const VideoResources = ({ videos = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeLang = (searchParams.get("lang") || "all").toLowerCase();

  const [activeVideo, setActiveVideo] = useState(null);
  const videoRefs = useRef({});

  // stop other videos when one starts playing
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, el]) => {
      if (id !== activeVideo && el?.pause) {
        el.pause();
        el.currentTime = 0;
      }
    });
  }, [activeVideo]);

  // filter videos by language
  const filteredVideos = useMemo(() => {
    if (activeLang === "all") return videos;

    if (activeLang === "other") {
      return videos.filter(
        (v) =>
          !["arabic", "english", "bangla", "urdu"].includes(
            (v.videoLang || "").toLowerCase()
          )
      );
    }

    return videos.filter(
      (v) => (v.videoLang || "").toLowerCase() === activeLang
    );
  }, [videos, activeLang]);

  const setLang = (lang) => {
    const params = new URLSearchParams(searchParams.toString());
    if (lang === "all") params.delete("lang");
    else params.set("lang", lang);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <section id="video" className="mt-12 max-w-[1200px] mx-auto px-4">

      {/* Language Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {LANG_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLang(key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition
              ${
                activeLang === key
                  ? "bg-[#63953a] text-white"
                  : "border border-[#63953a]/30 text-[#63953a] hover:bg-[#63953a]/10"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active language helper */}
      {activeLang !== "all" && (
        <p className="text-center text-sm text-gray-500 mb-8">
          Showing videos in{" "}
          <span className="font-semibold">
            {activeLang === "other"
              ? "other languages"
              : capitalize(activeLang)}
          </span>
        </p>
      )}

      {/* Empty State */}
      {filteredVideos.length === 0 ? (
        <EmptyState
          title="No videos found"
          description={
            activeLang === "all"
              ? "No videos are available at the moment."
              : `No videos found in ${
                  activeLang === "other"
                    ? "other languages"
                    : capitalize(activeLang)
                }.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => {
            const videoUrl = video.links?.[0];
            const directFile = isDirectVideo(videoUrl);
            const isPlaying = activeVideo === video._id;

            return (
              <div
                key={video._id}
                className="bg-white rounded-2xl overflow-hidden
                           border border-gray-100 shadow-sm
                           flex flex-col"
              >
                {/* Media */}
                <div className="relative aspect-video bg-black">
                  {isPlaying ? (
                    directFile ? (
                      <video
                        ref={(el) => (videoRefs.current[video._id] = el)}
                        src={videoUrl}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ReactPlayer
                        url={videoUrl}
                        playing
                        controls
                        width="100%"
                        height="100%"
                      />
                    )
                  ) : (
                    <>
                      <Image
                        src={video.coverPhoto || resourceCover}
                        alt={video.title}
                        fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />

                      {/* Language badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full
                                      bg-white/90 text-xs font-semibold text-[#63953a]">
                        {capitalize(video.videoLang || "Other")}
                      </div>

                      {/* Play overlay */}
                      <button
                        onClick={() => setActiveVideo(video._id)}
                        aria-label="Play video"
                        className="absolute inset-0 flex items-center justify-center
                                   bg-black/35 hover:bg-black/45 transition"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#63953a]
                                        flex items-center justify-center shadow-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="#ffffff"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-bold text-[17px] mb-2 line-clamp-2">
                    {video.title}
                  </h4>

                  {/* Soft description fade */}
                  <div className="relative text-sm text-gray-700 max-h-[72px] overflow-hidden">
                    <div
                      dangerouslySetInnerHTML={{ __html: video.description }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-6
                                    bg-gradient-to-t from-white to-transparent" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default VideoResources;
