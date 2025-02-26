"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import photo1 from "@/../public/images/photo1.jpg";
import photo2 from "@/../public/images/photo2.jpg";
import photo3 from "@/../public/images/photo3.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import StarRating from "../rating/StarRating";
import ProductImage from "./ProductImage";
import { TakaSVG } from "../svg/SvgCollection";

const Homepage = ({ topProducts }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Section 1: Book Appointment */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-screen flex items-center justify-center"
      >
        <Image
          src={photo1}
          alt="Book Appointment"
          fill
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/40"></div>
        <div className="relative text-center z-10 px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-serif tracking-tight">
            Book Your Appointment
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Our compassionate and expert-guided sessions are tailored to help you find clarity, healing, and balance. Take the first step towards renewal—book your appointment today and let us support you on your journey to spiritual well-being.

          </p>
          <Link href="/book-appointment">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(56, 126, 239, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#387eef] text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:bg-gradient-to-r hover:from-[#387eef] hover:to-[#2f68c9] transition-all"
            >
              Book Now
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Section 2: Top Products */}
      {topProducts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative py-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
        >
          <div className=" mx-auto px-4">
            <h2 className="text-4xl mt-10 md:text-5xl font-bold text-center mb-12 dark:text-white font-serif relative">
              <span className="before:absolute before:-top-6 before:left-1/2 before:-translate-x-1/2 before:content-['★'] before:text-[#387eef] before:text-3xl">
                Our Top Picks
              </span>
            </h2>
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{ delay: 3000 }}
              pagination={{ clickable: true }}
              navigation={false}
              loop
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="mySwiper"
            >
              {topProducts?.map((product) => (
                <SwiperSlide key={product._id}>
                  <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl overflow-hidden h-full flex flex-col transform transition-transform hover:scale-105">
                    <ProductImage
                      key={product._id}
                      src={product.images[0]}
                      alt={product.title}
                    />
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl md:text-2xl font-semibold mb-3 dark:text-white line-clamp-2 overflow-hidden">
                        {product.title}
                      </h3>
                      <p className="text-xl md:text-2xl font-bold mt-2 flex items-center">
                        <TakaSVG /> {product.price}
                      </p>
                      <div className="mt-3 mb-5">
                        <StarRating
                          totalRating={product.ratingSum}
                          ratingCount={product.reviewsCount}
                        />
                      </div>
                      <Link href={`/shop/${product.productId}`} className="py-2">
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: "#2f68c9" }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-[#387eef] text-white px-8 py-3 rounded-full font-semibold w-full shadow-md hover:bg-gradient-to-r hover:from-[#387eef] hover:to-[#2f68c9] transition-all"
                        >
                          View Product
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </motion.div>
      )}

      {/* Section 3: Explore Shop */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative h-screen flex items-center justify-center"
      >
        <Image
          src={photo2}
          alt="Explore Shop"
          fill
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/40"></div>
        <div className="relative text-center z-10 px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-serif tracking-tight">
            Explore Our Shop
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Discover unique products curated just for you.
          </p>
          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(34, 198, 95, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#22c65f] text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:bg-gradient-to-r hover:from-[#22c65f] hover:to-[#1ba34a] transition-all"
            >
              Shop Now
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Section 4: Browse Courses */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative h-screen flex items-center justify-center"
      >
        <Image
          src={photo3}
          alt="Browse Courses"
          fill
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/40"></div>
        <div className="relative text-center z-10 px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-serif tracking-tight">
            Browse Our Courses
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Elevate your skills with our expert-led courses.
          </p>
          <Link href="/courses">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(34, 198, 95, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#22c65f] text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:bg-gradient-to-r hover:from-[#22c65f] hover:to-[#1ba34a] transition-all"
            >
              Explore Courses
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Homepage;