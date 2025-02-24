'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import SearchBar from "@/components/search/SearchBar";
import CourseDetailsModal2 from '@/components/modals/CourseDetailModal2';

const UserManagementPageAdmin = ({ u }) => {
    console.log(u);
    const [users, setUsers] = useState(u);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

    const toggleUserStatus = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}/toggle-status`, {
                method: 'PUT',
            });
            if (response.ok) {
                const updatedUser = await response.json();
                setUsers(users.map(user => 
                    user._id === updatedUser._id ? updatedUser : user
                ));
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    const handleCourseClick = async (courseId) => {
        try {
            const response = await fetch(`/api/courses/${courseId}`);
            if (response.ok) {
                const courseDetails = await response.json();
                setSelectedCourse(courseDetails);
                setIsCourseModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
        }
    };

    return (
        <div className="p-4 dark:bg-gray-900 dark:text-white">
            <SearchBar />
            <div className="mt-4">
                {users.map(user => (
                    <motion.div 
                        key={user._id}
                        className="p-4 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold">{user.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{user.mobile}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => toggleUserStatus(user._id)}
                                    className={`px-4 py-2 rounded ${
                                        user.status === 'active' 
                                            ? 'bg-red-500 hover:bg-red-600' 
                                            : 'bg-green-500 hover:bg-green-600'
                                    } text-white`}
                                >
                                    {user.status === 'active' ? 'Block' : 'Unblock'}
                                </button>
                                {user.enrolledCourses && (
                                    <button
                                        onClick={() => handleCourseClick(user.enrolledCourses[0].courseId)}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                    >
                                        {user.enrolledCourses.length} Courses
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            <CourseDetailsModal2
                isOpen={isCourseModalOpen}
                onClose={() => setIsCourseModalOpen(false)}
                course={selectedCourse}
            />
            {/* <DeleteConfirmationModal onClose={() => {}} onConfirm={() => {}} headingText="Delete User" subHeading="Are you sure you want to delete this user?" /> */}
        </div>
    );
};

export default UserManagementPageAdmin;