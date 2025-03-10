'use client';

import { useEffect, useMemo, useState } from 'react';
import SearchBar from '@/components/search/SearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Flip, toast, ToastContainer } from 'react-toastify';
import { SERVER } from '@/constants/urls.mjs';
import toggleUserStatus from '@/server-functions/toggleUserStatus.mjs';
import toggleUserRole from '@/server-functions/toggleUserRole.mjs';

const UserManagementPageAdmin = ({ u }) => {
  const [users, setUsers] = useState(u);
  const memorizedUsers = useMemo(() => users, [users])
  const [selectedUserCourses, setSelectedUserCourses] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setUsers(u)
  }, [u])
  // Mock API call to toggle user status
  const toggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      const resData = await toggleUserStatus(userId, newStatus);
      if (resData?.status === 200) {
        toast.success(resData.message)
        return newStatus;
      } else {
        toast.error(resData.message)
      }
      return null
    } catch (error) {
      toast.error('Failed to update user status');
      throw error;
    }
  };

  // Mock API call to toggle user role
  const toggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'user' ? 'admin' : 'user';
      const resData = await toggleUserRole(userId, newRole);
      if (resData.status === 200) {
        toast.success(resData.message)
        return newRole;
      } else {
        toast.error(resData.message)
      }
      return null
    } catch (error) {
      toast.error('Failed to update user role');
      throw error;
    }
  };

  // Handle status change with instant UI update
  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

    try {
      const updateResult = await toggleStatus(userId, currentStatus);
      if (updateResult) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user
          )
        );
      }
    } catch {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: currentStatus } : user
        )
      );
    }
  };

  // Handle role change with instant UI update
  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'user' ? 'admin' : 'user';
    try {
      const updateResult = await toggleRole(userId, currentRole);
      if (updateResult) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
      }
    } catch {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: currentRole } : user
        )
      );
    }
  };

  // Open modal with enrolled courses
  const openCoursesModal = (courses) => {
    setSelectedUserCourses(courses || []);
    setIsModalOpen(true);
  };


  return (
    <div className="min-h-screen bg-gray-100 w-full dark:bg-gray-900">
      <div>
        <SearchBar />

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 overflow-x-auto  shadow-lg rounded-lg"
        >
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {memorizedUsers?.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {user.mobile}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openCoursesModal(user.enrolledCourses)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {user.enrolledCourses?.length || 0}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(user._id, user.status)}
                        className={`px-3 py-1 rounded-md text-white font-medium ${user.status === 'active'
                          ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                          : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                          }`}
                      >
                        {user.status === 'active' ? 'Block' : 'Unblock'}
                      </button>
                      <button
                        onClick={() => handleRoleChange(user._id, user.role)}
                        className={`px-3 py-1 rounded-md text-white font-medium ${user.role === 'user'
                          ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                          : 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800'
                          }`}
                      >
                        {user.role === 'user' ? 'Make Admin' : 'Make User'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>

        {/* Courses Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Enrolled Courses
                </h2>
                <div className="mt-4 max-h-60 overflow-y-auto">
                  {selectedUserCourses.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedUserCourses.map((course) => (
                        <li
                          key={course.courseId}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          {course.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No courses enrolled.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-4 w-full bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white py-2 rounded-md"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ToastContainer transition={Flip} />
    </div>
  );
};

export default UserManagementPageAdmin;