'use client'
// components/EditCourse.js
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import RichTextEditor from '@/components/editor/RichTextEditor';
import generateUniqueIds from '@/utils/generateUniqueIds.mjs';
import DatePicker from '@/components/ui/datepicker/Datepicker';
import { Flip, toast, ToastContainer } from 'react-toastify';
import getDateObjWithoutTime from '@/utils/getDateObjWithoutTime.mjs';
import checkCourseId from '@/server-functions/checkCourseId.mjs';
import editCourse from '@/server-functions/editCourse.mjs';
import uploadFile from '@/utils/uploadFile.mjs';


const EditCourse = ({ course }) => {
    const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm();
    const [modules, setModules] = useState([]);
    const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
    const [instructorImage, setInstructorImage] = useState('');
    const [checkingId, setCheckingId] = useState(false);
    const [idAvailable, setIdAvailable] = useState(true);
    const [idCheckMessage, setIdCheckMessage] = useState('');
    const [learningItems, setLearningItems] = useState([{ text: '' }]);
    const [additionalMaterials, setAdditionalMaterials] = useState([{ text: '' }]);
    const [courseIncludes, setCourseIncludes] = useState([{ text: '' }]);
    useEffect(() => {
        if (course) {
            reset(course);
            setModules(course.modules || []);
            setLearningItems(course?.learningItems)
            setCourseIncludes(course?.courseIncludes || [{ text: '' }])
            setAdditionalMaterials(course?.additionalMaterials || [{ text: '' }])
            setCoverPhotoUrl(course?.coverPhotoUrl || '');
            setInstructorImage(course?.instructorImage)
            setValue('courseId', course.courseId || '');
            setValue('price', course.price || '');
            setValue('description', course.description || '');
            setValue('aboutInstructor', course.aboutInstructor || '');
            setValue('addedOn', course.addedOn ? new Date(course?.addedOn) : new Date());
            setValue('tags', course.tags || '');
            setValue('seoDescription', course.seoDescription || '');
            setValue('instructor', course.instructor || '');
            setValue('duration', course.duration || '');
            setValue('instructorDesignation', course.instructorDesignation || '');
            setValue('shortDescription', course.shortDescription || '');
        }
    }, [course, reset, setValue]);

    const onSubmit = async (data) => {
        if (!idAvailable && data.courseId !== course.courseId) return toast.error("Id is not available");
        const dateObj = data.addedOn;
        const now = new Date();
        const date = getDateObjWithoutTime(dateObj);
        data.addedOn = date;
        data.updatedOn = getDateObjWithoutTime(now);
        const d = await editCourse(data, modules, coverPhotoUrl, learningItems, course._id, instructorImage, additionalMaterials, courseIncludes);
        if (d?.status === 200) {
            toast.success(d.message);
            window.location.href = "/dashboard/courses"
        }
    };

    const handleAddModule = () => {
        setModules([...modules, { title: '', items: [] }]);
    };

    const handleRemoveModule = (moduleId) => {
        const updatedModules = modules.filter((_, index) => index !== moduleId);
        setModules(updatedModules);
    };

    const handleLearningInputChange = (e, index) => {
        const updatedItems = learningItems.map((item, idx) =>
            idx === index ? { ...item, text: e.target.value } : item
        );
        setLearningItems(updatedItems);
    };
    const handleAdditionalMaterialsInputChange = (e, index) => {
        const updatedItems = additionalMaterials?.map((item, idx) =>
            idx === index ? { ...item, text: e.target.value } : item
        );
        setAdditionalMaterials(updatedItems);
    };
    const handleCourseIncludesInputChange = (e, index) => {
        const updatedItems = courseIncludes?.map((item, idx) =>
            idx === index ? { ...item, text: e.target.value } : item
        );
        setCourseIncludes(updatedItems);
    };
    const handleModuleTitleChange = (moduleId, title) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return { ...module, title };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleAddVideo = (moduleId) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: [
                        ...module.items,
                        { type: 'video', title: '', description: '', url: '' },
                    ],
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleRemoveVideo = (moduleId, itemIndex) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.filter((_, idx) => idx !== itemIndex),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleVideoTitleChange = (moduleId, itemIndex, title) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.map((item, idx) => {
                        if (idx === itemIndex && item.type === 'video') {
                            return { ...item, title };
                        }
                        return item;
                    }),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleVideoDescriptionChange = (moduleId, itemIndex, description) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.map((item, idx) => {
                        if (idx === itemIndex && item.type === 'video') {
                            return { ...item, description };
                        }
                        return item;
                    }),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleVideoUrlChange = (moduleId, itemIndex, url) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.map((item, idx) => {
                        if (idx === itemIndex && item.type === 'video') {
                            return { ...item, url };
                        }
                        return item;
                    }),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };
    const handleVideoStatusChange = (moduleId, itemIndex, status) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.map((item, idx) => {
                        if (idx === itemIndex && item.type === 'video') {
                            return { ...item, status };
                        }
                        return item;
                    }),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };
    const handleAddQuiz = (moduleId) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: [
                        ...module.items,
                        { type: 'quiz', question: '', options: ['', '', '', ''], answer: 0 },
                    ],
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleRemoveQuiz = (moduleId, itemIndex) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.filter((_, idx) => idx !== itemIndex),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleQuizQuestionChange = (moduleId, itemIndex, question) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.map((item, idx) => {
                        if (idx === itemIndex && item.type === 'quiz') {
                            return { ...item, question };
                        }
                        return item;
                    }),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleQuizOptionChange = (moduleId, itemIndex, optionIndex, option) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.map((item, idx) => {
                        if (idx === itemIndex && item.type === 'quiz') {
                            const newOptions = [...item.options];
                            newOptions[optionIndex] = option;
                            return { ...item, options: newOptions };
                        }
                        return item;
                    }),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleQuizAnswerChange = (moduleId, itemIndex, answer) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.map((item, idx) => {
                        if (idx === itemIndex && item.type === 'quiz') {
                            return { ...item, answer };
                        }
                        return item;
                    }),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleAddTextInstruction = (moduleId) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: [
                        ...module.items,
                        { type: 'textInstruction', title: '', content: '' },
                    ],
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleRemoveTextInstruction = (moduleId, itemIndex) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.filter((_, idx) => idx !== itemIndex),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleTextInstructionTitleChange = (moduleId, itemIndex, title) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.map((item, idx) => {
                        if (idx === itemIndex && item.type === 'textInstruction') {
                            return { ...item, title };
                        }
                        return item;
                    }),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };
    const handleTextInstructionStatusChange = (moduleId, itemIndex, status) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.map((item, idx) => {
                        if (idx === itemIndex && item.type === 'textInstruction') {
                            return { ...item, status };
                        }
                        return item;
                    }),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };
    const handleTextInstructionContentChange = (moduleId, itemIndex, content) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: module.items.map((item, idx) => {
                        if (idx === itemIndex && item.type === 'textInstruction') {
                            return { ...item, content: content };
                        }
                        return item;
                    }),
                };
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleUploadImage = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = await uploadFile(file);
            setCoverPhotoUrl(imageUrl);
        }
    };

    const handleUploadInstructorImage = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = await uploadFile(file);
            setInstructorImage(imageUrl);
        }
    };
    const checkIdAvailability = async (id) => {
        setCheckingId(true);
        try {
            if (id?.includes("/")) {
                setIdCheckMessage("ID cannot contain slashes.");
                setIdAvailable(false);
                return;
            }
            const data = await checkCourseId(id);
            setIdCheckMessage(data?.isAvailable ? "Id is available!" : "Id is already taken.");
            setIdAvailable(data?.isAvailable);
        } catch (error) {
            setIdCheckMessage("Failed to check Id availability. Please try again.");
        } finally {
            setCheckingId(false);
        }
    };



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit Course</h2>

            {/* Course Title */}
            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Course Title</label>
                <input
                    type="text"
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">Short Description</label>
                <input
                    type="text"
                    id="shortDescription"
                    {...register('shortDescription', { required: 'Short Description is required' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                />
                {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (ex: 4 weeks)</label>
                <input
                    type="text"
                    id="duration"
                    {...register('duration', { required: 'Duration is required' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>}
            </div>
            {/* Course Description */}
            <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Course Description</label>
                <Controller
                    name="description"
                    id='description'
                    control={control}
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => {
                        if (field.value === undefined) return;
                        return <RichTextEditor
                            onContentChange={field.onChange}
                            key={`Description Rich Text Key course`}
                            uniqueKey={generateUniqueIds(1)}
                            initialContent={field.value}
                        />
                    }}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            {/* SEO Description */}
            <div className="mb-4">
                <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">SEO Description</label>
                <input
                    type="text"
                    id="seoDescription"
                    {...register('seoDescription')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                    placeholder="SEO description (optional)"
                />
            </div>

            {/* SEO Tags */}
            <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                    type="text"
                    id="tags"
                    {...register('tags')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                    placeholder="Enter SEO tags, separated by commas (optional)"
                />
            </div>

            {/* Date Picker */}
            <div className="mb-4">
                <Controller
                    name="addedOn"
                    control={control}
                    rules={{ required: 'Date is required' }}
                    render={({ field }) => {
                        if (field.value === undefined) return;
                        return <DatePicker
                            defaultDate={field.value}
                            onChangeHanlder={field.onChange}
                        />
                    }}
                />
                {errors.addedOn && <p className="text-red-500 text-sm mt-1">{errors.addedOn.message}</p>}
            </div>

            {/* Instructor */}
            <div className="mb-4">
                <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">Instructor</label>
                <input
                    type="text"
                    id="instructor"
                    {...register('instructor', { required: 'Instructor is required' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                />
                {errors.instructor && <p className="text-red-500 text-sm mt-1">{errors.instructor.message}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="instructorImage" className="block text-sm font-medium text-gray-700">Instructor Image</label>
                <input
                    type="file"
                    id="instructorImage"
                    accept="image/*"
                    onChange={handleUploadInstructorImage}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                />
                {instructorImage?.length > 1 && (
                    <img src={instructorImage} alt="Instructor" className="mt-2 w- h-48 object-cover rounded-lg" />
                )}
            </div>
            <div className="mb-4">
                <label htmlFor="instructorDesignation" className="block text-sm font-medium text-gray-700">Instructor Designations</label>
                <input
                    type="text"
                    id="instructorDesignation"
                    {...register('instructorDesignation',)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                    placeholder="Separated by commas (ex:Teacher, Dawi)"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="aboutInstructor" className="block text-sm font-medium text-gray-700">About Instructor</label>
                <Controller
                    name="aboutInstructor"
                    control={control}
                    render={({ field }) => {
                        if (field.value === undefined) return;
                        return <RichTextEditor
                            value={field.value}
                            onContentChange={field.onChange}
                            key={`Editing About Instructor Rich Text Key course`}
                            uniqueKey={generateUniqueIds(1)}
                            initialContent={field.value}
                        />
                    }
                    }
                />
                {errors.aboutInstructor && <p className="text-red-500 text-sm mt-1">{errors.aboutInstructor.message}</p>}
            </div>

            <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                    type="number"
                    id="price"
                    {...register('price', { required: 'Price is required' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
            <div className='mb-4'>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Course Includes</h3>
                {courseIncludes?.map((item, index) => (
                    <div key={index} className="mb-4 flex items-center space-x-2">
                        <input
                            type="text"
                            value={item.text}
                            onChange={(e) => handleCourseIncludesInputChange(e, index)}
                            placeholder={`Enter text ${index + 1}`}
                            className="p-2 border rounded-md w-full"
                        />
                        <button
                            onClick={() => setCourseIncludes(courseIncludes?.filter((_, idx) => idx !== index))}
                            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    type='button'
                    onClick={() => setCourseIncludes([...courseIncludes, { text: '' }])}
                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700"
                >
                    Add Another
                </button>
            </div>
            <div className='mb-4'>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Additional Materials</h3>
                {additionalMaterials?.map((item, index) => (
                    <div key={index} className="mb-4 flex items-center space-x-2">
                        <input
                            type="text"
                            value={item.text}
                            onChange={(e) => handleAdditionalMaterialsInputChange(e, index)}
                            placeholder={`Enter text ${index + 1}`}
                            className="p-2 border rounded-md w-full"
                        />
                        <button
                            onClick={() => setAdditionalMaterials(additionalMaterials?.filter((_, idx) => idx !== index))}
                            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    type='button'
                    onClick={() => setAdditionalMaterials([...additionalMaterials, { text: '' }])}
                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700"
                >
                    Add Another
                </button>
            </div>
            <div className='mb-4'>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Who This Course is For</h3>
                {learningItems?.map((item, index) => (
                    <div key={index} className="mb-4 flex items-center space-x-2">
                        <input
                            type="text"
                            value={item.text}
                            onChange={(e) => handleLearningInputChange(e, index)}
                            placeholder={`Enter text ${index + 1}`}
                            className="p-2 border rounded-md w-full"
                        />
                        <button
                            onClick={() => setLearningItems(learningItems.filter((_, idx) => idx !== index))}
                            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    type='button'
                    onClick={() => setLearningItems([...learningItems, { text: '' }])}
                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700"
                >
                    Add Another
                </button>
            </div>
            {/* Course ID */}
            <div className="mb-4">
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Course ID</label>
                <input
                    type="text"
                    id="courseId"
                    {...register('courseId')}
                    onBlur={(e) => checkIdAvailability(e.target.value)}
                    onChange={(e) => {
                        setValue('courseId', e.target.value);
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                />
                {checkingId ? (
                    <p className="text-blue-500 text-sm mt-1">Checking ID availability...</p>
                ) : (
                    <p className={`text-gray-500 text-sm mt-1 ${!idAvailable && 'text-red-500'}`}>{idCheckMessage}</p>
                )}
                {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId.message}</p>}
            </div>

            {/* Cover Photo */}
            <div className="mb-4">
                <label htmlFor="coverPhoto" className="block text-sm font-medium text-gray-700">Cover Photo</label>
                <input
                    type="file"
                    id="coverPhoto"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                />
                {coverPhotoUrl && (
                    <img src={coverPhotoUrl} alt="Cover" className="mt-2 w-full h-48 object-cover rounded-lg" />
                )}
            </div>

            {/* Modules */}
            <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Modules</h3>
                <button
                    type="button"
                    onClick={handleAddModule}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add Module
                </button>
                {modules.map((module, moduleId) => (
                    <div key={moduleId} className="border border-gray-300 rounded-md p-4 mb-4 mt-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <input
                                type="text"
                                value={module.title}
                                onChange={(e) => handleModuleTitleChange(moduleId, e.target.value)}
                                placeholder="Module Title"
                                className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveModule(moduleId)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Remove Module
                            </button>
                        </div>

                        {/* Items (Videos, Quizzes, Text Instructions) */}
                        {module.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="mb-4">
                                {item.type === 'video' && (
                                    <div className="bg-gray-100 p-2 mb-2 rounded-md">
                                        <div className="flex justify-between items-center mb-2">
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => handleVideoTitleChange(moduleId, itemIndex, e.target.value)}
                                                placeholder="Video Title"
                                                className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVideo(moduleId, itemIndex)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Remove Video
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleVideoDescriptionChange(moduleId, itemIndex, e.target.value)}
                                            placeholder="Video Description"
                                            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                                        />
                                        <input
                                            type="text"
                                            value={item.url}
                                            onChange={(e) => handleVideoUrlChange(moduleId, itemIndex, e.target.value)}
                                            placeholder="Video URL"
                                            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                                        />
                                    </div>
                                )}

                                {item.type === 'textInstruction' && (
                                    <div className="bg-gray-100 p-2 mb-2 rounded-md">
                                        <div className="flex justify-between items-center mb-2">
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => handleTextInstructionTitleChange(moduleId, itemIndex, e.target.value)}
                                                placeholder="Text Instruction Title"
                                                className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTextInstruction(moduleId, itemIndex)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Remove Text Instruction
                                            </button>
                                        </div>
                                        <Controller
                                            name={`modules[${moduleId}].items[${itemIndex}].content`}
                                            control={control}
                                            render={({ field }) => (<RichTextEditor
                                                onContentChange={(content) => handleTextInstructionContentChange(moduleId, itemIndex, content)}
                                                initialContent={field?.value}
                                                key={`Text Instruction key`}
                                                uniqueKey={generateUniqueIds(1)}
                                            />)
                                            }
                                        />
                                    </div>
                                )}

                                {item.type === 'quiz' && (
                                    <div className="bg-gray-100 p-2 mb-2 rounded-md">
                                        <div className="flex justify-between items-center mb-2">
                                            <input
                                                type="text"
                                                value={item.question}
                                                onChange={(e) => handleQuizQuestionChange(moduleId, itemIndex, e.target.value)}
                                                placeholder="Quiz Question"
                                                className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuiz(moduleId, itemIndex)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Remove Quiz
                                            </button>
                                        </div>
                                        {item.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="mb-2 flex items-center">
                                                <input
                                                    type="radio"
                                                    checked={item.answer === optionIndex}
                                                    onChange={() => handleQuizAnswerChange(moduleId, itemIndex, optionIndex)}
                                                    className="mr-2"
                                                />
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => handleQuizOptionChange(moduleId, itemIndex, optionIndex, e.target.value)}
                                                    placeholder={`Option ${optionIndex + 1}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add Item Buttons */}
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => handleAddVideo(moduleId)}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add Video
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddTextInstruction(moduleId)}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add Text Instruction
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddQuiz(moduleId)}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add Quiz
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Save Course
            </button>
            <ToastContainer transition={Flip} />
        </form>
    );
};

export default EditCourse;