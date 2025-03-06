"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import StarRating from "../rating/StarRating";
import ProductImage from "./ProductImage";
import CourseCard from "../courses/CourseCard";
import SingleBlogCard from "../blogs/SingleBlogCard";
import { TakaSVG } from "../svg/SvgCollection";

// SVG Icons
const BookSVG = () => (
  <svg className="w-10 h-10 mr-3 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShopSVG = ({ color }) => (
  <svg className={`w-10 h-10 mr-3 ${color ? color : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18l-2 9H5L3 3zm0 0l2 9m0 0l2 6h10l2-6m-8 0h4" />
  </svg>
);

const CourseSVG = () => (
  <svg className="w-10 h-10 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
  </svg>
);

const TestSVG = () => (
  <svg className="w-10 h-10 mr-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const StarSVG = () => (
  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const QuoteSVG = () => (
  <svg className="w-6 h-6 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432 .917-4.995 2.638-4.995 5.458v10.391h-5.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433 .917-4.996 2.638-4.996 5.458v10.391h-5z" />
  </svg>
);

const BlogSVG = () => (
  <svg className="w-10 h-10 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l5 5v11a2 2 0 01-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 4v5h5" />
  </svg>
);

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Homepage = ({ topProducts, shopReviews, courseReviews, topCourses, recentBlogs }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-pink-50 dark:from-teal-800 dark:via-gray-900 dark:to-pink-900 text-gray-800 dark:text-gray-100">
      {/* Decorative SVG Background Element */}
      <svg className="absolute top-0 left-0 w-full h-32 text-teal-100 dark:text-teal-900" fill="currentColor" viewBox="0 0 1440 120">
        <path d="M1440 0H0v60c200 30 400 60 720 60s520-30 720-60V0z" />
      </svg>

      {/* Section 1: Book Appointment */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="py-20 flex items-center justify-center bg-gradient-to-r from-indigo-100 to-teal-100 dark:from-indigo-700 dark:to-teal-700 relative z-10"
      >
        <div className="text-center px-6 max-w-4xl">
          <div className="flex justify-center items-center mb-6">
            <BookSVG />
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-wide">Book Your Appointment</h1>
          </div>
          <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300 flex items-center justify-center">
            <QuoteSVG />
            Sessions to guide you toward clarity and spiritual well-being.
          </p>
          <Link href="/book-appointment">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(79, 70, 229, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center mx-auto"
            >
              <BookSVG className="w-6 h-6 mr-2" />
              Book Now
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Section 2: Self Diagnose Test */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
        className="py-20 flex items-center justify-center bg-gradient-to-r from-pink-100 to-teal-100 dark:from-pink-700 dark:to-teal-700 relative z-10"
      >
        <div className="text-center px-6 max-w-4xl">
          <div className="flex justify-center items-center mb-6">
            <TestSVG />
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-wide">Self Diagnose Test</h1>
          </div>
          <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300 flex items-center justify-center">
            <QuoteSVG />
            Take a quick test to assess your well-being.
          </p>
          <Link href="https://test.sukunlife.com" target="_blank">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(79, 70, 229, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center mx-auto"
            >
              <TestSVG className="w-6 h-6 mr-2" />
              Take the Test
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Section 3: Browse Courses */}
      {topCourses?.length > 0 && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
          className="py-20 px-6 bg-gradient-to-r from-teal-100 to-pink-100 dark:from-teal-700 dark:to-pink-700 relative z-10"
        >
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="flex justify-center items-center mb-6">
              <CourseSVG />
              <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-wide">Browse Our Courses</h1>
            </div>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 flex items-center justify-center">
              <QuoteSVG />
              Elevate your skills with expert-led courses.
            </p>
            <Link href="/courses">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(79, 70, 229, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center mx-auto"
              >
                <CourseSVG className="w-6 h-6 mr-2" />
                Explore Courses
              </motion.button>
            </Link>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl md:text-3xl font-semibold text-center mb-8 flex items-center justify-center">
              <CourseSVG className="w-6 h-6 mr-2" />
              Featured Courses
            </h3>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{ delay: 3500 }}
              pagination={{ clickable: true }}
              loop
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {topCourses.map((course) => (
                <SwiperSlide key={course._id}>
                  <CourseCard course={course} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {courseReviews?.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl md:text-3xl font-semibold text-center mb-8 flex items-center justify-center">
                <QuoteSVG className="w-6 h-6 mr-2" />
                Student Feedback
              </h3>
              <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                autoplay={{ delay: 4000 }}
                pagination={{ clickable: true }}
                loop
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
              >
                {courseReviews.map((review) => (
                  <SwiperSlide key={review._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-48 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="font-semibold">{review.reviews[0].name}</span>
                          <div className="flex ml-2">
                            {[...Array(review.reviews[0].rating)].map((_, i) => (
                              <StarSVG key={i} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{review.reviews[0].comment}</p>
                      </div>
                      {review.reviews[0].date && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(review.reviews[0].date).toLocaleDateString()}
                        </p>
                      )}
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </motion.div>
      )}

      {/* Section 4: Shop Section */}
      {topProducts?.length > 0 && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
          className="py-20 bg-gradient-to-r from-purple-100 to-teal-100 dark:from-purple-700 dark:to-teal-700 px-6 relative z-10"
        >
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="flex justify-center items-center mb-6">
              <ShopSVG />
              <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-wide">Explore Our Shop</h1>
            </div>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 flex items-center justify-center">
              <QuoteSVG />
              Discover unique products curated just for you.
            </p>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(79, 70, 229, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center mx-auto"
              >
                <ShopSVG color="text-white" className="w-6 h-6 mr-2" />
                Shop Now
              </motion.button>
            </Link>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl md:text-3xl font-semibold text-center mb-8 flex items-center justify-center">
              <ShopSVG className="w-6 h-6 mr-2" />
              Top Picks
            </h3>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{ delay: 3000 }}
              pagination={{ clickable: true }}
              loop
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {topProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-[550px] flex flex-col justify-between"
                  >
                    <div>
                      <ProductImage src={product.images[0]} alt={product.title} />
                      <h3 className="text-xl font-semibold mt-4 line-clamp-2">{product.title}</h3>
                      <p className="text-lg font-bold mt-2 flex items-center">
                        <TakaSVG />
                        {product.price}
                      </p>
                      <div className="mt-3">
                        <StarRating totalRating={product.ratingSum} ratingCount={product.reviewsCount} />
                      </div>
                    </div>
                    <Link href={`/shop/${product.productId}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg w-full flex items-center justify-center"
                      >
                        <ShopSVG color="text-white" className="w-5 h-5 mr-2" />
                        View Product
                      </motion.button>
                    </Link>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {shopReviews?.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl md:text-3xl font-semibold text-center mb-8 flex items-center justify-center">
                <QuoteSVG className="w-6 h-6 mr-2" />
                What Our Customers Say
              </h3>
              <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                autoplay={{ delay: 4000 }}
                pagination={{ clickable: true }}
                loop
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
              >
                {shopReviews.map((review) => (
                  <SwiperSlide key={review._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-48 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="font-semibold">{review.reviews[0].name}</span>
                          <div className="flex ml-2">
                            {[...Array(review.reviews[0].rating)].map((_, i) => (
                              <StarSVG key={i} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{review.reviews[0].comment}</p>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </motion.div>
      )}
 {/* Section 5: Recent Blogs */}
 {recentBlogs?.length > 0 && (
  <motion.div
    variants={sectionVariants}
    initial="hidden"
    animate="visible"
    viewport={{ once: true }}
    className="py-16 px-6 bg-gradient-to-r from-teal-100 to-orange-100 dark:from-teal-700 dark:to-orange-700 relative z-10"
  >
    <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 font-serif flex items-center justify-center">
      <BlogSVG />
      Latest Blogs
    </h2>
    <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={30}
      slidesPerView={1}
      autoplay={{ delay: 3500 }}
      pagination={{ clickable: true }}
      loop
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      {recentBlogs.map((blog) => (
        <SwiperSlide key={blog._id}>
          <SingleBlogCard b={blog} />
        </SwiperSlide>
      ))}
    </Swiper>
    {/* Read All Blogs Button */}
    <div className="flex justify-center mt-12">
      <motion.a
        href="/blog"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-orange-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-orange-600 transition-all duration-300 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        Read All Blogs
      </motion.a>
    </div>
  </motion.div>
)}
      {/* Decorative SVG Footer Element */}
      <svg className="absolute bottom-0 left-0 w-full h-32 text-pink-100 dark:text-pink-900" fill="currentColor" viewBox="0 0 1440 120">
        <path d="M1440 120H0V60C200 30 400 0 720 0s520 30 720 60v60z" />
      </svg>

      {/* Sticky Book Now Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-4 right-4 z-20"
      >
        <Link href="/book-appointment">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
          >
            <BookSVG  />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Homepage;