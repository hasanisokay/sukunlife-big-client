'use client';

import Image from "next/image";
import BlogContent from "./BlogContnet";
import { useState } from "react";
import { motion } from "framer-motion";

const SingleBlogPage = ({ b }) => {
    const [imageUrl, setImageUrl] = useState(b?.blogCoverPhoto);

    const handleImageError = () => {
        setImageUrl(null);
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow-lg rounded-xl">
            {/* Blog Cover Photo with Gradient Overlay */}
            {imageUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-96 overflow-hidden rounded-t-xl"
                >
                    <Image
                        width={1200}
                        height={600}
                        className="w-full h-full object-cover"
                        quality={100}
                        src={imageUrl}
                        alt={b.title}
                        onError={handleImageError}
                        onLoadingComplete={() => setImageUrl(b?.blogCoverPhoto)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </motion.div>
            )}

            {/* Blog Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="py-8"
            >
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    {b?.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    By{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                        {b?.authorName}
                    </span>{" "}
                    on{" "}
                    {new Date(b?.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
                {b?.blogTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 my-4">
                        {b.blogTags.map((tag, index) => (
                            <motion.span
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-800 dark:text-blue-200 rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                            >
                                #{tag}
                            </motion.span>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Blog Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="prose dark:prose-invert max-w-none"
            >
                <BlogContent content={b?.content} />
            </motion.div>

            {/* Updated Info */}
            {b?.updatedOn && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-right"
                >
                    Last updated:{" "}
                    {new Date(b?.updatedOn).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </motion.div>
            )}
        </div>
    );
};

export default SingleBlogPage;