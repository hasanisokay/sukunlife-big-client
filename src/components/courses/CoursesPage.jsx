"use client";

import { useEffect, useMemo, useState } from "react";
import LoadMoreButton from "../ui/btn/LoadMoreButton";
import CourseCard from "./CourseCard";
import { useSelector } from "react-redux";
import FixedCart from "../shared/FixedCart";


const CoursesPage = ({ courses, page }) => {
  const [savedCourses, setSavedCourses] = useState(courses?.courses);
  const memorizedCourses = useMemo(() => savedCourses, [savedCourses]);
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
      <FixedCart />
    </div>
  );
};

export default CoursesPage;