import Image from "next/image";
import React from "react";
import BlogContent from "../blogs/BlogContnet";
import resourceCover from "@/../public/images/resources.jpg";
import EmptyState from "../shared/EmptyState";

import quranBanner from "@/../public/images/quran_banner.jpg";
const QuranResources = ({ quranList = [] }) => {
  return (
    <div className="mt-12 mb-12 max-w-[1200px] mx-auto px-4">

      {/* Empty State */}
      {quranList.length === 0 ? (
        <EmptyState
          title="No Qurān resources found"
          description="Quranic healing resources will be added soon, inshaAllah."
        />
      ) : (
        <div>
          {/* Banner */}
          <section className="text-white h-[400px]  flex flex-col items-center justify-center  text-center ">
            <div className="absolute top-0 bottom-0 right-0 left-0 h-[400px] ">
              <Image className="w-full h-[400px]   object-cover pointer-events-none select-none"
                src={quranBanner}
                width={1000} height={1000} alt="Audio Banner" />
            </div>
            <div className="bg-black bg-opacity-[41%] w-full h-[400px]  absolute top-0 bottom-0 right-0 left-0">
            </div>
            <div className="relative z-10 max-w-4xl md:px-6 px-4 -mt-[140px]">
              <div className="flex flex-col gap-[19px]">
                <h1 className="text-white text-[28px] md:text-[40px] font-bold mb-2">
                  Quranic Resources
                </h1>
                <p className="text-white max-w-[720px] text-base md:text-lg px-2">
                A step forward on your journey with trusted Quran and Sunnah teachings.
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 -mt-[100px]">
            {quranList.map((quran) => (
              <div
                key={quran._id}
                className="bg-white rounded-2xl overflow-hidden
                         border border-gray-100 shadow-sm
                         flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-video bg-black">
                  <Image
                    src={quran.coverPhoto || resourceCover}
                    alt={quran.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3
                    className="font-bold text-[17px] mb-2 line-clamp-2"
                    title={quran.title}
                  >
                    {quran.title}
                  </h3>

                  {/* Soft description fade */}
                  <div className="relative text-sm text-gray-700 max-h-[72px] overflow-hidden mb-4">
                    <BlogContent content={quran?.description} />
                    <div className="absolute bottom-0 left-0 right-0 h-6
                                  bg-gradient-to-t from-white to-transparent" />
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-3">
                    {quran.readLink && (
                      <a
                        href={quran.readLink}
                        target="_blank"
                        className="flex-1 px-4 py-2.5 rounded-full
                                 bg-[#63953a] text-white
                                 font-semibold text-sm text-center
                                 hover:bg-[#4f7e2f] transition"
                      >
                        Read
                      </a>
                    )}

                    {quran.listenLink && (
                      <a
                        href={quran.listenLink}
                        target="_blank"
                        className="flex-1 px-4 py-2.5 rounded-full
                                 border border-[#63953a]
                                 text-[#63953a]
                                 font-semibold text-sm text-center
                                 hover:bg-[#63953a] hover:text-white
                                 transition"
                      >
                        Listen
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranResources;
