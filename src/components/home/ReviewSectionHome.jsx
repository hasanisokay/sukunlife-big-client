import React from 'react';

const ReviewSectionHome = () => {
    const StarSVG = () => (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );

    const CourseSVG = () => (
        <svg className="w-10 h-10 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
        </svg>
    );
    const QuoteSVG = () => (
        <svg className="w-6 h-6 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432 .917-4.995 2.638-4.995 5.458v10.391h-5.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433 .917-4.996 2.638-4.996 5.458v10.391h-5z" />
        </svg>
    );
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
    };
    return (
        <div>
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
                                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-64 flex flex-col justify-between border-l-4 border-teal-500 relative overflow-hidden"
                                >
                                    {/* Decorative Corner */}
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-teal-200 dark:bg-teal-700 opacity-30 rounded-bl-full" />
                                    <div className="relative z-10">
                                        <div className="flex items-center mb-3">
                                            <span className="font-semibold text-teal-600 dark:text-teal-300 capitalize">{review.reviews[0].name}</span>
                                            <div className="flex ml-2">
                                                {[...Array(review.reviews[0].rating)].map((_, i) => (
                                                    <StarSVG key={i} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm italic line-clamp-4">"{review.reviews[0].comment}"</p>
                                    </div>
                                    {review.reviews[0].date && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-2">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {formatDate(review.reviews[0].date)}
                                        </p>
                                    )}
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </div>
    );
};

export default ReviewSectionHome; 