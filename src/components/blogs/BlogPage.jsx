"use client";

import { useEffect, useMemo, useState } from "react";
import LoadMoreButton from "../ui/btn/LoadMoreButton";
import SingleBlogCard from "./SingleBlogCard";
import getAllBlogTags from "@/utils/getAllBlogTags.mjs";
import Link from "next/link";

// SVG Decorative Element
const WaveSVG = () => (
  <svg className="absolute top-0 left-0 w-full h-32 text-orange-100 dark:text-orange-800" fill="currentColor" viewBox="0 0 1440 120">
    <path d="M1440 0H0v60c200 30 400 60 720 60s520-30 720-60V0z" />
  </svg>
);

const BlogPage = ({ b, page , selectedTag }) => {

  const [blogs, setBlogs] = useState(b.blogs);
  const memorizedBlogs = useMemo(() => blogs, [blogs]);
  const [tags, setTags] = useState(null);

  const predefinedTags = [
    "রুকইয়াহ",
  ];
  useEffect(() => {
    (async () => {
      const t = await getAllBlogTags();
      setTags(t?.tags || predefinedTags);
    })();
  }, []);

  useEffect(() => {
    setBlogs(b?.blogs);
  }, [b, selectedTag]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-orange-900 dark:via-gray-900 dark:to-teal-900 text-gray-800 dark:text-gray-100">
      {/* Decorative Wave Background */}
      <WaveSVG />

      {/* Main Content */}
      <div className="mt-12 space-y-10 relative z-10 px-6">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-wide text-orange-600 dark:text-orange-300 flex items-center justify-center">
            <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l5 5v11a2 2 0 01-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 4v5h5" />
            </svg>
            Our Blog
          </h1>
          <p className="text-lg md:text-xl mt-4 text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <svg className="w-6 h-6 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432 .917-4.995 2.638-4.995 5.458v10.391h-5.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433 .917-4.996 2.638-4.996 5.458v10.391h-5z" />
            </svg>
            Discover insights, tips, and stories from our latest posts.
          </p>
        </header>

        {/* Tags Section */}
        {tags && (
          <section className="max-w-4xl mx-auto mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10M7 11h7m-7 4h10" />
              </svg>
              Explore by Tags
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {tags.map((tag, index) => (
                <Link key={index} href={`/blog/tags/${encodeURIComponent(tag)}`} >
                <span
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                    ${
                      selectedTag === tag
                        ? "bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-md scale-105 hover:scale-110 hover:shadow-lg dark:from-orange-600 dark:to-orange-800"
                        : "bg-orange-100 text-orange-600 dark:bg-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-700"
                    }
                  `}
                >
                  {tag}
                </span>
              </Link>
              ))}
            </div>
          </section>
        )}

        {/* Blogs List */}
        <section className="space-y-10 max-w-4xl mx-auto">
          {memorizedBlogs?.map((blog) => (
            <div key={blog?._id} className="transform hover:scale-102 transition-transform duration-300">
              <SingleBlogCard b={blog} />
            </div>
          ))}
        </section>

        {/* Load More Button */}
        {memorizedBlogs?.length < b.totalCount && (
          <div className="flex justify-center mt-12">
            <LoadMoreButton page={page} />
          </div>
        )}
      </div>

      {/* Decorative Footer Wave */}
      <svg className="absolute bottom-0 left-0 w-full h-32 text-teal-100 dark:text-teal-800" fill="currentColor" viewBox="0 0 1440 120">
        <path d="M1440 120H0V60C200 30 400 0 720 0s520 30 720 60v60z" />
      </svg>
    </div>
  );
};

export default BlogPage;