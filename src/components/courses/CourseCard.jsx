"use client";

import { fallbackBlurDataURL } from "@/constants/fallbackBlurDataUrl.mjs";
import formatDate from "@/utils/formatDate.mjs";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import StarRating from "../rating/StarRating";
import { TakaSVG } from "../svg/SvgCollection";
import { useDispatch, useSelector } from "react-redux";
import { formatPrice } from "./CoursePrice";
import fallbaclCourseImage from "@/../public/images/course.jpg";
import addToCart from "../cart/functions/addToCart.mjs";
import { Flip, toast, ToastContainer } from 'react-toastify';
import { setCartData } from '@/store/slices/cartSlice';
import getTwoLinesOfDescription from "@/utils/getTwoLinesOfDescription.mjs";

const CourseCard = ({ course }) => {
  const theme = useSelector((state) => state.theme.mode);
  const [imageError, setImageError] = useState(false);
  const coursesEnrolled = useSelector((state) => state.user.enrolledCourses);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const dispatch = useDispatch();
  const [itemAddedToCart, setItemAddedToCart] = useState(false);
  const cart = useSelector((state) => state.cart.cartData);
  const user = useSelector((state) => state.user.userData);

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
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
  useEffect(() => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((cartItem) => cartItem._id === course._id);
    if (existingIndex !== -1) {
      setItemAddedToCart(true)
    }
  }, [cart])
  return (
    <div className="bg-[#F8F5F5] w-[350px] rounded-[24px] montserrat-font border-none outline-none text-black">
      {/* Image Section with Overlay */}
      <div className="relative  w-[350px]  h-56 overflow-hidden group rounded-[22px]">
        <Image
          width={600}
          height={400}
          className="w-full h-full object-cover transition-transform duration-500 border-none outline-none"
          quality={100}
          src={imageError ? fallbaclCourseImage : course.coverPhotoUrl}
        // src={'https://images.pexels.com/photos/10788135/pexels-photo-10788135.jpeg'}
          alt={course.title}
          placeholder="blur"
          blurDataURL={fallbackBlurDataURL}
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/60 to-transparent opacity-0 group-active:opacity-100 group-focus:opacity-100   group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* "What You'll Learn" Overlay */}
        <div
          className="absolute top-0 left-0 right-0 bottom-1 bg-white/95 dark:bg-gray-800/95 shadow-lg p-4 z-10 hidden group-active:block group-hover:block border-t border-indigo-200 dark:border-indigo-900"

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
                  <span className="line-clamp-2">{item.text}</span>
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
        </div>
      </div>

      {/* Content Section */}

      <div className="px-5 pt-[16px] pb-[30px] max-w-[350px]">
        <Link href={`/courses/${course.courseId}`} passHref>
          <h2 className="text-lg font-medium text-black  line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
            {course.title}
          </h2>
          {/* <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            by {course.instructor}
          </p> */}
          <div className="text-wrapped max-w-[350px] text-sm">
            {getTwoLinesOfDescription(course?.description || null)}
          </div>
        </Link>
        {/* Price and Rating in Two Lines */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center">
            <StarRating
              ratingCount={course.reviewsCount}
              totalRating={course.ratingSum}
              size="sm"
              showCount={false}
            />
          </div>
          <p className="italic">Duration: {course?.duration || "Not available"}</p>
          <div className="flex justify-between gap-2">
            <p className="text-xl text-black font-semibold flex items-center">
              <span>Price:</span> &nbsp; <TakaSVG
                className="w-5 h-5 mr-1"
                color={theme === "light" ? "#00000" : "#00000"}
              />
              {formatPrice(course.price)}
            </p>
            <button
              // disabled={itemAddedToCart}
              className="bg-[#ffc267] md:h-[50px] h-[40px] md:w-[160px] w-[120px]  text-black rounded-full transition-colors"
              onClick={() => {
                if (alreadyEnrolled) {
                  return window.location.href = `/dashboard/c/${course?.courseId}`
                }
                return handleAddToCart(false)
              }}
            >
              {alreadyEnrolled ? "Continue to course" : itemAddedToCart ? "View Cart" : "Add to cart"}
            </button>
          </div>
          
        </div>

        {/* Enrollment Info */}
        {/* <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {course.studentsCount.toLocaleString()} students enrolled
        </p> */}

      </div>
      <ToastContainer transition={Flip} />
    </div>
  );
};

export default memo(CourseCard);