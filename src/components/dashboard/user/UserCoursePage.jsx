'use client'
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const UserCoursePage = ({ courses }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:p-6">
      {courses?.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses?.map((course) => (
            <motion.div
              key={course._id}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-xl shadow-lg group"
            >
              <Link href={`/courses/${course.courseId}`} className="block h-full">
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {course.coverPhotoUrl && (
                    <Image
                      src={course.coverPhotoUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                </div>

                <div className="p-4 bg-white dark:bg-gray-800">
                  <h3 className="text-xl font-bold">
                    {course.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}

        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={emptyStateVariants}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center min-h-[70vh] text-center"
        >
          <div className="max-w-md space-y-6 px-4">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                No Courses Enrolled
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                It looks like you haven't enrolled in any courses yet. Start your learning journey today!
              </p>
            </div>

            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-lg font-semibold">Browse All Courses</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserCoursePage;