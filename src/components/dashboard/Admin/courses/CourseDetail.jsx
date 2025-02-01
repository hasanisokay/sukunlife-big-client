import React from 'react';

const CourseDetail = ({ courseDetails }) => {
    if (!courseDetails) {
        return <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Course Not Found</h2>
            <p className="text-gray-700">The course details are not available.</p>
        </div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{courseDetails.title}</h2>

            {/* Course Description */}
            <div className="mb-4">
                <div dangerouslySetInnerHTML={{ __html: courseDetails.description }}></div>
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
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm">Watch Video</a>
                                    </div>
                                )}

                                {item.type === 'textInstruction' && (
                                    <div className="bg-gray-100 p-2 mb-2 rounded-md">
                                        <h5 className="text-md font-medium mb-2">{item.title}</h5>
                                        <div dangerouslyInnerHTML={{ __html: item.content }}></div>
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
        </div>
    );
};

export default CourseDetail;