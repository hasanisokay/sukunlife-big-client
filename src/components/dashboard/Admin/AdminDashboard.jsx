'use client'
import { motion } from 'framer-motion';
import Link from 'next/link';

const AdminDashboard = ({ dashboardData }) => {
  // Destructure the data from the dashboardData prop
  const {
    blogCount,
    userCount,
    adminCount,
    shopProductCount,
    pendingOrdersCount,
    upcomingAppointmentsCount,
    coursesCount,
  } = dashboardData.data;

  // Animation variants for Framer Motion
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Blog Count Card */}
        <Link href="/dashboard/blogs">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Blogs
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {blogCount}
            </p>
          </motion.div>
        </Link>

        {/* User Count Card */}
        <Link href="/dashboard/users">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Users
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {userCount}
            </p>
          </motion.div>
        </Link>

        {/* Admin Count Card */}
        <Link href="/dashboard/users?filter=admins_only">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Admins
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {adminCount}
            </p>
          </motion.div>
        </Link>

        {/* Shop Product Count Card */}
        <Link href="/dashboard/shop">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Shop Products
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {shopProductCount}
            </p>
          </motion.div>
        </Link>

        {/* Pending Orders Count Card */}
        <Link href="/dashboard/orders?filter=pending_only">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Pending Orders
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {pendingOrdersCount}
            </p>
          </motion.div>
        </Link>

        {/* Upcoming Appointments Count Card */}
        <Link href="/dashboard/appointments?filter=upcoming">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Upcoming Appointments
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {upcomingAppointmentsCount}
            </p>
          </motion.div>
        </Link>

        {/* Courses Count Card */}
        <Link href="/dashboard/courses">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Courses
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {coursesCount}
            </p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;