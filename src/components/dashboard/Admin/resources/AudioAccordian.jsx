"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AudioResources from "@/components/resources/AudioResources";
import Image from "next/image";
import audioBanner from "@/../public/images/audio.jpg";
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
        <section>
            {/* header */}
            {/* ===== Banner / Header ===== */}
            <div className="relative w-full h-[100px] md:h-[280px] mb-8">
                {/* Banner Image */}
                <Image
                    src={audioBanner}
                    alt="Ruqyah Audio Banner"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content */}
                <div className="relative z-10 h-full flex items-center justify-center px-4">
                    <div className="max-w-[900px] w-full text-center text-white">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                            Ruqyah Audio
                        </h1>

                        <p className="mt-3 text-sm md:text-base text-white/90 leading-relaxed">
                            Powerful Ruqyah recitations and Quranic verses for healing,
                            protection, and spiritual well-being — listen, reflect, and find peace.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-[900px] mx-auto mb-4 px-4 space-y-4">
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
            </div>
        </section>
    );
}
