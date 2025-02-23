"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import photo1 from "@/../public/images/photo1.jpg";
import photo2 from "@/../public/images/photo2.jpg";
import photo3 from "@/../public/images/photo3.jpg";

// Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import StarRating from "../rating/StarRating";
import ProductImage from "./ProductImage";

const Homepage = ({ topProducts }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative text-center z-10">
          <h1 className="text-5xl font-bold text-white mb-6">
            Book Your Appointment
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Schedule a session with our experts and take the first step towards
            your goals.
          </p>
          <Link href="/book-appointment">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-8 py-3 rounded-full font-semibold shadow-lg"
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
          className="relative py-16 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-8 dark:text-white">
              Top Products
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
                  <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                    {/* Use ProductImage component */}
                    <ProductImage
                      key={product._id}
                      src={product.images[0]}
                      alt={product.title}
                    />
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold mb-2 dark:text-white line-clamp-2 h-14 overflow-hidden">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        ${product.price}
                      </p>
                      <div className="mt-2">
                        <StarRating
                          totalRating={product.ratingSum}
                          ratingCount={product.reviewsCount}
                        />
                      </div>
                      <Link
                        href={`/shop/${product.productId}`}
                        className="mt-auto"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold w-full"
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
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative text-center z-10">
          <h1 className="text-5xl font-bold text-white mb-6">
            Explore Our Shop
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Discover unique products curated just for you.
          </p>
          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-8 py-3 rounded-full font-semibold shadow-lg"
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
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative text-center z-10">
          <h1 className="text-5xl font-bold text-white mb-6">
            Browse Our Courses
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Learn something new and elevate your skills with our expert-led
            courses.
          </p>
          <Link href="/courses">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-8 py-3 rounded-full font-semibold shadow-lg"
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