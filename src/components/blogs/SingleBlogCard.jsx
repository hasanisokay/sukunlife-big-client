'use client';

import blogCover from "@/../public/images/blog.jpg";
import formatDate from "@/utils/formatDate.mjs";
import Link from "next/link";
import Image from "next/image";
import { fallbackBlurDataURL } from "@/constants/fallbackBlurDataUrl.mjs";
import { useState } from "react";
import { motion } from "framer-motion";

const SingleBlogCard = ({ b }) => {
    const [imageUrl, setImageUrl] = useState(b?.blogCoverPhoto);

    const handleImageError = () => {
        setImageUrl(blogCover);
    };

    const ContentPreview = ({ content }) => {
        const plainText = content?.replace(/<[^>]+>/g, " ");
        return (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {plainText?.slice(0, 200)}{plainText?.length > 200 ? "..." : ""}
            </p>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            key={b._id}
            className="bg-white dark:bg-gray-800 shadow-md max-w-4xl mx-auto rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
        >
            {/* Blog Cover Photo with Gradient Overlay */}
            {b?.blogCoverPhoto && (
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-52 relative overflow-hidden"
                >
                    <Link href={`/blog/${b.blogUrl}`}>
                        <Image
                            width={600}
                            height={400}
                            className="w-full h-full object-cover"
                            quality={100}
                            src={imageUrl}
                            alt={b.title}
                            onError={handleImageError}
                            placeholder="blur"
                            blurDataURL={fallbackBlurDataURL}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </Link>
                </motion.div>
            )}

            {/* Blog Content */}
            <div className="p-6">
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {b.title}
                </h2>

                {/* Content Preview */}
                <ContentPreview content={b?.content} key={b?._id} />

                {/* Author, Date, and Read More Link */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Author and Date */}
                    <div className="flex items-center gap-2">
                        {b?.authorName?.length > 0 && (
                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                                By {b.authorName}
                            </span>
                        )}
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                            • {formatDate(b?.date)}
                        </span>
                    </div>

                    {/* Read More Link */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            href={`/blog/${b.blogUrl}`}
                            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                            Read More →
                        </Link>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default SingleBlogCard;