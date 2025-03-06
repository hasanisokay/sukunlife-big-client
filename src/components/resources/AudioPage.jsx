"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import BlogContent from "../blogs/BlogContnet";
import formatDate from "@/utils/formatDate.mjs";

// SVG Decorative Element
const WaveSVG = () => (
  <svg className="absolute top-0 left-0 w-full h-32 text-teal-100 dark:text-teal-800" fill="currentColor" viewBox="0 0 1440 120">
    <path d="M1440 0H0v60c200 30 400 60 720 60s520-30 720-60V0z" />
  </svg>
);

const AudioPage = ({ audios }) => {
  const [playingId, setPlayingId] = useState(null);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
  };

  const iconVariants = {
    initial: { scale: 1 },
    animate: {
      scale: 1.2,
      transition: {
        duration: 0.2,
        yoyo: Infinity,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-teal-900 dark:via-gray-900 dark:to-blue-900 text-gray-800 dark:text-gray-100">
      {/* Decorative Wave Background */}
      <WaveSVG />

      <div className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold font-serif tracking-wide text-center mb-12 text-teal-600 dark:text-teal-300 flex items-center justify-center"
        >
          <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l7 6-7 7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Audio Collection
        </motion.h1>

        <div className="max-w-4xl mx-auto grid gap-8">
          {audios.map((audio, index) => (
            <motion.div
              key={audio._id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              custom={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-teal-100 dark:border-teal-800"
            >
              <div className="flex items-start space-x-4">
                {/* Play Button SVG */}
                <motion.button
                  onClick={() => setPlayingId(playingId === audio._id ? null : audio._id)}
                  className="p-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
                  variants={iconVariants}
                  animate={playingId === audio._id ? "animate" : "initial"}
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {playingId === audio._id ? (
                      <path d="M6 4h4v12H6V4zm4 0h4v12h-4V4z" />
                    ) : (
                      <path d="M5 3l12 7-12 7V3z" />
                    )}
                  </svg>
                </motion.button>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{audio.title}</h2>

                  <BlogContent content={audio.description} />

                  <div className="mt-4 space-y-2">
                    {/* Download Links */}
                    <div className="flex flex-wrap gap-4">
                      {audio.links.map((link, linkIndex) => (
                        <a
                          key={linkIndex}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          <span>Download {audio.links.length > 1 ? `#${linkIndex + 1}` : ""}</span>
                        </a>
                      ))}
                    </div>

                    {/* Date */}
                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{formatDate(audio.date)}</span>
                    </div>
                  </div>

                  {/* Audio Player */}
                  {playingId === audio._id && (
                    <motion.audio
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      controls
                      autoPlay
                      className="mt-4 w-full"
                    >
                      <source src={audio.links[0]} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </motion.audio>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Footer Wave */}
      <svg className="absolute bottom-0 left-0 w-full h-32 text-blue-100 dark:text-blue-800" fill="currentColor" viewBox="0 0 1440 120">
        <path d="M1440 120H0V60C200 30 400 0 720 0s520 30 720 60v60z" />
      </svg>
    </div>
  );
};

export default AudioPage;