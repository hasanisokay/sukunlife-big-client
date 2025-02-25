"use client";

import { fallbackBlurDataURL } from "@/constants/fallbackBlurDataUrl.mjs";
import formatDate from "@/utils/formatDate.mjs";
import Image from "next/image";
import { memo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import StarRating from "../rating/StarRating";
import { TakaSVG } from "../svg/SvgCollection";
import { useSelector } from "react-redux";
import { formatPrice } from "./CoursePrice";
import fallbaclCourseImage from "@/../public/images/course.jpg";

const CourseCard = ({ course }) => {
  const theme = useSelector((state) => state.theme.mode);
  const [imageError, setImageError] = useState(false);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, rotateX: -5 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring", stiffness: 120, damping: 15 },
    },
    hover: {
      scale: 1.03,
      boxShadow:
        theme === "light"
          ? "0 15px 30px rgba(0, 0, 0, 0.1)"
          : "0 15px 30px rgba(0, 0, 0, 0.5)",
      transition: { duration: 0.3 },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const tagVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: 0.2 } },
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Course: ${course.title}`}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 w-80 mx-auto overflow-hidden cursor-pointer transform-gpu perspective-1000"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {/* Image Section with Overlay */}
      <div className="relative w-80 h-56 overflow-hidden group">
        <Image
          width={600}
          height={400}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          quality={100}
          src={imageError ? fallbaclCourseImage : course.coverPhotoUrl}
          alt={course.title}
          placeholder="blur"
          blurDataURL={fallbackBlurDataURL}
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* "What You'll Learn" Overlay */}
        <motion.div
          className="absolute top-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 shadow-lg p-4 z-10 hidden group-hover:block border-t border-indigo-200 dark:border-indigo-900"
          variants={overlayVariants}
          initial="hidden"
          whileHover="visible"
        >
          <h3 className="text-md font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
            What You'll Learn
          </h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-300 text-xs max-h-32 overflow-y-auto">
            {course.learningItems?.length > 0 ? (
              course.learningItems.slice(0, 4).map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-emerald-500 dark:text-emerald-400 mr-2 text-[12px]">
                    ✓
                  </span>
                  {item.text}
                </li>
              ))
            ) : (
              <li>No learning items available.</li>
            )}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
            <p>
              Last Updated:{" "}
              {formatDate(course.updatedOn ? course.updatedOn : course.addedOn)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Content Section */}
      <Link href={`/courses/${course.courseId}`} passHref>
        <div className="p-5">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
            {course.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            by {course.instructor}
          </p>

          {/* Price and Rating in Two Lines */}
          <div className="mt-3 space-y-2">
            <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 flex items-center">
              <TakaSVG
                className="w-5 h-5 mr-1"
                color={theme === "light" ? "#4f46e5" : "#a5b4fc"}
              />
              {formatPrice(course.price)}
            </p>
            <div className="flex items-center">
              <StarRating
                ratingCount={course.reviewsCount}
                totalRating={course.ratingSum}
                size="sm"
              />
            </div>
          </div>

          {/* Enrollment Info */}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {course.studentsCount.toLocaleString()} students enrolled
          </p>

          {/* Tags */}
          <motion.div
            className="mt-4 flex flex-wrap gap-2"
            variants={tagVariants}
            initial="hidden"
            animate="visible"
          >
            {course?.tags?.split(",").map((tag, index) => (
              <motion.span
                key={index}
                className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200"
                variants={tagVariants}
              >
                {tag.trim()}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

export default memo(CourseCard);