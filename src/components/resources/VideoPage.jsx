'use client'
import { motion } from 'framer-motion';
import { useState } from 'react';
import ReactPlayer from 'react-player';
import formatDate from '@/utils/formatDate.mjs';

const VideoPage = ({ videos }) => {
  const [playingId, setPlayingId] = useState(null);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    hover: { 
      scale: 1.03,
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.3 }
    }
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: { 
      scale: 1.2,
      rotate: 5,
      transition: { 
        duration: 0.2,
        yoyo: Infinity 
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-center mb-12 text-gray-800 dark:text-white flex items-center justify-center gap-3"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14.553 7.106A1 1 0 0016 12V8a1 1 0 00-.553-.894l-4-2a1 1 0 00-.894 0l-4 2A1 1 0 006 8v4a1 1 0 00.553.894l4 2a1 1 0 00.894 0l4-2z"/>
        </svg>
        Video Collection
      </motion.h1>

      <div className="max-w-4xl mx-auto grid gap-8">
        {videos.map((video, index) => (
          <motion.div
            key={video._id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            custom={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          >
            {/* Decorative corner */}
            <svg className="absolute top-0 right-0 w-16 h-16 text-blue-100 dark:text-blue-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V3z"/>
            </svg>

            <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
              {/* Play Button */}
              <motion.button
                onClick={() => setPlayingId(playingId === video._id ? null : video._id)}
                className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all self-start sm:self-center"
                variants={iconVariants}
                animate={playingId === video._id ? "animate" : "initial"}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  {playingId === video._id ? (
                    <path d="M6 4h4v12H6V4zm4 0h4v12h-4V4z" />
                  ) : (
                    <path d="M5 3l12 7-12 7V3z" />
                  )}
                </svg>
              </motion.button>

              <div className="flex-1 w-full">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1v8l5-4-5-4zm6 0v8l5-4-5-4z"/>
                  </svg>
                  {video.title}
                </h2>

                <div 
                  className="mt-2 text-gray-600 dark:text-gray-300 prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: video.description }}
                />

                <div className="mt-4 space-y-3">
                  {/* Video Player */}
                  {playingId === video._id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-900 w-full"
                    >
                      <ReactPlayer
                        url={video.links[0]}
                        width="100%"
                        height="auto"
                        playing={playingId === video._id}
                        controls
                        className="w-full"
                        config={{
                          youtube: {
                            playerVars: { showinfo: 1 }
                          }
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Download Links */}
                  <div className="flex flex-wrap gap-4">
                    {video.links.map((link, linkIndex) => (
                      <a 
                        key={linkIndex}
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        <span>Download {video.links.length > 1 ? `#${linkIndex + 1}` : ''}</span>
                      </a>
                    ))}
                  </div>

                  {/* Date */}
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{formatDate(video.date)}</span>
                    {/* Video Icon */}
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm3 1v6l4-3-4-3zm6 0v6l4-3-4-3z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VideoPage;