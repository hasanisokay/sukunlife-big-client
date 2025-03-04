'use client'
import { motion } from 'framer-motion';
import Link from 'next/link';

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
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
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
      type: 'spring',
      stiffness: 200,
      damping: 10,
    },
  },
  hover: {
    rotate: 10,
    transition: { duration: 0.3 },
  },
};

const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Sukunlife Resources
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Audio Card */}
          <Link href="/resources/audio" passHref>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg 
                cursor-pointer overflow-hidden group h-64 flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent 
                group-hover:from-green-500/20 transition-all duration-300" />
              <div className="relative z-10">
                <motion.svg
                  variants={iconVariants}
                  className="w-12 h-12 mb-4 text-green-500 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l7 6-7 7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </motion.svg>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  Audio Files
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">
                Listen to our audio resources and podcasts
              </p>
            </motion.div>
          </Link>
     {/* Video Card */}
     <Link href="/resources/video" passHref>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg 
                cursor-pointer overflow-hidden group h-64 flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent 
                group-hover:from-blue-500/20 transition-all duration-300" />
              <div className="relative z-10">
                <motion.svg
                  variants={iconVariants}
                  className="w-12 h-12 mb-4 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6h12a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z"
                  />
                </motion.svg>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  Video Content
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">
                Watch our curated videos
              </p>
            </motion.div>
          </Link>
          {/* PDF Card */}
          <Link href="/resources/pdf" passHref>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg 
                cursor-pointer overflow-hidden group h-64 flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent 
                group-hover:from-red-500/20 transition-all duration-300" />
              <div className="relative z-10">
                <motion.svg
                  variants={iconVariants}
                  className="w-12 h-12 mb-4 text-red-500 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m-2 4h2m-6 4h6"
                  />
                </motion.svg>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  PDF Documents
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">
                Explore our collection of PDF resources and guides
              </p>
            </motion.div>
          </Link>

     


        </div>
      </motion.div>
    </div>
  );
};

export default ResourcesPage;