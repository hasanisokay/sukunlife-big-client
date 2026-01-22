"use client";

import Link from "next/link";

// import { useDispatch, useSelector } from "react-redux";
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
  return (
    <div>

      <div className=" text-white md:h-[890px] ">
        {/* Hero Section */}
        <section className="h-[690px] flex flex-col items-center justify-center px-4 text-center ">
          <div className="absolute top-0 bottom-0 right-0 left-0 h-[800px]">
            <Image 
            className="w-full h-[800px]  object-cover pointer-events-none select-none" 
            src={homeTopBanner} 
            width={1000} 
            height={1000} 
            alt="Quran background for home top banner" 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
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
              <p className="text-2xl font-semibold text-gray-800">01915 109430</p>
              <p className="text-sm text-gray-600">Mon – Sun | 10AM – 10PM</p>
            </div>
            <div>
              <h3 className="font-bold">Booking Information</h3>
              <p className="text-2xl font-semibold text-gray-800">01887 753555</p>
              <p className="text-sm text-gray-600">Mon – Sun | 10AM – 10PM</p>
            </div>
          </div>
        </section>
        <div className="relative flex justify-end -mt-[100px] pointer-events-none select-none">
          <DotsSVG2 width={'150'} height={'120'} />
        </div>
      </div>
      <SelfDiagnosisSection />
      <CoursesSectionHome topCourses={topCourses} />
      <ProductSectionHome topProducts={topProducts} />
      <SelfRuqyahResoursesSectionHome />
      <BlogsAndArticleSectionHome recentBlogs={recentBlogs} />
      <TestimonialSectionHome appointmentReviews={appointmentReviews} shopReviews={shopReviews} courseReviews={courseReviews} />
    </div>
  );
};

export default Homepage;