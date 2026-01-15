"use client";
import resourceBanner from "@/../public/images/resources_header_banner.jpeg";
import Image from "next/image";
import CategoryNavbar from "../blogs/CategoryNavbar";
import { useEffect, useState, useMemo } from "react";
import BlogContent from "../blogs/BlogContnet";
import AudioSection from "./AudioSection";
import VideoSection from "./VideoSection";
import LiteratureSection from "./LiteratureSection";
import FixedCart from "../shared/FixedCart";
import getResources from "@/utils/getResources.mjs";

const ResourcesPage = ({ iResources, initialLimit }) => {
  const [resources, setResources] = useState(iResources?.[0] || {});
  const [showMoreAudioButton, setShowMoreAudioButton] = useState(true);
  const [showMoreLiteratureButton, setShowMoreLiteratureButton] = useState(true);
  const [showMoreQuranButton, setShowMoreQuranButton] = useState(true);
  const [showMoreVideoButton, setShowMoreVideoButton] = useState(true);
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

  const audioList = useMemo(() => resources?.audio, [resources]);
  const quranList = useMemo(() => resources.quran, [resources]);
  const videoList = useMemo(() => resources.video, [resources]);
  const literatureList = useMemo(
    () => resources.literature,
    [resources]
  );
  const handleLoadMore = async (type, previousDataSize, subType = '') => {

    const moreItems = await getResources(1, initialLimit, '', 'newest', type, subType, previousDataSize || initialLimit)
    if (moreItems?.status === 200) {
      if (moreItems?.resources?.length > 0) {
        setResources((prev) => ({
          ...prev,
          [type]: [...(prev[type] || []), ...(moreItems?.resources || [])],
        }));
      }else{
        if(type==='audio'){
          setShowMoreAudioButton(false);
        }else if(type==='video'){
          setShowMoreVideoButton(false);
        }else if(type==='quran'){
          setShowMoreQuranButton(false);
        }else{
          setShowMoreLiteratureButton(false)
        }
      }
    }

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
          {audioList.length >= initialLimit && showMoreAudioButton && (
            <div className="text-center mt-[100px]">
              <button
                onClick={() => handleLoadMore("audio", audioList?.length, '')}
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
          {resources.quran?.length >= initialLimit && showMoreQuranButton && (
            <div className="text-center mt-6">
              <button
                onClick={() => handleLoadMore("quran", quranList?.length, '')}
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
          {videoList?.length >= initialLimit && showMoreVideoButton && (
            <div className="text-center mt-6">
              <button
                onClick={() => handleLoadMore("video", videoList?.length, '')}
                className="load-more-btn"
              >
                Load More
              </button>
            </div>
          )}
        </div>

        {/* Literature Section (Third Design) */}

        <LiteratureSection literatureData={literatureList} />
        {literatureList?.length >= initialLimit && showMoreLiteratureButton && (
          <div className="text-center mt-6">
            <button
              onClick={() => handleLoadMore("literature", literatureList?.length, '')}
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
