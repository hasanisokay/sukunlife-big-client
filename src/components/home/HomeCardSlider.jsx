'use client'
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import BlogCardForHomeSection from "./BlogCardForHomeSection";
import CourseCard from "../courses/CourseCard";
import ProductImage2 from "./ProductImage2";
import Link from "next/link";
import getTwoLinesOfDescription from "@/utils/getTwoLinesOfDescription.mjs";
import TestimonialCard from "./TestimonialCardHome";
import generateUniqueIds from "@/utils/generateUniqueIds.mjs";

const HomeCardSlider = ({ sliderWrapperClassProps = '', nonSliderWrapperClassProps = '', itemType = 'blog', items = [] }) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);
    // const randomImage = (arrayOfImage) => arrayOfImage[Math.floor(Math.random() * arrayOfImage?.length)]
    const randomImage = (arrayOfImage) => arrayOfImage[0]
    return (
        <div>
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
                    {itemType === 'blog' && items?.map((blog) => (
                        <SwiperSlide key={blog._id} className={`${sliderWrapperClassProps}`} >
                            <BlogCardForHomeSection blog={blog} key={blog._id} />
                        </SwiperSlide>
                    ))}
                    {itemType === 'course' && items?.map((course) => (
                        <SwiperSlide key={course._id} className={`${sliderWrapperClassProps}`} >
                            <CourseCard course={course} key={course._id} />
                        </SwiperSlide>
                    ))}
                    {itemType === 'testimonial' && items?.map((testimonial) => (
                        <SwiperSlide key={testimonial?._id || generateUniqueIds(1)} className={`${sliderWrapperClassProps}`} >
                            <TestimonialCard testimonial={testimonial} />
                        </SwiperSlide>
                    ))}
                    {itemType === 'product' && items?.map((product) => (
                        <SwiperSlide key={product._id} className={`${sliderWrapperClassProps}`} >
                            <div className="bg-[#F8F5F5]  rounded-t-[26px] rounded-b-3xl w-[350px] h-[497px] " key={product._id}>
                                <ProductImage2
                                    classProps={'rounded-3xl'}
                                    src={randomImage(product?.images)}
                                    alt={product?.title} width={'350px'} height={'213px'} />
                                <div className="pl-[29px] pr-[23px]">
                                    <h3 className="text-xl font-semibold line-clamp-2 mt-[44px]">{product?.title}</h3>
                                    <p className="mt-[10px] pb-[10px]  h-[95px] ">{getTwoLinesOfDescription(product?.description, 90)}</p>
                                    <Link href={`/shop/${product?.productId}`} >
                                        <button className="w-[266px] h-[40px] bg-orange text-black font-medium rounded-full">Place Order</button>
                                    </Link>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className={`${nonSliderWrapperClassProps}`}>
                    {itemType === 'blog' && items?.map((blog) => (
                        <BlogCardForHomeSection key={blog._id} blog={blog} />
                    ))}
                    {itemType === 'course' && items?.map((course) => (
                        <CourseCard course={course} key={course._id} />
                    ))}
                    {itemType === 'product' && items?.map((product) => (
                        <div className="bg-[#F8F5F5] rounded-t-[26px] rounded-b-3xl w-[350px] h-[497px] " key={product._id}>
                            <ProductImage2
                                key={product?._id}
                                classProps={'rounded-3xl'}
                                src={randomImage(product?.images)}
                                alt={product?.title} width={'350px'} height={'213px'} />
                            <div className="pl-[29px] pr-[23px]">
                                <h3 className="text-xl font-semibold line-clamp-2 mt-[44px]">{product?.title}</h3>
                                <p className="mt-[10px] pb-[10px]  h-[95px] ">{getTwoLinesOfDescription(product?.description, 90)}</p>
                                <Link href={`/shop/${product?.productId}`} >
                                    <button className="w-[266px] h-[59px] bg-orange text-black font-medium rounded-full">Place Order</button>
                                </Link>
                            </div>
                        </div>))}
                    {itemType === 'testimonial' && items?.map((testimonial) => (
                        <TestimonialCard key={testimonial?._id || generateUniqueIds(1)} testimonial={testimonial} />
                    ))}
                </div>
            )}
        </div>

    );
};

export default HomeCardSlider;