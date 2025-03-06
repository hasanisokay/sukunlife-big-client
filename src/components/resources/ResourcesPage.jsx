"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Animation variants for each card
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.3,
    },
  },
};

// Icon animation variant
const iconVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
    },
  },
  hover: {
    rotate: 10,
    transition: { duration: 0.3 },
  },
};

// SVG Decorative Element
const WaveSVG = () => (
  <svg className="absolute top-0 left-0 w-full h-32 text-indigo-100 dark:text-indigo-800" fill="currentColor" viewBox="0 0 1440 120">
    <path d="M1440 0H0v60c200 30 400 60 720 60s520-30 720-60V0z" />
  </svg>
);

const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-900 dark:via-gray-900 dark:to-purple-900 text-gray-800 dark:text-gray-100">
      {/* Decorative Wave Background */}
      <WaveSVG />

      {/* Main Content */}
      <motion.div
        className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold font-serif tracking-wide text-center mb-12 text-indigo-600 dark:text-indigo-300 flex items-center justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Sukunlife Resources
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Audio Card */}
          <Link href="/resources/audio" passHref>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg cursor-pointer overflow-hidden group h-64 flex flex-col justify-between border border-green-100 dark:border-green-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent group-hover:from-green-500/20 transition-all duration-300" />
              <div className="relative z-10">
                <motion.svg
                  variants={iconVariants}
                  className="w-12 h-12 mb-4 text-green-500 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l7 6-7 7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </motion.svg>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Audio Files</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v4H9V7zm0 6h2v2H9v-2z" />
                </svg>
                Listen to our audio resources and podcasts
              </p>
            </motion.div>
          </Link>

          {/* Video Card */}
          <Link href="/resources/video" passHref>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg cursor-pointer overflow-hidden group h-64 flex flex-col justify-between border border-blue-100 dark:border-blue-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent group-hover:from-blue-500/20 transition-all duration-300" />
              <div className="relative z-10">
                <motion.svg
                  variants={iconVariants}
                  className="w-12 h-12 mb-4 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h12a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </motion.svg>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Video Content</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v4H9V7zm0 6h2v2H9v-2z" />
                </svg>
                Watch our curated videos
              </p>
            </motion.div>
          </Link>

          {/* PDF Card */}
          <Link href="/resources/pdf" passHref>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg cursor-pointer overflow-hidden group h-64 flex flex-col justify-between border border-red-100 dark:border-red-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent group-hover:from-red-500/20 transition-all duration-300" />
              <div className="relative z-10">
                <motion.svg
                  variants={iconVariants}
                  className="w-12 h-12 mb-4 text-red-500 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-2 4h2m-6 4h6" />
                </motion.svg>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">PDF Documents</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v4H9V7zm0 6h2v2H9v-2z" />
                </svg>
                Explore our collection of PDF resources and guides
              </p>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Decorative Footer Wave */}
      <svg className="absolute bottom-0 left-0 w-full h-32 text-purple-100 dark:text-purple-800" fill="currentColor" viewBox="0 0 1440 120">
        <path d="M1440 120H0V60C200 30 400 0 720 0s520 30 720 60v60z" />
      </svg>
    </div>
  );
};

export default ResourcesPage;