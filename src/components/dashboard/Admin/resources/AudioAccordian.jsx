"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AudioResources from "@/components/resources/AudioResources";
import Image from "next/image";
import audioBanner from "@/../public/images/audio_banner.jpg";
const AUDIO_SECTIONS = [
    { key: "general", title: "General Ruqyah Audios" },
    { key: "topic-based", title: "Topic-Based Ruqyah Audios" },
    { key: "specific-problems", title: "Ruqyah for Specific Problems" },
    { key: "quran-recitation", title: "Quran Recitation Audios" },
];

export default function AudioAccordion({ audioList = [] }) {
    const [openKey, setOpenKey] = useState("general");
    const groupedAudios = useMemo(() => {
        return audioList.reduce((acc, audio) => {
            const type = audio.audioType || "general";
            if (!acc[type]) acc[type] = [];
            acc[type].push(audio);
            return acc;
        }, {});
    }, [audioList]);

    const toggleAccordion = (key) => {
        setOpenKey((prev) => (prev === key ? null : key));
    };

    return (
        <div>
            {/* Banner */}
            <section className="text-white h-[400px]  flex flex-col items-center justify-center  text-center ">
                <div className="absolute top-0 bottom-0 right-0 left-0 h-[400px] ">
                    <Image className="w-full h-[400px]   object-cover pointer-events-none select-none"
                        src={audioBanner}
                        width={1000} height={1000} alt="Audio Banner" />
                </div>
                <div className="bg-black bg-opacity-[51%] w-full h-[400px]  absolute top-0 bottom-0 right-0 left-0">
                </div>
                <div className="relative z-10 max-w-4xl md:px-6 px-4 md:-mt-0 -mt-[100px]">
                    <div className="flex flex-col gap-[19px]">
                        <h1 className="text-white text-[28px] md:text-[40px] font-bold mb-4">
                            Ruqyah Audio
                        </h1>
                        <p className="text-white max-w-[720px] text-base md:text-lg px-2">
                            Listen to or download Ruqyah audios for healing— including general Ruqyah, topic-based guidance, and audios for specific problems.
                        </p>
                    </div>
                </div>
            </section>

            <section className="max-w-[900px] mx-auto mb-4 px-4 space-y-4 md:-mt-[20px] -mt-[50px]">
                {AUDIO_SECTIONS?.map((section) => {
                    const isOpen = openKey === section.key;
                    const sectionAudios = groupedAudios[section.key] || [];
                    const count = sectionAudios.length;

                    if (!count) return null;

                    return (
                        <div
                            key={section.key}
                            className={`rounded-2xl border overflow-hidden
              transition-colors
              ${isOpen ? "border-green shadow-sm" : "border-gray-200"}
            `}
                        >
                            {/* Header */}
                            <button
                                onClick={() => toggleAccordion(section.key)}
                                className="w-full flex items-center justify-between px-5 py-4
                bg-gray-50 hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-gray-900">
                                        {section.title}
                                    </h3>

                                    {/* Count */}
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full
                  bg-green/10 text-green">
                                        {count}
                                    </span>
                                </div>

                                {/* Chevron */}
                                <motion.svg
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="w-4 h-4 text-gray-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                                        clipRule="evenodd"
                                    />
                                </motion.svg>
                            </button>

                            {/* Content */}
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        key="content"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.35, ease: "easeInOut" }}
                                        className="overflow-hidden bg-white"
                                    >
                                        <div className="px-2 py-3">
                                            <AudioResources audioList={sectionAudios} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
