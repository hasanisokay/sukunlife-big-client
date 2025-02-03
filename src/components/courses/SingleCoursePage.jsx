'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from '../rating/StarRating';
import Link from 'next/link';
import formatDate from '@/utils/formatDate.mjs';
import CoursePrice from './CoursePrice';
import { StatsSVG, UpdateSVG } from '../svg/SvgCollection';

const SingleCoursePage = ({ course }) => {
    console.log(course)
    const [expandedModule, setExpandedModule] = useState(null);
    const toggleModule = (index) => {
        setExpandedModule(expandedModule === index ? null : index);
    };
    const overlayVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    };
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        hover: { scale: 1.02, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)", transition: { duration: 0.3 } },
    };
    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl w-full max-w-7xl mx-auto p-6">
            <motion.div
                className="p-5  bg-white dark:bg-gray-800 "
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
            >
                <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                <p className="text-gray-600 dark:text-gray-300">{course.instructor}</p>
                <CoursePrice price={course.price} />
                <Link href={'#reviews'} className='max-w-fit'>
                    <StarRating ratingCount={course.reviewsCount} totalRating={course.ratingSum} />
                </Link>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <UpdateSVG /> <p className='font-semibold'>Last Updated: {formatDate(course.updatedOn || course.addedOn)}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <StatsSVG /> <p className='font-semibold'>Total Enrolled: {course.studentsCount}</p>
                </div>
            </motion.div>
            <motion.div
                className="shadow-lg p-5 my-4 max-w-4xl  bg-white dark:bg-gray-800 border"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"

            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    What You'll Learn
                </h3>
                <ul className="mt-3 grid grid-cols-1  md:grid-cols-2 text-gray-600 dark:text-gray-300 text-sm">
                    {course.learningItems?.length > 0 ? (
                        course?.learningItems?.map((item, index) => (
                            <li key={index} className="flex items-center">
                                <span className="text-green-500 mr-2 text-[14px]">		&#10003;</span> {item.text}
                            </li>
                        ))
                    ) : (
                        <li>Not available.</li>
                    )}
                </ul>

            </motion.div>
            {/* </motion.div> */}
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
            <div id='reviews'>
                rating showing area
            </div>
        </div>
    );
}

export default SingleCoursePage;