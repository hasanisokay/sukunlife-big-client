'use client';

import Link from "next/link";
import { motion } from "framer-motion";

const TagsPage = ({tags}) => {

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Title */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8"
                >
                    Explore Blog Tags
                </motion.h1>

                {/* Tags Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {tags.map((tag, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href={`/blog/tags/${encodeURIComponent(tag)}`}
                                className="block p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg text-center hover:shadow-lg transition-shadow duration-300"
                            >
                                <span className="text-lg font-medium text-blue-600 dark:text-blue-400">
                                    #{tag}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TagsPage;