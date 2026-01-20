"use client";

import { useEffect, useMemo, useState } from "react";
import LoadMoreButton from "../ui/btn/LoadMoreButton";
import Link from "next/link";
import BlogCardForHomeSection from "../home/BlogCardForHomeSection";


const BlogTagPage = ({ b, page, selectedTag, tags }) => {
  const [blogs, setBlogs] = useState(b.blogs);
  const memorizedBlogs = useMemo(() => blogs, [blogs]);

  useEffect(() => {
    setBlogs(b?.blogs);
  }, [b, selectedTag]);

  return (
    <div className="min-h-screen mb-4">

      {/* Main Content */}
      <div className="mt-12 space-y-10 relative z-10 px-6">


        {/* Tags Section */}
        {tags && (
          <section className="max-w-4xl mx-auto mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-[#2e3e23] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10M7 11h7m-7 4h10" />
              </svg>
              Explore by Tags
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {tags?.map((tag, index) => (
                <Link key={index} href={`/blog/tags/${encodeURIComponent(tag)}`}>
                  <span
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                      ${
                        selectedTag === tag
                          ? "bg-green text-white shadow-md scale-105  hover:shadow-lg"
                          : "hover:bg-[#63953a] hover:text-white "
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
        <section className="flex flex-wrap items-center justify-center gap-6 max-w-[1110px] mx-auto">
          {memorizedBlogs?.map((blog) => (
            <div key={blog?._id} >
              <BlogCardForHomeSection blog={blog} key={blog?._id} />
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
    </div>
  );
};


export default BlogTagPage;