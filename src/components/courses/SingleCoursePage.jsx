'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SingleCoursePage = ({ course }) => {
    console.log(course)
    const [expandedModule, setExpandedModule] = useState(null);
    const toggleModule = (index) => {
        setExpandedModule(expandedModule === index ? null : index);
    };

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-lg rounded-xl p-6 w-full max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
            <p className="text-gray-600 dark:text-gray-300">{course.instructor}</p>
            <p className="text-lg font-semibold mt-2">BDT {course.price}</p>
            <p className="text-gray-700 dark:text-gray-400 mt-2">{course.seoDescription}</p>

            {/* Modules */}
            <div className="mt-4">
                {course.modules.map((module, index) => (
                    <div key={index} className="border-b border-gray-300 dark:border-gray-700 py-2">
                        <button
                            className="w-full text-left flex justify-between items-center py-2 font-medium text-lg"
                            onClick={() => toggleModule(index)}
                        >
                            {module.title}
                            <span>{expandedModule === index ? '−' : '+'}</span>
                        </button>
                        <AnimatePresence>
                            {expandedModule === index && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    {module.items.map((item, i) => (
                                        <div key={i} className="p-2 pl-4 border-l border-gray-400 dark:border-gray-600">
                                            <h4 className="text-md font-semibold">{item.title}</h4>
                                            {item.status === 'public' && <p className="text-gray-600 dark:text-gray-300">{item.description}</p>}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SingleCoursePage;