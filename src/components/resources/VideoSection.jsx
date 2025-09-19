"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import ReactPlayer from "react-player";
import capitalize from "@/utils/capitalize.mjs";

// detect direct video file
const isDirectVideo = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
};

const VideoSection = ({ videos = [], initialLimit = 5 }) => {
  const [activeLang, setActiveLang] = useState("Bangla");
  const [activeVideo, setActiveVideo] = useState(null); // playing video id
  const videoRefs = useRef({});
  const sectionRefs = useRef({});

  // group by videoLang
  const videoGroups = videos.reduce((acc, vid) => {
    const lang = vid.videoLang || "Other";
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(vid);
    return acc;
  }, {});

  // track scroll for activeLang
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveLang(visible.target.dataset.lang);
      },
      { threshold: 0.4 }
    );

    Object.values(sectionRefs.current).forEach((sec) => {
      if (sec) observer.observe(sec);
    });

    return () => observer.disconnect();
  }, []);

  // stop all others when switching
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, vidEl]) => {
      if (id !== activeVideo && vidEl) {
        vidEl.pause?.();
        vidEl.currentTime = 0;
      }
    });
  }, [activeVideo]);

  return (
    <section id="video">
      {/* Sticky top navbar */}
      <div className="sticky lg:top-[55px] top-[40px] max-w-[1200px] mx-auto bg-white z-20 py-3 flex gap-3 overflow-x-auto">
        {Object.keys(videoGroups).map((lang) => (
          <a
            key={lang}
            href={`#video-${lang.toLowerCase()}`}
            className={`text-center w-[160px] pt-[14px] h-[57px]  rounded-full ${activeLang === lang
              ? "bg-black text-white"
              : "border border-gray-400 hover:bg-black hover:text-white"
              }`}
          >
            {capitalize(lang)}
          </a>
        ))}
      </div>

      {/* Render grouped videos */}
      {Object.entries(videoGroups).map(([lang, vids]) => (
        <div
          key={lang}
          id={`video-${lang.toLowerCase()}`}
          data-lang={lang}
          ref={(el) => (sectionRefs.current[lang] = el)}
          className="mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vids.map((video) => {
              const videoUrl = video.links?.[0]; // take first link
              const directFile = isDirectVideo(videoUrl);

              return (
                <div key={video._id}>
                  <div className="relative h-[304px] md:w-[540px] w-[350px] overflow-hidden  rounded-[40px] bg-black">
                    {activeVideo === video._id ? (
                      directFile ? (
                        <video
                          ref={(el) => (videoRefs.current[video._id] = el)}
                          src={videoUrl}
                          controls
                          autoPlay
                          playsInline
                          className="min-w-full rounded-[40px] h-[304px] object-cover"
                        />
                      ) : (
                        <ReactPlayer
                          url={videoUrl}
                          playing
                          controls
                          width="100%"
                          height="100%"
                          style={{
                            borderRadius: "40px",
                          }}
                          className="min-w-full rounded-[40px] h-[304px] object-cover"
                        />
                      )
                    ) : (
                      <>
                        <Image
                          src={video.coverPhoto}
                          alt={video.title}
                          width={400}
                          height={300}
                          className=" min-w-full rounded-[40px] h-[304px] object-cover"
                        />
                        <button
                          className="absolute inset-0 flex items-center justify-center text-white text-4xl"
                          onClick={() => setActiveVideo(video._id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="53"
                            height="53"
                            fill="none"
                            viewBox="0 0 53 53"
                          >
                            <path
                              fill="#68D585"
                              d="M47.279 20.655a6.62 6.62 0 0 1 0 11.69L18.986 47.732c-4.556 2.48-10.152-.744-10.152-5.843V11.115c0-5.102 5.596-8.324 10.152-5.848z"
                            ></path>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  <div className="pt-[40px]">
                    <h4 className="font-bold text-[20px]">{video.title}</h4>
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: video.description }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
};

export default VideoSection;
