'use client';
import blogCover from "@/../public/images/blog.jpg";
import Image from "next/image";
import BlogContent from "./BlogContnet";
import { useEffect, useState } from "react";
import Link from "next/link";
import getSimilarBlogsByTag from "@/utils/getSimilarBlogsByTag.mjs";
import BlogCardForHomeSection from "../home/BlogCardForHomeSection";

const SingleBlogPage = ({ b }) => {

    const [imageError, setImageError] = useState(false);
    const [similarBlogs, setSimilarBlogs] = useState([])
    useEffect(() => {
        if (!b) return;

        const fetchSimilar = async () => {
            try {
                const sBlogs = await getSimilarBlogsByTag(1, 2, b.blogUrl, "", b.blogTags, "newest", 0);
                if (sBlogs?.status === 200) {
                    setSimilarBlogs(sBlogs.blogs);
                } else {
                    setSimilarBlogs([]);
                }
            } catch (err) {
                console.error("Failed to fetch similar blogs:", err);
                setSimilarBlogs([]);
            }
        };
        fetchSimilar();
    }, [b]);
    return (
        <div className="max-w-[1110px] mx-auto mt-10 p-6 bg-white dark:bg-gray-900 ">
            {/* Blog Cover Photo with Gradient Overlay */}

            {
                // !imageError &&            
                <div
                    className="relative w-full h-96 overflow-hidden rounded-t-xl"
                >
                    <Image
                        width={1200}
                        height={600}
                        className="w-full h-full object-cover"
                        quality={100}
                        src={imageError ? blogCover : b?.blogCoverPhoto ? b?.blogCoverPhoto : blogCover}
                        alt={b.title}
                        onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>}

            {/* Blog Info */}
            <div
                className="py-8"
            >
                <h1 className="md:text-4xl text-2xl  charisSIL-font font-bold text-gray-800 dark:text-gray-100 mb-4">
                    {b?.title}
                </h1>
                <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-2">
                    {b?.authorName ? "Published on:" : "Published On:"} {" "}
                    {new Date(b?.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                    <span className="ml-[15px]">
                        {b?.authorName && "Written by:"} {" "}
                    </span>
                    <span>
                        {b?.authorName}
                    </span>{" "}

                </p>
                {b?.blogTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 my-4">
                        {b.blogTags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-800 dark:text-blue-200 rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                            >
                                <Link href={`/blog/tags/${tag}`}> #{tag}</Link>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Blog Content */}
            <div
                className="prose dark:prose-invert max-w-none"
            >
                <BlogContent content={b?.content} />
            </div>

            {/* Updated Info */}
            {b?.updatedOn && (
                <div
                    className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-right"
                >
                    Last updated:{" "}
                    {new Date(b?.updatedOn).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            )}
            <hr className="bg-black h-[2px] mt-[158px] mb-[40px]" />
            <div className="md:h-[649px] h-[1206px]">
                {
                    similarBlogs?.length > 0 && <div>
                        <h3 className="montserrat-font md:text-[32px] text-[24px] font-bold">
                            Also Read
                        </h3>
                        <p>
                            Ruqaya is a gift of mercy from Allah, a shield against both physical and spiritual harm. Practiced correctly, it is a powerful reminder of Allah’s nearness and a source of true sukun (peace) for the heart.
                            <br /> Turn to Allah. Trust His Words. Heal with faith.
                        </p>
                        <div className="flex mt-[50px] flex-wrap items-center md:justify-start justify-center gap-6">
                            {similarBlogs?.map((post) => (
                                <div key={post?._id}>
                                    <BlogCardForHomeSection blog={post} />
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>

        </div>
    );
};

export default SingleBlogPage;