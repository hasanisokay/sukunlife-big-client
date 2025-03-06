"use client";

import { useEffect, useMemo, useState } from "react";
import LoadMoreButton from "../ui/btn/LoadMoreButton";
import CourseCard from "./CourseCard";

// SVG Decorative Element
const WaveSVG = () => (
  <svg className="absolute top-0 left-0 w-full h-32 text-teal-100 dark:text-teal-800" fill="currentColor" viewBox="0 0 1440 120">
    <path d="M1440 0H0v60c200 30 400 60 720 60s520-30 720-60V0z" />
  </svg>
);

const CoursesPage = ({ courses, page }) => {
  const [savedCourses, setSavedCourses] = useState(courses?.courses);
  const memorizedCourses = useMemo(() => savedCourses, [savedCourses]);

  useEffect(() => {
    setSavedCourses(courses?.courses);
  }, [courses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-teal-900 dark:via-gray-900 dark:to-indigo-900 text-gray-800 dark:text-gray-100">
      {/* Decorative Wave Background */}
      <WaveSVG />

      {/* Main Content */}
      <div className="mt-12 space-y-8 relative z-10 px-6">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-wide text-teal-600 dark:text-teal-300 flex items-center justify-center">
            <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
            </svg>
            Our Courses
          </h1>
          <p className="text-lg md:text-xl mt-4 text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <svg className="w-6 h-6 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432 .917-4.995 2.638-4.995 5.458v10.391h-5.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433 .917-4.996 2.638-4.996 5.458v10.391h-5z" />
            </svg>
            Explore a wide range of courses designed to elevate your skills.
          </p>
        </header>

        {/* Courses Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 max-w-screen-2xl mx-auto">
          {memorizedCourses?.map((c) => (
            <div
              key={c._id}
              className="transform hover:scale-105 transition-transform duration-300"
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

      {/* Decorative Footer Wave */}
      <svg className="absolute bottom-0 left-0 w-full h-32 text-indigo-100 dark:text-indigo-800" fill="currentColor" viewBox="0 0 1440 120">
        <path d="M1440 120H0V60C200 30 400 0 720 0s520 30 720 60v60z" />
      </svg>
    </div>
  );
};

export default CoursesPage;