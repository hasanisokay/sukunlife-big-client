"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import { toggleTheme } from "@/store/slices/themeSlice";
import "swiper/css/pagination";
import StarRating from "../rating/StarRating";
import ProductImage from "./ProductImage";
import CourseCard from "../courses/CourseCard";
import SingleBlogCard from "../blogs/SingleBlogCard";
import { TakaSVG } from "../svg/SvgCollection";
import formatDate from "@/utils/formatDate.mjs";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import homeTopBanner from "@/../public/bgImages/home-banner.jpeg"
import DotsSVG from "../svg/DotsSVG";
import DotsSVG2 from "../svg/DotsSVG2";
import SelfDiagnosisSection from "./SelfDiagnoseSection";
import CoursesSectionHome from "./CoursesSectionHome";
import ProductSectionHome from "./ProductSectionHome";
import SelfRuqyahResoursesSectionHome from "./SelfRuqyahResoursesSectionHome";
import BlogsAndArticleSectionHome from "./BlogsAndArticleSectionHome";
import TestimonialSectionHome from "./TestimonialSectionHome";
// SVG Icons
const BookSVG = () => (
  <svg className="w-10 h-10 mr-3 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShopSVG = ({ color }) => (
  <svg className={`w-10 h-10 mr-3 ${color ? color : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18l-2 9H5L3 3zm0 0l2 9m0 0l2 6h10l2-6m-8 0h4" />
  </svg>
);

const CourseSVG = () => (
  <svg className="w-10 h-10 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
  </svg>
);

const TestSVG = () => (
  <svg className="w-10 h-10 mr-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const StarSVG = () => (
  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const QuoteSVG = () => (
  <svg className="w-6 h-6 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432 .917-4.995 2.638-4.995 5.458v10.391h-5.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433 .917-4.996 2.638-4.996 5.458v10.391h-5z" />
  </svg>
);

const BlogSVG = () => (
  <svg className="w-10 h-10 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l5 5v11a2 2 0 01-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 4v5h5" />
  </svg>
);

const ReviewSVG = () => (
  <svg className="w-10 h-10 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5v-2a2 2 0 012-2h10a2 2 0 012 2v2h-4m-6 0h6m-9-12h12a2 2 0 012 2v2H5V6a2 2 0 012-2z" />
  </svg>
);

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Homepage = ({ topProducts, appointmentReviews, shopReviews, courseReviews, topCourses, recentBlogs }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const themeSwitch = (
    <button className="px-3 py-2" onClick={() => dispatch(toggleTheme())}>
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="#ffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3.32 11.684a9 9 0 0 0 17.357 3.348A9 9 0 0 1 8.32 6.683c0-1.18.23-2.32.644-3.353a9 9 0 0 0-5.645 8.354"
          ></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <g fill="#000000">
            <path d="M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0"></path>
            <path
              fillRule="evenodd"
              d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M4.399 4.399a.75.75 0 0 1 1.06 0l.393.392a.75.75 0 0 1-1.06 1.061l-.393-.393a.75.75 0 0 1 0-1.06m15.202 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 0M1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75m-2.102 6.148a.75.75 0 0 1 1.06 0l.393.393a.75.75 0 1 1-1.06 1.06l-.393-.393a.75.75 0 0 1 0-1.06m-12.296 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 1 1-1.06-1.06l.392-.393a.75.75 0 0 1 1.061 0M12 20.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75"
              clipRule="evenodd"
            ></path>
          </g>
        </svg>
      )}

    </button>
  );
  return (
    <div>

      <div className=" text-white md:h-[890px] ">
        {/* Hero Section */}
        <section className="h-[690px] flex flex-col items-center justify-center px-4 text-center ">
          <div className="absolute top-0 bottom-0 right-0 left-0 h-[800px]">
            <Image className="w-full h-[800px]  object-cover pointer-events-none select-none" src={homeTopBanner} width={1000} height={1000} alt="Quran background for home top banner" />
          </div>
          <div className="bg-black bg-opacity-60 w-full h-[800px] absolute top-0 bottom-0 right-0 left-0">
          </div>
          <div className="relative z-10 max-w-4xl -mt-[100px] ">
            <h1 className="md:text-[60px] text-[30px] font-bold leading-tight">
              Your Path to <span className="text-green">Spiritual Healing</span><br />
              <span className="text-green">& Well-Being</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white">
              Experience personalized Ruqya sessions with certified practitioners. Whether you are struggling with
              spiritual distress, negative energies, or personal mental issues, our consultations are tailored to provide
              healing and clarity.
            </p>
            <button className="mt-6 btn-rounded-green text-white font-semibold py-2 px-6 rounded-full transition">
              <Link href={'/book-appointment'} >Book an appointment</Link>
            </button>

          </div>
        </section>
        <div className="-mt-[60px] -ml-10 relative pointer-events-none select-none">
          <DotsSVG fillColorCode={'#ffffff'} width={'150'} height={'120'} />
        </div>
        {/* Info Section */}
        <section className="bg-[#EBF6ED] text-black px-6 py-10 -mt-[180px] rounded-t-[2rem] shadow-lg max-w-4xl mx-auto relative z-20">
          <h2 className="text-center text-green font-semibold lg:text-[32px]">Little <span className="text-black">About us</span></h2>
          <p className="text-center mt-2 text-gray-700 text-sm sm:text-base">
            At Sukun Life Counselling Service, we are dedicated to providing holistic healing through Islamic spiritual
            guidance. Whether you seek Ruqyah sessions, self-diagnosis, or more...
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8 text-center">
            <div>
              <h3 className="font-bold">Ruqyah Helpline</h3>
              <p className="text-2xl font-semibold text-gray-800">99 122 22334</p>
              <p className="text-sm text-gray-600">Mon – Thu | 11AM – 4PM</p>
            </div>
            <div>
              <h3 className="font-bold">Booking Information</h3>
              <p className="text-2xl font-semibold text-gray-800">99 122 22334</p>
              <p className="text-sm text-gray-600">Mon – Thu | 11AM – 4PM</p>
            </div>
          </div>
        </section>
        <div className="relative flex justify-end -mt-[100px] pointer-events-none select-none">
          <DotsSVG2 width={'150'} height={'120'} />
        </div>
      </div>
      {/* self diagnose section */}
      <SelfDiagnosisSection />
      <CoursesSectionHome topCourses={topCourses} />
      <ProductSectionHome topProducts={topProducts} />
      <SelfRuqyahResoursesSectionHome />
      <BlogsAndArticleSectionHome recentBlogs={recentBlogs} />
      <TestimonialSectionHome appointmentReviews={appointmentReviews} shopReviews={shopReviews} courseReviews={courseReviews} />
      <div className=" logo-lg">
        {themeSwitch}
      </div>
    </div>
  );
};

export default Homepage;