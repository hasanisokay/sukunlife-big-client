'use client'
import getCourse from '@/utils/getCourse.mjs';
import React, { useEffect, useState } from 'react';

import ReactPlayer from 'react-player/lazy'; 
import BlogContent from '../blogs/BlogContnet';

const CourseDetailModal = ({ courseId, onClose }) => {
    const [courseDetails, setCourseDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const course = await getCourse(courseId);
                if (course.status === 200) {
                    setCourseDetails(course?.course);
                } else {
                    setError("Could not get the course");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, [courseId]);

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                    <p className="text-red-500">Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!courseDetails) {
        return null;
    }

    const handlePlayVideo = (url) => {
        setCurrentVideoUrl(url);
    };

    const handleCloseVideo = () => {
        setCurrentVideoUrl(null);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90%] p-6 relative overflow-y-auto">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Close
                </button>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">{courseDetails.title}</h2>

                {/* Instructor */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Instructor</label>
                    <p className="text-gray-900">{courseDetails.instructor}</p>
                </div>

                {/* Date Added */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Date Added</label>
                    <p className="text-gray-900">{new Date(courseDetails.addedOn).toLocaleDateString()}</p>
                </div>

                {/* Course Description */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Course Description</label>
                    <BlogContent content={courseDetails?.description} />
                </div>

                {/* Cover Photo */}
                <div className="mb-4">
                    {courseDetails.coverPhotoUrl && (
                        <img src={courseDetails.coverPhotoUrl} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                    )}
                </div>

                {/* Modules */}
                <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Modules</h3>
                    {courseDetails.modules.map((module, moduleId) => (
                        <div key={moduleId} className="border border-gray-300 rounded-md p-4 mb-4 mt-4 bg-gray-50">
                            <h4 className="text-lg font-semibold mb-2">{module.title}</h4>
                            {/* Items (Videos, Quizzes, Text Instructions) */}
                            {module.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="mb-4">
                                    {item.type === 'video' && (
                                        <div className="bg-gray-100 p-2 mb-2 rounded-md">
                                            <h5 className="text-md font-medium mb-2">{item.title}</h5>
                                            <p className="text-sm mb-2">{item.description}</p>
                                            <button
                                                type="button"
                                                onClick={() => handlePlayVideo(item.url)}
                                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Watch Video
                                            </button>
                                        </div>
                                    )}
                                    {item.type === 'textInstruction' && (
                                        <div className="bg-gray-100 p-2 mb-2 rounded-md">
                                            <h5 className="text-md font-medium mb-2">{item.title}</h5>
                                            <BlogContent content={item?.content} />
                                        </div>
                                    )}
                                    {item.type === 'quiz' && (
                                        <div className="bg-gray-100 p-2 mb-2 rounded-md">
                                            <h5 className="text-md font-medium mb-2">{item.question}</h5>
                                            <ul className="list-disc pl-5">
                                                {item.options.map((option, optionIndex) => (
                                                    <li key={optionIndex} className="mb-1">
                                                        {item.answer === optionIndex ? (
                                                            <span className="font-bold text-green-500">• {option}</span>
                                                        ) : (
                                                            <span>• {option}</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Video Player */}
                {currentVideoUrl && (
                    <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-lg h-[300px] w-full max-w-3xl p-6 relative">
                            <button
                                type="button"
                                onClick={handleCloseVideo}
                                className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Close Video
                            </button>
                            <ReactPlayer
                                url={currentVideoUrl}
                                playing={true}
                                controls={true}
                                width="100%"
                                height="auto"
                                className="rounded-lg"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetailModal;