'use client'
import { fallbackBlurDataURL } from "@/constants/fallbackBlurDataUrl.mjs";
import formatDate from "@/utils/formatDate.mjs";
import Image from "next/image";
import { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link"; // Import the Link component

const formatPrice = (price) => {
    return `৳ ${price.toLocaleString()}`;
};

const CourseCard = ({ course }) => {
    console.log(course);

    // Animation variants for the card
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        hover: { scale: 1.02, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)", transition: { duration: 0.3 } },
    };

    // Animation variants for the overlay
    const overlayVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    };

    // Animation variants for the tags
    const tagVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut" } },
    };

    return (
        <Link href={`/courses/${course.courseId}`} passHref> {/* Add the Link here */}
            <motion.div
                role="button"
                tabIndex={0}
                aria-label={`Course: ${course.title}`}
                className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl transition-all hover:shadow-xl w-80 mx-auto overflow-hidden cursor-pointer"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
            >
                <div className="relative group w-80 h-[200px]">
                    <Image
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                        quality={100}
                        src={course.coverPhotoUrl}
                        alt={course.title}
                        placeholder="blur"
                        blurDataURL={fallbackBlurDataURL}
                    />
                    <motion.div
                        className="absolute hidden group-hover:block top-0 right-0 left-0 bg-white dark:bg-gray-800 shadow-xl w-80 p-5 z-10"
                        variants={overlayVariants}
                        initial="hidden"
                        whileHover="visible"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            What You'll Learn
                        </h3>
                        <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                            {course.learningItems?.length > 0 ? (
                                course?.learningItems?.slice(0, 4)?.map((item, index) => (
                                    <li key={index} className="flex items-center">
                                        <span className="text-green-500 mr-2">✔</span> {item.text}
                                    </li>
                                ))
                            ) : (
                                <li>No learning items available.</li>
                            )}
                        </ul>
                        <div className="mt-4 flex flex-wrap justify-between text-xs text-gray-500 dark:text-gray-400">
                            <p>Added: {formatDate(course.addedOn)}</p>
                            {course.updatedOn && <p>Updated: {formatDate(course.updatedOn)}</p>}
                        </div>
                    </motion.div>
                </div>
                <div className="p-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {course.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {course.instructor}
                    </p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                        {formatPrice(course.price)}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-gray-600 dark:text-gray-400 text-sm">
                        <span>Students: {course.studentsCount}</span>
                        <span>Reviews: {course.reviewsCount}</span>
                    </div>

                    {/* Tags Section */}
                    <motion.div
                        className="mt-4 flex flex-wrap gap-2"
                        variants={tagVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {course?.tags?.split(",")?.map((tag, index) => (
                            <motion.span
                                key={index}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-full"
                                variants={tagVariants}
                            >
                                {tag}
                            </motion.span>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </Link>
    );
};

export default memo(CourseCard);