'use client';

import { useEffect, useState } from 'react';
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
import FixedCart from '../shared/FixedCart';
import getTwoLinesOfDescription from '@/utils/getTwoLinesOfDescription.mjs';

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
        <div className="bg-white  text-white rounded-xl w-full max-w-7xl mx-auto p-6">
            {/* Cover Photo with Instructor, Tags, and Enroll Button */}
            {course?.coverPhotoUrl && <section className="h-[690px] flex flex-col items-center justify-center px-4 text-center ">
                <div className="absolute top-0 bottom-0 right-0 left-0 h-[800px]">
                    <Image className="w-full h-[800px]  object-cover pointer-events-none select-none" src={course.coverPhotoUrl} width={1000} height={1000} alt="Quran background for home top banner" />
                </div>
                <div className="bg-black bg-opacity-60 w-full h-[800px] absolute top-0 bottom-0 right-0 left-0">
                </div>
                <div className="relative z-10 max-w-4xl text-start">
                    <h1 className="text-white md:text-[40px] text-[30px] font-bold leading-tight charisSIL-font ">
                        {course.title}
                    </h1>
                    <p className="mt-4 text-sm sm:text-base text-white">
{getTwoLinesOfDescription()}                     
                    </p>


                </div>
            </section>}
            {/* Course Details */}
            <div
                className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
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
            </div>

            {/* What You'll Learn */}
            <div
                className="shadow-lg p-5 my-4 max-w-4xl bg-white dark:bg-gray-800 border rounded-lg"
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
            </div>

            {/* Modules Section */}
            <div
                className="shadow-lg p-5 my-4 max-w-4xl bg-white dark:bg-gray-800 border rounded-lg"

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
                                    <span
                                    >
                                        &#9660;
                                    </span>
                                </button>
                                {expandedModule === index && (
                                    <ul
                                        className="mt-2 space-y-3"
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
                                    </ul>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No modules available.</p>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div id="reviews" className="shadow-lg p-5 my-4 max-w-4xl bg-white dark:bg-gray-800 border rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reviews</h3>
                <div className="mt-4 space-y-4">
                    {course.reviews?.length > 0 ? (
                        course.reviews.map((review, index) => (
                            <div
                                key={index}
                                className="border-b pb-4"
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
                            </div>
                        ))
                    ) : (
                        <p>No reviews available.</p>
                    )}
                </div>
            </div>

            {/* Video Modal */}
            <>
                {videoModal.isOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <div
                            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl relative"
                        >
                            <CustomYouTubePlayer url={videoModal.url} />
                            <div className='absolute top-0 right-0'>
                                <button title='Close' onClick={closeVideoModal} className='rounded-full bg-red-600 px-2 text-lg'>
                                    X
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
            {/* Fixed Cart Icon */}
            <FixedCart />
            <ToastContainer transition={Flip} />
        </div>
    );
}

export default SingleCoursePage;