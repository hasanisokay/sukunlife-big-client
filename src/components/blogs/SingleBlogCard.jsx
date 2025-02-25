"use client";

import blogCover from "@/../public/images/blog.jpg";
import formatDate from "@/utils/formatDate.mjs";
import Link from "next/link";
import Image from "next/image";
import { fallbackBlurDataURL } from "@/constants/fallbackBlurDataUrl.mjs";
import { useState } from "react";
import { motion } from "framer-motion";

const SingleBlogCard = ({ b }) => {

  const [imageError,setImageError] = useState(false);


  const ContentPreview = ({ content }) => {
    const plainText = content?.replace(/<[^>]+>/g, " ");
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {plainText?.slice(0, 200)}
        {plainText?.length > 200 ? "..." : ""}
      </p>
    );
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: {
      boxShadow:
        "0 15px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.3 },
    },
  };

  const imageVariants = {
    hover: { scale: 1.05, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const linkVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true }}
      key={b._id}
      className="bg-white dark:bg-gray-900 max-w-4xl mx-auto rounded-xl shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300"
    >
      {/* Blog Cover Photo with Gradient Overlay */}
        <motion.div
          variants={imageVariants}
          whileHover="hover"
          className="w-full h-64 relative overflow-hidden"
        >
          <Link href={`/blog/${b.blogUrl}`}>
            <Image
              width={600}
              height={400}
              className="w-full h-full object-cover transition-transform duration-500"
              quality={100}
              src={imageError ? blogCover : b?.blogCoverPhoto ? b?.blogCoverPhoto: blogCover}
              alt={b.title}
              onError={()=>setImageError(true)}
              placeholder="blur"
              blurDataURL={fallbackBlurDataURL}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 dark:from-black/70 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Title Overlay on Image */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-xl font-bold text-white dark:text-gray-100 drop-shadow-md line-clamp-2">
                {b.title}
              </h2>
            </div>
          </Link>
        </motion.div>
      

      {/* Blog Content */}
      <div className="p-6">
        {/* Content Preview */}
        <ContentPreview content={b?.content} key={b?._id} />

        {/* Author, Date, and Read More Link */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Author and Date */}
          <div className="flex items-center gap-2">
            {b?.authorName?.length > 0 && (
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                By {b.authorName}
              </span>
            )}
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              • {formatDate(b?.date)}
            </span>
          </div>

          {/* Read More Link */}
          <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
            <Link
              href={`/blog/${b.blogUrl}`}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200 flex items-center gap-1"
            >
              Read More
              <span className="text-lg">→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SingleBlogCard;