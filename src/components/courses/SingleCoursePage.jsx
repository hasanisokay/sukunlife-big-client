'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from '../rating/StarRating';
import Link from 'next/link';
import formatDate from '@/utils/formatDate.mjs';
import CoursePrice from './CoursePrice';
import { CertificateSVG, QuizSVG, StatsSVG, UpdateSVG, VideoSVG } from '../svg/SvgCollection';
import CustomYouTubePlayer from '../player/CustomPlayer';
import StarsOnly from '../rating/StarsOnly';
import { useDispatch, useSelector } from 'react-redux';
import addToCart from '../cart/functions/addToCart.mjs';
import { setCartData } from '@/store/slices/cartSlice';
import { Flip, toast, ToastContainer } from 'react-toastify';
import Image from 'next/image';
import courseCover from "@/../public/images/course.jpg";

const SingleCoursePage = ({ course }) => {
    const [expandedModule, setExpandedModule] = useState(null);
    const [videoModal, setVideoModal] = useState({ isOpen: false, url: '' });
    const [itemAddedToCart, setItemAddedToCart] = useState(false);
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.userData);
    const cart = useSelector((state) => state.cart.cartData);
    const coursesEnrolled = useSelector((state) => state.user.enrolledCourses);
    const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
    const [imageError, setImageError] = useState(false);
    useEffect(() => {
        if (!coursesEnrolled) return;
        coursesEnrolled?.filter((c) => {
            return c.courseId === course._id
        })
        if (coursesEnrolled?.length > 0) {
            setAlreadyEnrolled(true);
        }
    }, [coursesEnrolled]);

    const overlayVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    };

    const moduleVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeOut" } },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    };

    const groupItems = (items) => {
        return items.reduce((acc, item) => {
            if (item.type === 'quiz') {
                const lastItem = acc[acc.length - 1];
                if (lastItem && lastItem.type === 'quiz') {
                    lastItem.count += 1;
                } else {
                    acc.push({ ...item, count: 1 });
                }
            } else {
                acc.push(item);
            }
            return acc;
        }, []);
    };
    useEffect(() => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingIndex = cart.findIndex((cartItem) => cartItem._id === course._id);
        if (existingIndex !== -1) {
            setItemAddedToCart(true)
        }
    }, [cart])
    const toggleModule = (index) => {
        setExpandedModule(expandedModule === index ? null : index);
    };

    const openVideoModal = (url) => {
        setVideoModal({ isOpen: true, url });
    };

    const closeVideoModal = () => {
        setVideoModal({ isOpen: false, url: '' });
    };

    const handleAddToCart = async (buyNow) => {
        if (itemAddedToCart) return window.location.href = "/cart";
        const cartItem = {
            _id: course._id,
            type: 'course',
            courseId: course?.courseId,
            title: course?.title,
            price: course.price,
            quantity: 1,
            image: course?.coverPhotoUrl,
        };
        const c = await addToCart(cartItem, user);
        dispatch(setCartData(c));

        if (buyNow) {
            window.location.href = "/cart"
        } else {
            toast.success('Added to cart.', { autoClose: 700 })
        }

    };

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl w-full max-w-7xl mx-auto p-6">
            {/* Cover Photo with Instructor, Tags, and Enroll Button */}
            {course.coverPhotoUrl && (
                <motion.div
                    className="relative h-96 rounded-lg overflow-hidden mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }}
                >
                    <Image
                        width={1200}
                        height={600}
                        className="w-full h-full object-cover"
                        quality={100}
                        src={imageError ? courseCover : course?.coverPhotoUrl ? course?.coverPhotoUrl : courseCover}
                        alt={course?.title||"Course Cover"}
                        onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                        <div className="flex md:flex-row flex-col gap-3 md:gap-0 justify-between items-end">
                            <div>
                                <p className="text-sm text-gray-300">Instructor: {course.instructor}</p>
                                <h1 className="text-4xl font-bold text-white mt-2">{course.title}</h1>
                                {/* Tags Section */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {course.tags?.split(', ').map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-white/20 text-white text-sm px-3 py-1 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button
                                // disabled={itemAddedToCart}
                                className="bg-blue-600 text-white px-6 md:py-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => {
                                    if (alreadyEnrolled) {
                                        return window.location.href = `/dashboard/c/${course?.courseId}`
                                    }
                                    return handleAddToCart(false)
                                }}
                            >
                                {alreadyEnrolled ? "Continue to course" : itemAddedToCart ? "View Cart" : " Enroll Now"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Course Details */}
            <motion.div
                className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
            >
                <CoursePrice price={course.price} />
                <Link href={'#reviews'} className='max-w-fit'>
                    <StarRating ratingCount={course.reviewsCount} totalRating={course.ratingSum} />
                </Link>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <CertificateSVG /> <p className='font-semibold'>Certificate of completion</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <UpdateSVG /> <p className='font-semibold'>Last Updated: {formatDate(course.updatedOn || course.addedOn)}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <StatsSVG /> <p className='font-semibold'>Total Enrolled: {course.studentsCount}</p>
                </div>
            </motion.div>

            {/* What You'll Learn */}
            <motion.div
                className="shadow-lg p-5 my-4 max-w-4xl bg-white dark:bg-gray-800 border rounded-lg"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">What You'll Learn</h3>
                <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600 dark:text-gray-300 text-sm">
                    {course.learningItems?.length > 0 ? (
                        course.learningItems.map((item, index) => (
                            <li key={index} className="flex items-center">
                                <span className="text-green-500 mr-2 text-sm">&#10003;</span> {item.text}
                            </li>
                        ))
                    ) : (
                        <li>Not available.</li>
                    )}
                </ul>
            </motion.div>

            {/* Modules Section */}
            <motion.div
                className="shadow-lg p-5 my-4 max-w-4xl bg-white dark:bg-gray-800 border rounded-lg"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Modules</h3>
                <div className="mt-4 space-y-4">
                    {course.modules?.length > 0 ? (
                        course.modules.map((module, index) => (
                            <div key={index} className="border-b pb-4">
                                <button
                                    onClick={() => toggleModule(index)}
                                    className="w-full flex justify-between items-center text-left"
                                >
                                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                                        {module.title}
                                    </h4>
                                    <motion.span
                                        animate={{ rotate: expandedModule === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        &#9660;
                                    </motion.span>
                                </button>
                                <AnimatePresence>
                                    {expandedModule === index && (
                                        <motion.ul
                                            className="mt-2 space-y-3"
                                            variants={moduleVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                        >
                                            {groupItems(module.items).map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                                                    {item.type === 'video' && (
                                                        <div className='flex items-center'>
                                                            <span className="text-blue-500 mr-2">
                                                                <VideoSVG />
                                                            </span>
                                                            <button
                                                                onClick={() => item.url && openVideoModal(item.url)}
                                                                className="hover:underline text-start"
                                                            >
                                                                {item.title || 'Untitled'}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {item.type === 'textInstruction' && (
                                                        <>
                                                            <span className="text-green-500 mr-2">&#9998;

                                                            </span>
                                                            {item.title || 'Untitled'}
                                                            {item.status === 'public' && (
                                                                <div
                                                                    className="mt-2 text-sm text-gray-700 dark:text-gray-300"
                                                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                    {item.type === 'quiz' && (
                                                        <div className='flex items-center'>
                                                            <span className="text-purple-500 mr-2 inline-block"><QuizSVG />
                                                            </span>
                                                            {item.title || 'Quiz'} ({item.count})
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    ) : (
                        <p>No modules available.</p>
                    )}
                </div>
            </motion.div>

            {/* Reviews Section */}
            <div id="reviews" className="shadow-lg p-5 my-4 max-w-4xl bg-white dark:bg-gray-800 border rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reviews</h3>
                <div className="mt-4 space-y-4">
                    {course.reviews?.length > 0 ? (
                        course.reviews.map((review, index) => (
                            <motion.div
                                key={index}
                                className="border-b pb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: index * 0.1 } }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{review.name}</p>
                                        {review?.date && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {formatDate(review?.date)}
                                            </p>
                                        )}
                                    </div>
                                    <StarsOnly star={review?.rating} />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{review.comment}</p>
                            </motion.div>
                        ))
                    ) : (
                        <p>No reviews available.</p>
                    )}
                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {videoModal.isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl relative"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <CustomYouTubePlayer url={videoModal.url} />
                            <div className='absolute top-0 right-0'>
                                <button title='Close' onClick={closeVideoModal} className='rounded-full bg-red-600 px-2 text-lg'>
                                    X
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
                  {/* Fixed Cart Icon */}
                  {cart?.length > 0 && (
                    <Link href="/cart" passHref>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="fixed bottom-8 right-8 bg-[#2e3e23] text-white p-4 rounded-full shadow-lg hover:bg-[#4a5e3b] transition-all duration-300 z-50"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18l-2 9H5L3 3zm0 0l2 9m0 0l2 6h10l2-6m-8 0h4" />
                        </svg>
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {cart.length}
                        </span>
                      </motion.div>
                    </Link>
                  )}
            <ToastContainer transition={Flip} />
        </div>
    );
}

export default SingleCoursePage;