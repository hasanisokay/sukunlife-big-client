"use client";
import resourceBanner from "@/../public/images/resources_header_banner.jpeg";
import Image from "next/image";
import CategoryNavbar from "../blogs/CategoryNavbar";
import { useEffect, useState, useMemo } from "react";
import BlogContent from "../blogs/BlogContnet";
import AudioPlayer from "./AudioSection";
import AudioSection from "./AudioSection";
import VideoSection from "./VideoSection";
import LiteratureSection from "./LiteratureSection";
import FixedCart from "../shared/FixedCart";

const ResourcesPage = ({ iResources, initialLimit }) => {
  const [resources, setResources] = useState(iResources?.[0] || {});

  useEffect(() => {
    setResources(iResources?.[0] || {});
  }, [iResources]);

  const categories = [
    { id: "audio", label: "Audio Ruqyah Recitations" },
    { id: "quran", label: "Quranic Verses for Healing" },
    { id: "video", label: "Educational Videos" },
    { id: "literature", label: "Literature & Guides" },
  ];

  // Helper: slice to limit 5 items initially
  const getLimited = (arr) => (arr?.length > initialLimit ? arr.slice(0, initialLimit) : arr || []);

  const audioList = useMemo(() => getLimited(resources.audio), [resources]);
  const quranList = useMemo(() => getLimited(resources.quran), [resources]);
  const videoList = useMemo(() => getLimited(resources.video), [resources]);
  const literatureList = useMemo(
    () => getLimited(resources.literature),
    [resources]
  );
  console.log(resources)
  const handleLoadMore = (type) => {
    console.log("Load more called for:", type);
    // Example: fetch API and merge into state
    // fetch(`/api/resources?type=${type}&offset=${resources[type].length}`)
    //   .then(res => res.json())
    //   .then(newData => {
    //     setResources(prev => ({
    //       ...prev,
    //       [type]: [...prev[type], ...newData],
    //     }));
    //   });
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="absolute top-0 bottom-0 right-0 left-0">
        <Image
          className="h-[468px] w-full object-cover pointer-events-none select-none"
          src={resourceBanner}
          alt="resource_banner"
          width={1000}
          height={1000}
        />
      </div>

      <div className="relative pt-10 h-[468px]">
        <h1 className="md:text-[36px] text-[24px] text-white text-center charisSIL-font font-bold mb-[20px]">
          Welcome to the Sukun Life Resources Page!
        </h1>
        <p className="text-white max-w-[708px] px-[20px] text-base text-center mx-auto">
          Here, you will find a wide range of carefully curated materials to
          support your spiritual well-being and help you perform Ruqaya
          confidently at home. Our resources are rooted in the teachings of the
          Qur'an and Sunnah, ensuring you are guided by authentic knowledge.
        </p>
      </div>

      {/* Category Navbar */}
      <CategoryNavbar
        key={"resource_category_nav"}
        categories={categories}
        noHeading={true}
        noBorder={true}
      />
      <div className="max-w-[1200px] mx-auto py-6 flex-col flex gap-[80px] items-center justify-center flex-wrap  px-4">

        {/* Audio Section */}
        <section id="audio">
          <AudioSection audioList={audioList} />
          {resources?.audio?.length === initialLimit && (
            <div className="text-center mt-6">
              <button
                onClick={() => handleLoadMore("audio")}
                className="load-more-btn"
              >
                Load More
              </button>
            </div>
          )}
        </section>

        {/* Quran Section */}
        <section id="quran" >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] justify-center ">
            {quranList?.map((quran) => (
              <div
                key={quran._id}
                className="overflow-hidden bg-white"
              >
                <Image
                  src={quran.coverPhoto}
                  alt={quran.title}
                  width={400}
                  height={300}
                  className="w-[540px] h-[304px] object-cover rounded-[40px]"
                />
                <h3 className="font-bold text-[20px] mt-[44px]">{quran.title}</h3>
                <div className="h-[100px]">
                  <BlogContent content={quran?.description} />
                </div>
                <div className="flex gap-3 mt-4">
                  {quran.readLink && (
                    <a
                      href={quran.readLink}
                      target="_blank"
                      className="w-[173px] h-[54px] rounded-full font-semibold bg-green text-white hover:bg-white hover:text-black hover:border-[1px] hover:border-black text-center py-3"
                    >
                      Read Ayat
                    </a>
                  )}
                  {quran.listenLink && (
                    <a
                      href={quran.listenLink}
                      target="_blank"
                      className="w-[173px] h-[54px] rounded-full border-[1px] hover:bg-[#63953a] hover:border-[#63953a] hover:text-white border-black  text-black font-semibold text-center py-3"
                    >
                      Listen
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {resources.quran?.length === initialLimit && (
            <div className="text-center mt-6">
              <button
                onClick={() => handleLoadMore("quran")}
                className="load-more-btn"
              >
                Load More
              </button>
            </div>
          )}
        </section>
        {/* Video Section */}
        <div className="relative">
          <VideoSection videos={videoList} />
          {resources?.video?.length === initialLimit && (
            <div className="text-center mt-6">
              <button
                onClick={() => handleLoadMore("video")}
                className="load-more-btn"
              >
                Load More
              </button>
            </div>
          )}
        </div>

        {/* Literature Section (Third Design) */}

        <LiteratureSection literatureData={literatureList} />
        {resources?.literature?.length === initialLimit && (
          <div className="text-center mt-6">
            <button
              onClick={() => handleLoadMore("literature")}
              className="load-more-btn"
            >
              Load More
            </button>
          </div>
        )}
      </div>
      <FixedCart />
    </div>
  );
};

export default ResourcesPage;
