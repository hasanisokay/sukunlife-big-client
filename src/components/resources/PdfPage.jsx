'use client'
import { motion } from 'framer-motion';
import formatDate from '@/utils/formatDate.mjs';

const PdfPage = ({ pdfs }) => {
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
    hover: { 
      scale: 1.2,
      rotate: 5,
      transition: { duration: 0.2 }
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
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm2 3h8v2H6V6zm0 3h8v2H6V9zm0 3h5v2H6v-2z"/>
        </svg>
        PDF Collection
      </motion.h1>

      <div className="max-w-4xl mx-auto grid gap-8">
        {pdfs.map((pdf, index) => (
          <motion.div
            key={pdf._id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            custom={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          >
            {/* Decorative corner */}
            <svg className="absolute top-0 right-0 w-16 h-16 text-red-100 dark:text-red-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V3z"/>
            </svg>

            <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
              {/* PDF Icon */}
              <motion.div
                className="p-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 self-start sm:self-center"
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 2h6v4H6V6zm0 6h8v2H6v-2z"/>
                </svg>
              </motion.div>

              <div className="flex-1 w-full">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm2 3h6v2H7V6zm0 3h6v2H7V9z"/>
                  </svg>
                  {pdf.title}
                </h2>

                <div 
                  className="mt-2 text-gray-600 dark:text-gray-300 prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: pdf.description }}
                />

                <div className="mt-4 space-y-3">
                  {/* Download Links */}
                  <div className="flex flex-wrap gap-4">
                    {pdf.links.map((link, linkIndex) => (
                      <a 
                        key={linkIndex}
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        <span>Download {pdf.links.length > 1 ? `#${linkIndex + 1}` : ''}</span>
                      </a>
                    ))}
                  </div>

                  {/* Date */}
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{formatDate(pdf.date)}</span>
                    {/* Document Icon */}
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 2h8v2H6V6zm0 3h8v2H6V9zm0 3h5v2H6v-2z" clipRule="evenodd"/>
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

export default PdfPage;