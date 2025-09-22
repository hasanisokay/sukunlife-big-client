"use client";

import Link from "next/link";
import "swiper/css";
import { toggleTheme } from "@/store/slices/themeSlice";
import "swiper/css/pagination";
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

const Homepage = ({ topProducts, appointmentReviews, shopReviews, courseReviews, topCourses, recentBlogs }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  // const themeSwitch = (
  //   <button className="px-3 py-2" onClick={() => dispatch(toggleTheme())}>
  //     {theme === "dark" ? (
  //       <svg
  //         xmlns="http://www.w3.org/2000/svg"
  //         width="24"
  //         height="24"
  //         fill="none"
  //         viewBox="0 0 24 24"
  //       >
  //         <path
  //           stroke="#ffff"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //           strokeWidth="2"
  //           d="M3.32 11.684a9 9 0 0 0 17.357 3.348A9 9 0 0 1 8.32 6.683c0-1.18.23-2.32.644-3.353a9 9 0 0 0-5.645 8.354"
  //         ></path>
  //       </svg>
  //     ) : (
  //       <svg
  //         xmlns="http://www.w3.org/2000/svg"
  //         width="24"
  //         height="24"
  //         fill="none"
  //         viewBox="0 0 24 24"
  //       >
  //         <g fill="#000000">
  //           <path d="M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0"></path>
  //           <path
  //             fillRule="evenodd"
  //             d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M4.399 4.399a.75.75 0 0 1 1.06 0l.393.392a.75.75 0 0 1-1.06 1.061l-.393-.393a.75.75 0 0 1 0-1.06m15.202 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 0M1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75m-2.102 6.148a.75.75 0 0 1 1.06 0l.393.393a.75.75 0 1 1-1.06 1.06l-.393-.393a.75.75 0 0 1 0-1.06m-12.296 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 1 1-1.06-1.06l.392-.393a.75.75 0 0 1 1.061 0M12 20.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75"
  //             clipRule="evenodd"
  //           ></path>
  //         </g>
  //       </svg>
  //     )}

  //   </button>
  // );
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
            <button className="mt-6 md:w-[350px] w-[320px] h-[60px] md:h-[82px] btn-rounded-green text-white font-semibold rounded-full transition">
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
      {/* <div className=" logo-lg">
        {themeSwitch}
      </div> */}
    </div>
  );
};

export default Homepage;