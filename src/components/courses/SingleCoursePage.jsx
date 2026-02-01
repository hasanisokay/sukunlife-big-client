'use client';

import { useEffect, useState } from 'react';
import StarRating from '../rating/StarRating';
import Link from 'next/link';
import formatDate from '@/utils/formatDate.mjs';
import { formatPrice } from './CoursePrice';
import { QuizSVG, TakaSVG, } from '../svg/SvgCollection';
import CustomYouTubePlayer from '../player/CustomPlayer';
import StarsOnly from '../rating/StarsOnly';
import { useDispatch, useSelector } from 'react-redux';
import addToCart from '../cart/functions/addToCart.mjs';
import { setCartData } from '@/store/slices/cartSlice';
import { Flip, toast, ToastContainer } from 'react-toastify';
import Image from 'next/image';
import FixedCart from '../shared/FixedCart';
import TickSVG from '../svg/TickSVG';
import BlogContent from '../blogs/BlogContnet';
import { SERVER } from '@/constants/urls.mjs';

const SingleCoursePage = ({ course, enrollData }) => {
    const [expandedModule, setExpandedModule] = useState(null);
    const [videoModal, setVideoModal] = useState({ isOpen: false, url: '' });
    const [itemAddedToCart, setItemAddedToCart] = useState(false);
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.userData);
    const [coursePrice, setCoursePrice] = useState(course?.price || 0);
    const theme = useSelector((state) => state.theme.mode);
    const cart = useSelector((state) => state.cart.cartData);
    const coursesEnrolled = useSelector((state) => state.user.enrolledCourses);


    const [imageError, setImageError] = useState(false);
    const [typedVoucher, setTypedVoucher] = useState("");
    const [voucherMessage, setVoucherMessage] = useState('');
    const [voucherError, setVoucherError] = useState('');

    let alreadyEnrolled = enrollData?.enrolled || false;
    let lastModule = enrollData?.progress?.currentModule || course?.modules[0]?.moduleId;
    let lastItem = enrollData?.progress?.currentItem || course?.modules[0]?.items[0].itemId;

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
    const validateVoucher = async (voucherPassed) => {
        if (!typedVoucher && !voucherPassed) return;

        try {
            const response = await fetch(`${SERVER}/api/public/check-voucher?code=${typedVoucher || voucherPassed || ""}&&totalPrice=${course?.price}`);
            const data = await response.json();
            if (data?.isValid) {
                const calculatedDiscount = data.discount;
                const calculatedFinalPrice = data.finalPrice;
                setCoursePrice(calculatedFinalPrice);
                setVoucherError('');
                setVoucherMessage(data.message);
                localStorage.setItem('voucher', JSON.stringify(typedVoucher || voucherPassed))
            } else {
                setVoucherMessage('')
                setVoucherError(data.message);
            }
        } catch (error) {
            console.error("Error validating voucher:", error);
        }
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
    const getInstructorDesignation = (text) => {
        if (text.length === 0) return "";
        return text.split(",").join(" | ")
    }


    return (
        <div className="bg-white  min-h-fit text-black rounded-xl min-w-full max-w-7xl mx-auto  montserrat-font">
            {/* Cover Photo with Instructor, Tags, and Enroll Button */}
            {course?.coverPhotoUrl &&
                <section className="h-[690px] md:w-[calc(100vw-450px)] flex flex-col items-center justify-center md:px-4 px-2 text-center ">
                    <div className="absolute top-0 bottom-0 right-0 left-0 h-[800px]">
                        <Image className="w-full h-[800px]  object-cover pointer-events-none select-none" src={course.coverPhotoUrl} width={1000} height={1000} alt="Quran background for home top banner" />
                    </div>
                    <div className="bg-black bg-opacity-60 w-full h-[800px] absolute top-0 bottom-0 right-0 left-0">
                    </div>
                    <div className="relative z-10 max-w-4xl text-start text-white">
                        <h1 className="text-white md:text-[40px] text-[30px] font-bold leading-tight charisSIL-font ">
                            {course.title}
                        </h1>
                        <p className="mt-4 text-sm sm:text-base text-white">
                            {course?.shortDescription}
                        </p>
                        <div className='flex gap-[50px]' >
                            <div className='flex gap-1 items-center pt-[20px]'>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="#fff"
                                        d="M20 17a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H9.46c.35.61.54 1.3.54 2h10v11h-9v2m4-10v2H9v13H7v-6H5v6H3v-8H1.5V9a2 2 0 0 1 2-2zM8 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0"
                                    ></path>
                                </svg>
                                <p>{course.instructor}</p>
                            </div>
                            <div className='flex gap-1 items-center pt-[20px]'>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="#fff"
                                        d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16m0 2a1 1 0 0 1 .993.883L13 7v4.586l2.707 2.707a1 1 0 0 1-1.32 1.497l-.094-.083-3-3a1 1 0 0 1-.284-.576L11 12V7a1 1 0 0 1 1-1"
                                    ></path>
                                </svg>
                                <p>{course.duration}</p>
                            </div>
                        </div>
                        <h3 className='flex  items-center pt-[30px] text-[32px] gap-[15px] charisSIL-font'>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="130"
                                height="1"
                                fill="none"
                                viewBox="0 0 130 1"
                            >
                                <path stroke="#fff" d="M0 .5h130"></path>
                            </svg>  Course Includes
                        </h3>
                        <div className='grid md:grid-cols-2 grid-cols-1 max-h-[120px] overflow-hidden  gap-0'>
                            {course?.courseIncludes?.length > 0 && course?.courseIncludes?.map((cI, idx) => <p className='flex gap-[8px] items-center ' key={idx}><TickSVG /> {cI?.text} </p>)}
                        </div>
                    </div>
                </section>}
            {/* Course Details */}
            <div className='md:absolute relative lg:right-[100px] md:right-[50px] top-[70%] z-10'>
                <div className='rounded-3xl my-4 md:mx-0 mx-auto max-w-4xl bg-[#EFEFEF] w-[380px]'>
                    <div className='rounded-3xl h-[214px] w-[380px]'>
                        <Image className='rounded-3xl h-[214px] w-[380px]' width={1000} height={1000} alt='Instructor image/Intro video' src={course?.instructorImage} />
                    </div>
                    <div className='p-[32px]'>
                        <h3 className='charisSIL-font text-[32px] font-bold'>{coursePrice || course.price} TK</h3>
                        <p className='line-clamp-3'>{course?.shortDescription}</p>
                        <Link href={'#reviews'} className='max-w-fit'>
                            <StarRating ratingCount={course?.reviewsCount} totalRating={course?.ratingSum} />
                        </Link>
                        <p className="italic">Duration: {course?.duration || "Not available"}</p>
                        <div className={`${alreadyEnrolled ? 'mb-3 text-center w-full':'flex justify-between items-center gap-2'}`}>
                        {!alreadyEnrolled &&    <p className="text-xl text-black font-semibold flex items-center ">
                                <span>Price:</span> &nbsp; <TakaSVG
                                    className="w-5 h-5 mr-1"
                                    color={theme === "light" ? "#00000" : "#00000"}
                                />
                                {formatPrice(coursePrice || course.price)}
                            </p>}
                            <button
                                // disabled={itemAddedToCart}
                                className={`rounded-full transition-colors font-semibold bg-[#ffc267] md:h-[50px]  ${alreadyEnrolled ?"w-full" :" h-[40px] md:w-[160px] w-[120px]  text-black "}`}
                                onClick={() => {
                                    if (alreadyEnrolled) {
                                        return window.location.href = `/courses/${course?.courseId}/${lastModule}/${lastItem}`
                                    }
                                    return handleAddToCart(false)
                                }}
                            >
                                {alreadyEnrolled ? "Continue Learning" : itemAddedToCart ? "View Cart" : "Add to cart"}
                            </button>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="322"
                            height="1"
                            fill="none"
                            viewBox="0 0 322 1"
                        >
                            <path stroke="#000" d="M0 .5h322"></path>
                        </svg>
                        <p className='text-[12px] font-light italic text-center'>30-Day Money-Back Guarantee</p>
                        <p className='text-[12px] font-light italic text-center'>Full Lifetime Access</p>
                        <div className='mt-[27px]'>
                            <input
                                type="text"
                                placeholder="Enter your Courpon Code"
                                value={typedVoucher}
                                onChange={(e) => setTypedVoucher(e.target.value)}
                                className={`w-[322px] h-[55px] px-[20px] text-black rounded-full focus:outline-none`}
                            />
                            <button className="w-[322px] mt-[14px] h-[55px] voucher-apply-button text-black rounded-full"
                                onClick={validateVoucher}>
                                Apply
                            </button>
                            {voucherMessage?.length > 0 && <p className="text-green-500 py-1">{voucherMessage}</p>}
                            {voucherError?.length > 0 && <p className="text-red-500 py-1">{voucherError}</p>}
                        </div>
                    </div>

                </div>
                {course?.description && <div className='w-[350px] p-6 '>
                    <h3 className="charisSIL-font md:text-[32px] text-[26px] leading-tight font-semibold text-black dark:text-white">About This Course</h3>
                    <div className='md:overflow-y-auto md:h-screen'>

                        <BlogContent content={course?.description} />
                    </div>
                </div>}
            </div>



            <div className='md:pl-6 md:py-6 md:pr-8 lg:pr-12 md:w-[calc(100vw-480px)]'>
                {/* Modules Section */}
                <div
                    className="p-5 my-4 max-w-4xl bg-white dark:bg-gray-800"

                >
                    <h3 className="charisSIL-font md:text-[40px] text-[30px] leading-tight font-semibold text-black dark:text-white">Course Preview</h3>
                    <div className="mt-4 space-y-4">
                        {course.modules?.length > 0 ? (
                            course.modules.map((module, index) => (
                                <div key={index} className="border-b pb-4">
                                    <button
                                        onClick={() => toggleModule(index)}
                                        className="w-full flex justify-between items-center text-left"
                                    >
                                        <h4 className="text-md font-bold text-gray-800 dark:text-gray-200">
                                            {module.title}
                                        </h4>
                                        <span
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="34"
                                                height="34"
                                                fill="none"
                                                viewBox="0 0 34 34"
                                            >
                                                <path
                                                    fill="#000"
                                                    fillRule="evenodd"
                                                    d="M18.501 22.752a2.125 2.125 0 0 1-3.003 0l-8.016-8.013a2.125 2.125 0 1 1 3.007-3.005l6.51 6.511 6.512-6.51a2.125 2.125 0 0 1 3.006 3.003l-8.014 8.015z"
                                                    clipRule="evenodd"
                                                ></path>
                                            </svg>
                                        </span>
                                    </button>
                                    {expandedModule === index && (
                                        <ul
                                            className="mt-2 space-y-3"
                                        >
                                            {groupItems(module.items).map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                                                    {item.type === 'video' && (
                                                        <div onClick={() => item.url && openVideoModal(item.url)} className='flex items-center justify-between pr-4'>
                                                            <button

                                                                className={`hover:underline text-start ${item.url && 'font-bold'}`}
                                                            >
                                                                {item.title || 'Untitled'}
                                                            </button>
                                                            <span>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="24"
                                                                    height="24"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        fill={item.url ? "#68D585" : "#AAA"}
                                                                        d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"
                                                                    ></path>
                                                                </svg>
                                                            </span>
                                                        </div>
                                                    )}
                                                    {item.type === 'textInstruction' && (
                                                        <>
                                                            <div className='flex items-center justify-between pr-4'>
                                                                <span> {item.title || 'Untitled'}</span>
                                                                <span className="text-green-500">&#9998;

                                                                </span>
                                                            </div>

                                                            {item.status === 'public' && (
                                                                <div
                                                                    className="mt-2 text-sm text-gray-700 dark:text-gray-300"
                                                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                    {item.type === 'file' && (
                                                        <div className='flex items-center justify-between pr-4'>
                                                            <button
                                                                onClick={() => item.url && window.open(item.url.url || item.url, "_blank")}
                                                                className={`hover:underline text-start ${item.url && 'font-bold'}`}
                                                            >
                                                                {item.title || item.url?.originalName || 'File'}
                                                            </button>

                                                            <span>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="22"
                                                                    height="22"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        fill={item.url ? "#2563EB" : "#9CA3AF"}
                                                                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 2.5L19.5 10H14z"
                                                                    />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                    )}

                                                    {item.type === 'quiz' && (
                                                        <div className='flex items-center justify-between pr-4'>
                                                            <span>
                                                                {item.title || 'Quiz'} ({item.count})
                                                            </span>
                                                            <span className="text-purple-500 inline-block"><QuizSVG />
                                                            </span>
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

                {course?.additionalMaterials?.length > 0 && <div className='p-5 my-4 max-w-4xl bg-white dark:bg-gray-800 '>
                    <h3 className="charisSIL-font md:text-[40px] text-[30px] leading-tight font-semibold text-black dark:text-white">Additional Materials</h3>
                    <ul
                        className="mt-2 space-y-3"
                    >
                        {course?.additionalMaterials?.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex justify-between items-center">
                                <span className='font-bold'> {item?.text || 'Untitled'}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="#AAA"
                                        d="M6 22q-.824 0-1.412-.587A1.93 1.93 0 0 1 4 20V10q0-.825.588-1.412A1.93 1.93 0 0 1 6 8h1V6q0-2.075 1.463-3.537T12 1q2.074 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.587 1.413A1.92 1.92 0 0 1 18 22zm6-5q.825 0 1.413-.587A1.92 1.92 0 0 0 14 15q0-.825-.587-1.412A1.93 1.93 0 0 0 12 13a1.9 1.9 0 0 0-1.412.588q-.585.59-.588 1.412a1.92 1.92 0 0 0 .588 1.413q.591.591 1.412.587M9 8h6V6q0-1.25-.875-2.125A2.9 2.9 0 0 0 12 3q-1.25 0-2.125.875A2.9 2.9 0 0 0 9 6z"
                                    ></path>
                                </svg>

                            </li>
                        ))}
                    </ul>
                </div>}

                {course?.additionalMaterials?.length > 0 && <div className='p-5 my-4 max-w-4xl bg-white dark:bg-gray-800 '>
                    <h3 className="charisSIL-font md:text-[40px] text-[30px] leading-tight font-semibold text-black dark:text-white">Who This Course is For</h3>
                    <ul
                        className="mt-2 space-y-3"
                    >
                        {course?.learningItems?.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex justify-start gap-[8px] items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="#63953A"
                                        d="M21 7 9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59z"
                                    ></path>
                                </svg>
                                <span className=''> {item?.text || 'Untitled'}</span>
                            </li>
                        ))}
                    </ul>
                </div>}

                <div className='p-5 my-4 max-w-4xl bg-white dark:bg-gray-800 '>
                    <h3 className="charisSIL-font md:text-[40px] text-[30px] leading-tight font-semibold text-black dark:text-white">Instructor</h3>
                    <div className='py-[24px] flex flex-wrap gap-[43px] items-center'>
                        <div className='w-[144px] h-[144px] rounded-full'>
                            {course?.instructorImage && <Image alt='instructor image' className='w-[144px] h-[144px] rounded-full object-cover' width={1000} height={1000} src={course?.instructorImage} />}
                        </div>
                        <div className=''>
                            <p>{course?.instructor}</p>
                            <p>{getInstructorDesignation(course?.instructorDesignation)}</p>
                        </div>
                    </div>

                    <h4 className='font-bold text-[24px]'>About the Instructor</h4>
                    {course?.aboutInstructor && <BlogContent content={course?.aboutInstructor} key={course._id} />
                    }
                </div>



                {/* Reviews Section */}
                <div id="reviews" className=" p-5 my-4 max-w-4xl bg-white dark:bg-gray-800 ">
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