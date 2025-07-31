"use client";

import { useEffect, useMemo, useState } from "react";
import LoadMoreButton from "../ui/btn/LoadMoreButton";
import CourseCard from "./CourseCard";
import { useSelector } from "react-redux";
import Link from "next/link";


const CoursesPage = ({ courses, page }) => {
  const [savedCourses, setSavedCourses] = useState(courses?.courses);
  const memorizedCourses = useMemo(() => savedCourses, [savedCourses]);
  const cartItems = useSelector((state) => state.cart.cartData);
  const [hasMounted, setHasMounted] = useState(false);


  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true)
    };
  }, [courses]);


  useEffect(() => {
    setSavedCourses(courses?.courses);
  }, [courses]);

  return (
    <div className="montserrat-font py-4">

      {/* Main Content */}
      <div className="mt-12 space-y-8 relative z-10 px-6">
        <section className="mb-12 text-center px-4">
          <h2 className="charisSIL-font md:text-[60px] pt-[44px] text-[30px] font-bold leading-tight text-center dark:text-white">Learn, Heal, and Empower Yourself</h2>
          <p className="max-w-[90vw] mx-auto text-black dark:text-white text-center  pb-[44px]">At Sukun Life, we believe healing and growth start with knowledge. Our courses are designed to equip you with the essential tools to recognize, prevent, and address spiritual and emotional challenges, rooted firmly in the teachings of Qur'an and Sunnah.</p>
        </section>


        {/* Courses Grid */}
        <section className="flex items-start justify-center flex-wrap gap-[30px]">
          {memorizedCourses?.map((c) => (
            <div
              key={c._id}
            >
              <CourseCard course={c} />
            </div>
          ))}
        </section>

        {/* Load More Button */}
        {memorizedCourses?.length < courses?.totalCount && (
          <div className="flex justify-center mt-12">
            <LoadMoreButton page={page} />
          </div>
        )}
      </div>


      {/* Fixed Cart Icon */}
      {hasMounted && cartItems?.length > 0 && (
        <Link href="/cart" passHref>
          <div
            className="fixed bottom-8 right-8 bg-[#2e3e23] text-white p-4 rounded-full shadow-lg hover:bg-[#4a5e3b] transition-all duration-300 z-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18l-2 9H5L3 3zm0 0l2 9m0 0l2 6h10l2-6m-8 0h4" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default CoursesPage;