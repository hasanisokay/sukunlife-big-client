'use client'
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import RichTextEditor from '@/components/editor/RichTextEditor';
import uploadImage from '@/utils/uploadImage.mjs';
import generateUniqueIds from '@/utils/generateUniqueIds.mjs';
import { SERVER } from '@/constants/urls.mjs';
import { Flip, toast, ToastContainer } from 'react-toastify';
import DatePicker from '@/components/ui/datepicker/Datepicker';
import { AddSVG, ClipboardSVG, QuizSVG, VideoSVG } from '@/components/svg/SvgCollection';
import getDateObjWithoutTime from '@/utils/getDateObjWithoutTime.mjs';

const AddCourse = () => {
    const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm();
    const [checkingId, setCheckingId] = useState(false);
    const [idCheckMessage, setIdCheckMessage] = useState('');
    const [idAvailable, setIdAvailable] = useState(false);
    const [modules, setModules] = useState([]);
    const [coverPhotoUrl, setCoverPhotoUrl] = useState([]);
    const [learningItems, setLearningItems] = useState([{ text: '' }]);

    const onSubmit = async (data) => {
        if (!idAvailable) return toast.error("Course Id is not available.")

        const dateObj = data.addedOn;
        const date = getDateObjWithoutTime(dateObj);
        data.addedOn = date;
        data.reviews = [];
        data.studentIds = [];
        const res = await fetch(`${SERVER}/api/admin/add-new-course`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...data, modules, coverPhotoUrl, learningItems })
        });
        const d = await res.json();
        return console.log(d)
        if (d?.status === 200) {
            toast.success(d?.message);
            // return;
            reset();
            setModules([]);
            setCoverPhotoUrl('');
            setIdAvailable(false);
            setIdCheckMessage("");
            setCheckingId(false);
        } else {
            toast.error(d.message)
        }

    };


    const handleAddModule = () => {
        setModules([...modules, { title: '', items: [] }]);
    };

    const handleLearningInputChange = (e, index) => {
        const updatedItems = learningItems.map((item, idx) =>
            idx === index ? { ...item, text: e.target.value } : item
        );
        setLearningItems(updatedItems);
    };

    const checkIdAvailability = async (id) => {
        setCheckingId(true);
        try {
            const res = await fetch(`${SERVER}/api/admin/check-course-id?id=${id}`, {
                credentials: "include",
            });
            const data = await res.json();
            console.log(data)
            setIdCheckMessage(data?.isAvailable ? "Id is available!" : "Id is already taken.");
            setIdAvailable(data?.isAvailable);
        } catch (error) {
            setIdCheckMessage("Failed to check Id availability. Please try again.");
        } finally {
            setCheckingId(false);
        }
    };

    const handleRemoveModule = (moduleId) => {
        const updatedModules = modules.filter((_, index) => index !== moduleId);
        setModules(updatedModules);
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
                        { type: 'video', title: '', description: '', url: '', status: 'private' },
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

    const handleAddQuiz = (moduleId) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleId) {
                return {
                    ...module,
                    items: [
                        ...module.items,
                        { type: 'quiz', question: '', options: ['', '', '', ''], answer: 0, status: 'private' },
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
                        { type: 'textInstruction', title: '', content: '', status: 'private' },
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
                            return { ...item, content };
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
            const imageUrl = await uploadImage(file);
            setCoverPhotoUrl(imageUrl);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Add Course</h2>

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
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Course Id</label>
                <input
                    type="text"
                    id="courseId"
                    onBlur={(e) => checkIdAvailability(e.target.value)}
                    onChange={(e) => {
                        setValue('courseId', e.target.value);
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                />
                {checkingId ? (
                    <p className="text-blue-500 text-sm mt-1">Checking Id availability...</p>
                ) : (
                    <p className={`text-gray-500 text-sm mt-1 ${!idAvailable && 'text-red-500'}`}>{idCheckMessage}</p>
                )}
                {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId.message}</p>}
            </div>
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
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                    type="number"
                    id="price"
                    {...register('price', { required: 'Price is required' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
            <div className="mb-4">
                <Controller
                    name="addedOn"
                    control={control}
                    rules={{ required: 'Date is required' }}
                    render={({ field }) => (
                        <DatePicker
                            defaultDate={new Date()}
                            onChangeHanlder={field.onChange}
                        />
                    )}
                />
                {/* <DatePicker defaultDate={new Date()} onChangeHanlder={(d) => setValue('addedOn', d)} /> */}
                {errors.addedOn && <p className="text-red-500 text-sm mt-1">{errors.addedOn.message}</p>}
            </div>

            <div className="mb-4">
                <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">Seo Description</label>
                <input
                    type="text"
                    id="seoDescription"
                    {...register('seoDescription',)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                    placeholder='Seo description (optional)'
                />
            </div>
            <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                    type="text"
                    id="tags"
                    {...register('tags',)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                    placeholder="Enter SEO tags, separated by commas (optional)"
                />
            </div>

            {/* Course Description */}
            <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Course Description</label>
                <Controller
                    name="description"
                    control={control}
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                        <RichTextEditor
                            onContentChange={field.onChange}
                            key={`Description Rich Text Key course`}
                            uniqueKey={generateUniqueIds(1)}
                        />
                    )}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
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
                {coverPhotoUrl?.length > 1 && (
                    <img src={coverPhotoUrl} alt="Cover" className="mt-2 w-full h-48 object-cover rounded-lg" />
                )}
            </div>

            <div className='mb-4'>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">What you will learn</h3>
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
            {/* Modules */}
            <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Modules</h3>

                {modules?.map((module, moduleId) => (
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
                                            <select
                                                id={`visibility[${moduleId}].items[${itemIndex}].content`}
                                                name={`visibility[${moduleId}].items[${itemIndex}].content`}
                                                value={item.status}
                                                onChange={(e) => handleVideoStatusChange(moduleId, itemIndex, e.target.value)}
                                                className="mr-2 block w-[100px] px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="private">Private</option>
                                                <option value="public">Public</option>
                                            </select>
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
                                            <select
                                                id={`visibility[${moduleId}].items[${itemIndex}].content`}
                                                name={`visibility[${moduleId}].items[${itemIndex}].content`}
                                                value={item.status}
                                                onChange={(e) => handleTextInstructionStatusChange(moduleId, itemIndex, e.target.value)}
                                                className="mr-2 block w-[100px] px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="private">Private</option>
                                                <option value="public">Public</option>
                                            </select>
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
                                            defaultValue=""
                                            render={({ field }) => (
                                                <RichTextEditor
                                                    onContentChange={(content) => handleTextInstructionContentChange(moduleId, itemIndex, content)}
                                                    key={`Text Instruction key`}
                                                    uniqueKey={generateUniqueIds(1)}
                                                />
                                            )}
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
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex gap-2 items-center"
                            >
                                Add Video <VideoSVG />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddTextInstruction(moduleId)}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex gap-2 items-center"
                            >
                                Add Text Instruction <ClipboardSVG />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddQuiz(moduleId)}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex gap-2 items-center"
                            >
                                Add Quiz <QuizSVG />
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddModule}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex gap-2 items-center"
                >
                    Add Module <AddSVG color={'#111827'} />
                </button>
            </div>
            <div className='text-right mt-4'>
                <button
                    type="submit"
                    disabled={modules?.length < 1}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save Course
                </button>
            </div>
            {/* Submit Button */}
            <ToastContainer transition={Flip} />
        </form>
    );
};

export default AddCourse;