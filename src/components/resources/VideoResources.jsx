"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ReactPlayer from "react-player";
import { useRouter, useSearchParams } from "next/navigation";
import capitalize from "@/utils/capitalize.mjs";
import resourceCover from "@/../public/images/resources.jpg";
import EmptyState from "../shared/EmptyState";

import literatureBanner from "@/../public/images/video_banner.jpg";

const isDirectVideo = (url) => /\.(mp4|webm|ogg|mov)$/i.test(url || "");

const VideoResources = ({ videos = [], allTopic = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTopic = (searchParams.get("topic") || "all").toLowerCase();

  const [activeVideo, setActiveVideo] = useState(null);
  const videoRefs = useRef({});

  // stop other videos when one starts playing
  useEffect(() => {
    Object.entries(videoRefs?.current).forEach(([id, el]) => {
      if (id !== activeVideo && el?.pause) {
        el.pause();
        el.currentTime = 0;
      }
    });
  }, [activeVideo]);

  // total video count (for "All Topics")
  const totalCount = useMemo(
    () => allTopic.reduce((sum, t) => sum + (t.count || 0), 0),
    [allTopic]
  );

  // filter videos by topic
  const filteredVideos = useMemo(() => {
    if (activeTopic === "all") return videos;
    return videos.filter(
      (v) => (v.topic || "").toLowerCase() === activeTopic
    );
  }, [videos, activeTopic]);

  const setTopic = (topic) => {
    const params = new URLSearchParams(searchParams.toString());
    if (topic === "all") params.delete("topic");
    else params.set("topic", topic);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      {/* Banner */}
      <section className="text-white h-[400px]  flex flex-col items-center justify-center  text-center ">
        <div className="absolute top-0 bottom-0 right-0 left-0 h-[400px] ">
          <Image className="w-full h-[400px]   object-cover pointer-events-none select-none"
            src={literatureBanner}
            width={1000} height={1000} alt="Literature Banner" />
        </div>
        <div className="bg-black bg-opacity-[51%] w-full h-[400px]  absolute top-0 bottom-0 right-0 left-0">
        </div>
        <div className="relative z-10 max-w-4xl md:px-6 px-0  -mt-[150px]">
          <div className="flex flex-col gap-[19px]">
            <h1 className="text-white text-[28px] md:text-[40px] font-bold ">
              Videos
            </h1>
            <p className="text-white max-w-[720px] text-base md:text-lg px-2">
              Watch meaningful content designed to educate, inspire, and guide.
            </p>
          </div>
        </div>
      </section>
      <section className="max-w-[1200px] mx-auto px-4 md:-mt-[20px] -mt-[50px]">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setTopic("all")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition
            ${activeTopic === "all"
                ? "bg-[#63953a] text-white"
                : "border border-[#63953a]/30 text-[#63953a] hover:bg-[#63953a]/10"
              }`}
          >
            All Topics ({totalCount})
          </button>

          {allTopic.map(({ topic, count }) => {
            const key = topic.toLowerCase();

            return (
              <button
                key={key}
                onClick={() => setTopic(key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition
                ${activeTopic === key
                    ? "bg-[#63953a] text-white"
                    : "border border-[#63953a]/30 text-[#63953a] hover:bg-[#63953a]/10"
                  }`}
              >
                {capitalize(topic)} ({count})
              </button>
            );
          })}
        </div>

        {/* Active topic helper */}
        {activeTopic !== "all" && (
          <p className="text-center text-sm text-gray-500 mb-8">
            Showing videos in{" "}
            <span className="font-semibold">{capitalize(activeTopic)}</span>
          </p>
        )}

        {/* Empty State */}
        {filteredVideos.length === 0 ? (
          <EmptyState
            title="No videos found"
            description={
              activeTopic === "all"
                ? "No videos are available at the moment."
                : `No videos found under ${capitalize(activeTopic)}.`
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

                        {/* Topic badge */}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full
                                      bg-white/90 text-xs font-semibold text-[#63953a]">
                          {capitalize(video.topic || "general")}
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
    </div>
  );
};

export default VideoResources;
