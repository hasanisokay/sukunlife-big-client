'use client'
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import CourseDetailModal from '@/components/modals/CourseDetailModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { SERVER } from '@/constants/urls.mjs';
import { Flip, toast, ToastContainer } from 'react-toastify';
import { DeleteSVG } from '@/components/svg/SvgCollection';

const ManageCourses = ({ courses }) => {
    const [previousCourses, setPreviousCourses] = useState(courses.courses);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCourseDetailModal, setShowCourseDetailModal] = useState(false);
    const memorizedCourses = useMemo(() => previousCourses, [previousCourses]);
    useEffect(() => {
        setPreviousCourses(courses.courses);
    }, [courses]);

    const openModal = (courseId, modalType) => {
        setSelectedCourseId(courseId);
        if (modalType === "delete") {
            setShowCourseDetailModal(false);
            setShowDeleteModal(true);
        }
        else if (modalType === "detail") {
            setShowDeleteModal(false);
            setShowCourseDetailModal(true);
        }
    };
    const closeModal = () => {
        setSelectedCourseId(null);
        setShowCourseDetailModal(false);
        setShowDeleteModal(false);
    }
    const handleCourseDelete = async () => {
        try {
            const res = await fetch(`${SERVER}/api/admin/course/${selectedCourseId}`, {
                credentials: 'include',
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (data?.status === 200) {
                toast.success(data?.message);
                setPreviousCourses((prev) => prev.filter((c) => c.courseId !== selectedCourseId));
                setSelectedCourseId(null);
            } else {
                toast.error(data?.message);
            }
        } catch (e) {
            console.error(e)
            toast.error("Error. Reload the page and try again")
        }

    }



    return (
        <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl text-center font-bold mb-6 text-gray-900">Manage Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memorizedCourses?.map((course) => (
                    <div key={course._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="relative">
                            {course.coverPhotoUrl && (
                                <img src={course.coverPhotoUrl} alt={course.title} className="w-full h-48 object-cover" />
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-semibold mb-2 text-gray-900">{course.title}</h3>
                            <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: course.description }}></div>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => openModal(course.courseId, 'detail')}
                                    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    View Course
                                </button>
                                <Link href={`/dashboard/courses/${course.courseId}`} className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Edit Course
                                </Link>
                                <button className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={() => openModal(course.courseId, 'delete')}
                                ><DeleteSVG  color={'#d7d2b7'}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {selectedCourseId && showDeleteModal && (
                <DeleteConfirmationModal
                    onClose={closeModal}
                    onConfirm={handleCourseDelete}
                    subHeading={`You are about to delete this course. Once deleted, cannot be recovered.`}
                    headingText={'Are you sure you want to delete?'}
                />
            )}
            {selectedCourseId && showCourseDetailModal && <CourseDetailModal
                courseId={selectedCourseId}
                onClose={closeModal} />}
            <ToastContainer transition={Flip} />
        </div>
    );
};

export default ManageCourses;