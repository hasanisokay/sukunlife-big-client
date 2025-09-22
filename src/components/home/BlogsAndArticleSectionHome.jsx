"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import TransparentGreenButton from "./TransparentGreenButton";
import BlogCardForHomeSection from "./BlogCardForHomeSection";

const BlogsAndArticleSectionHome = ({ recentBlogs }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className="px-4 pt-[100px] md:pt-0">
            {recentBlogs?.length > 0 && (
                <div>
                    {/* Title + description */}
                    <div className="explore-self-ruqyah-now-wrapper">
                        <div className="md:w-[482px] flex flex-col items-start justify-start ">
                            <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight md:text-start text-center md:mx-0 mx-auto">
                                <span className="text-green">Blog & </span>
                                <span>Articles</span>
                            </h2>
                            <p className="mt-[28px] md:mx-0 mx-auto max-w-[90vw] ">
                                Stay informed with our blog posts on spiritual wellness, Islamic
                                healing, and personal development. Topics include
                            </p>
                        </div>
                        <div className="md:w-[482px] self-ruqyah-resources-right-side-div"></div>
                    </div>

                    {/* Blogs */}
                    <div className="md:pt-[70px] pt-[40px]">
                        {isMobile ? (
                            <Swiper
                                modules={[Autoplay, Pagination]}
                                spaceBetween={24}
                                breakpoints={{
                                    0: {
                                        slidesPerView: 1,
                                    },
                                    400: {
                                        slidesPerView: 1.1,
                                    },
                                    550: {
                                        slidesPerView: 1.5, 
                                    },
                                }}
                                className="w-full"
                                autoplay={{
                                    delay: 3000,
                                    disableOnInteraction: false,
                                }}
                                pagination={{ clickable: true }}
                                loop={true}
                            >
                                {recentBlogs.map((blog) => (
                                    <SwiperSlide key={blog._id} className="flex justify-center items-center" >
                                        <BlogCardForHomeSection blog={blog} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            <div className="flex flex-wrap gap-[27px] justify-center items-start">
                                {recentBlogs.map((blog) => (
                                    <BlogCardForHomeSection key={blog._id} blog={blog} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Button */}
                    <TransparentGreenButton
                        hrefLink={"/blog"}
                        text={"Read our latest articles!"}
                    />
                </div>
            )}
        </div>
    );
};

export default BlogsAndArticleSectionHome;
