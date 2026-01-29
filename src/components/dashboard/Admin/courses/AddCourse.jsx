'use client'
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { v4 as uuidv4 } from 'uuid';
import { Flip, toast, ToastContainer } from 'react-toastify';
import DatePicker from '@/components/ui/datepicker/Datepicker';
import { AddSVG, ClipboardSVG, QuizSVG, VideoSVG, FileSVG, ClockSVG, TrashSVG } from '@/components/svg/SvgCollection';
import getDateObjWithoutTime from '@/utils/getDateObjWithoutTime.mjs';
import addNewCourse from '@/server-functions/addNewCourse.mjs';
import checkCourseId from '@/server-functions/checkCourseId.mjs';
import formatUrlAdIds from '@/utils/formatUrlAdIds.mjs';
import uploadFile from '@/utils/uploadFile.mjs';
import CourseUploadBox from '@/components/shared/CourseUploadBox';

const AddCourse = () => {
    const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm();
    const [checkingId, setCheckingId] = useState(false);
    const [idCheckMessage, setIdCheckMessage] = useState('');
    const [idAvailable, setIdAvailable] = useState(false);
    const [modules, setModules] = useState([]);
    const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
    const [instructorImage, setInstructorImage] = useState('');
    const [learningItems, setLearningItems] = useState([{ text: '' }]);
    const [additionalMaterials, setAdditionalMaterials] = useState([{ text: '' }]);
    const [courseIncludes, setCourseIncludes] = useState([{ text: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Watch courseId for auto-save
    const courseId = watch('courseId');

    // Generate unique IDs
    const generateModuleId = () => `module_${uuidv4().split('-')[0]}`;
    const generateItemId = () => `item_${uuidv4().split('-')[0]}`;

    // Calculate durations with debounce
    const calculateModuleDuration = (items) => {
        let totalMinutes = 0;

        items.forEach(item => {
            if (item.type === 'video' && item.duration) {
                totalMinutes += parseInt(item.duration) || 0;
            } else if (item.type === 'textInstruction' && item.content) {
                const wordCount = item.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
                totalMinutes += Math.max(1, Math.ceil(wordCount / 200)); // Min 1 minute
            } else if (item.type === 'quiz') {
                totalMinutes += 5; // Estimate 5 minutes per quiz
            } else if (item.type === 'file' && item.duration) {
                totalMinutes += parseInt(item.duration) || 0;
            }
        });

        if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
        } else {
            return `${totalMinutes}m`;
        }
    };

    const calculateTotalDuration = () => {
        let totalMinutes = 0;

        modules.forEach(module => {
            if (module.items && module.items.length > 0) {
                totalMinutes += module.items.reduce((sum, item) => {
                    if (item.type === 'video' && item.duration) {
                        return sum + (parseInt(item.duration) || 0);
                    } else if (item.type === 'textInstruction' && item.content) {
                        const wordCount = item.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
                        return sum + Math.max(1, Math.ceil(wordCount / 200));
                    } else if (item.type === 'quiz') {
                        return sum + 5;
                    } else if (item.type === 'file' && item.duration) {
                        return sum + (parseInt(item.duration) || 0);
                    }
                    return sum;
                }, 0);
            }
        });

        if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
        } else {
            return `${totalMinutes}m`;
        }
    };

    // Form submission
    const onSubmit = async (data) => {
        if (!idAvailable) {
            toast.error("Course ID is not available.");
            return;
        }

        if (modules.length === 0) {
            toast.error("Please add at least one module.");
            return;
        }

        setIsSubmitting(true);
        setFormSubmitted(true); // Mark form as submitted

        try {
            const totalDuration = calculateTotalDuration();
            const dateObj = data.addedOn || new Date();
            const date = getDateObjWithoutTime(dateObj);

            const courseData = {
                ...data,
                addedOn: date,
                reviews: [],
                studentIds: [],
                totalDuration,
                modules: modules.map((module, index) => ({
                    ...module,
                    order: index + 1,
                    items: module.items.map((item, itemIndex) => ({
                        ...item,
                        order: itemIndex + 1
                    }))
                })),
                coverPhotoUrl,
                learningItems: learningItems.filter(item => item.text.trim()),
                instructorImage,
                additionalMaterials: additionalMaterials.filter(item => item.text.trim()),
                courseIncludes: courseIncludes.filter(item => item.text.trim()),
                updatedOn: new Date()
            };

            const result = await addNewCourse(courseData);

            if (result?.status === 200) {
                toast.success(result?.message || "Course created successfully!");
                localStorage.removeItem('add_course_draft');
                resetForm();
                // Remove beforeunload listener after successful submission
                window.removeEventListener("beforeunload", handleBeforeUnload);
                // Reload page after a short delay
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(result?.message || "Failed to create course.");
                setFormSubmitted(false); // Reset if failed
            }
        } catch (error) {
            console.error("Error creating course:", error);
            toast.error("An error occurred while creating the course.");
            setFormSubmitted(false); // Reset if error
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form
    const resetForm = () => {
        reset();
        setModules([]);
        setCoverPhotoUrl('');
        setInstructorImage('');
        setLearningItems([{ text: '' }]);
        setAdditionalMaterials([{ text: '' }]);
        setCourseIncludes([{ text: '' }]);
        setIdAvailable(false);
        setIdCheckMessage('');
    };

    // Check ID availability
    const checkIdAvailability = async (id) => {
        if (!id || id.trim() === '') {
            setIdCheckMessage('');
            setIdAvailable(false);
            return;
        }

        if (id.includes("/")) {
            setIdCheckMessage("ID cannot contain slashes.");
            setIdAvailable(false);
            return;
        }

        setCheckingId(true);
        try {
            const data = await checkCourseId(id);
            setIdCheckMessage(data?.isAvailable ? "✓ ID is available!" : "✗ ID is already taken.");
            setIdAvailable(data?.isAvailable || false);
        } catch (error) {
            setIdCheckMessage("Failed to check ID availability.");
            setIdAvailable(false);
        } finally {
            setCheckingId(false);
        }
    };

    // Module handlers
    const handleAddModule = () => {
        const newModule = {
            moduleId: generateModuleId(),
            title: '',
            description: '',
            items: [],
            order: modules.length + 1
        };
        setModules([...modules, newModule]);
        // Don't show toast for adding module
    };

    const handleRemoveModule = (moduleIndex) => {
        const updatedModules = modules.filter((_, index) => index !== moduleIndex);
        const reorderedModules = updatedModules.map((module, index) => ({
            ...module,
            order: index + 1
        }));
        setModules(reorderedModules);
        toast.info("Module removed.");
    };

    const handleModuleFieldChange = (moduleIndex, field, value) => {
        const updatedModules = modules.map((module, index) => {
            if (index === moduleIndex) {
                const updatedModule = { ...module, [field]: value };

                // Recalculate duration if items changed
                if (field === 'items') {
                    updatedModule.duration = calculateModuleDuration(value);
                }

                return updatedModule;
            }
            return module;
        });
        setModules(updatedModules);
    };

    // Item handlers
    const handleAddItem = (moduleIndex, type) => {
        const baseItem = {
            itemId: generateItemId(),
            type,
            title: '',
            status: 'private',
            order: modules[moduleIndex].items.length + 1
        };

        let newItem;
        switch (type) {
            case 'video':
                newItem = {
                    ...baseItem,
                    description: '',
                    duration: '',
                    url: null
                };
                break;
            case 'textInstruction':
                newItem = {
                    ...baseItem,
                    content: ''
                };
                break;
            case 'quiz':
                newItem = {
                    ...baseItem,
                    question: '',
                    options: ['', '', '', ''],
                    answer: 0
                };
                break;
            case 'file':
                newItem = {
                    ...baseItem,
                    description: '',
                    duration: '',
                    url: null
                };
                break;
            default:
                newItem = baseItem;
        }

        const updatedItems = [...modules[moduleIndex].items, newItem];
        handleModuleFieldChange(moduleIndex, 'items', updatedItems);
        // Don't show toast for adding item
    };

    const handleRemoveItem = (moduleIndex, itemIndex) => {
        const updatedItems = modules[moduleIndex].items.filter((_, idx) => idx !== itemIndex);
        const reorderedItems = updatedItems.map((item, idx) => ({
            ...item,
            order: idx + 1
        }));
        handleModuleFieldChange(moduleIndex, 'items', reorderedItems);
    };

    // Fixed: Handle item field change without flickering
    const handleItemFieldChange = (moduleIndex, itemIndex, field, value) => {
        setModules(prevModules => {
            return prevModules.map((module, modIdx) => {
                if (modIdx === moduleIndex) {
                    const updatedItems = module.items.map((item, itmIdx) => {
                        if (itmIdx === itemIndex) {
                            return { ...item, [field]: value };
                        }
                        return item;
                    });

                    // Recalculate module duration (debounced)
                    setTimeout(() => {
                        const newModuleDuration = calculateModuleDuration(updatedItems);
                        if (newModuleDuration !== module.duration) {
                            handleModuleFieldChange(moduleIndex, 'duration', newModuleDuration);
                        }
                    }, 300); // 300ms debounce

                    return { ...module, items: updatedItems };
                }
                return module;
            });
        });
    };

    // Clear item fields (without deleting the item)
    const handleClearItemFields = (moduleIndex, itemIndex, type) => {
        const currentItem = modules[moduleIndex]?.items[itemIndex];
        if (!currentItem) return;

        let clearedItem;
        switch (type) {
            case 'video':
                clearedItem = {
                    ...currentItem,
                    title: '',
                    description: '',
                    duration: '',
                    url: null
                };
                break;
            case 'textInstruction':
                clearedItem = {
                    ...currentItem,
                    title: '',
                    content: ''
                };
                break;
            case 'quiz':
                clearedItem = {
                    ...currentItem,
                    question: '',
                    options: ['', '', '', ''],
                    answer: 0
                };
                break;
            case 'file':
                clearedItem = {
                    ...currentItem,
                    title: '',
                    description: '',
                    duration: '',
                    url: null
                };
                break;
            default:
                clearedItem = { ...currentItem };
        }

        const updatedItems = modules[moduleIndex].items.map((item, idx) =>
            idx === itemIndex ? clearedItem : item
        );

        handleModuleFieldChange(moduleIndex, 'items', updatedItems);
        toast.info(`Cleared ${type} fields`);
    };

    const handleVideoUploadComplete = (moduleIndex, itemIndex, fileData) => {
        const currentModule = modules[moduleIndex];
        if (!currentModule) return;

        const currentItem = currentModule.items[itemIndex];
        if (!currentItem) return;

        // Update only the URL field and duration if provided
        const updatedItem = {
            ...currentItem,
            url: fileData,
            // Only update duration if it comes from fileData and is valid
            duration: fileData.duration && fileData.duration > 0 ? fileData.duration : currentItem.duration || ''
        };

        const updatedItems = currentModule.items.map((item, idx) =>
            idx === itemIndex ? updatedItem : item
        );

        const updatedModule = {
            ...currentModule,
            items: updatedItems,
            duration: calculateModuleDuration(updatedItems)
        };

        const updatedModules = modules.map((module, idx) =>
            idx === moduleIndex ? updatedModule : module
        );

        setModules(updatedModules);
        toast.success(`Video "${currentItem.title || 'Untitled'}" uploaded successfully!`);
    };

    const handleFileUploadComplete = (moduleIndex, itemIndex, fileData) => {
        const currentModule = modules[moduleIndex];
        if (!currentModule) return;

        const currentItem = currentModule.items[itemIndex];
        if (!currentItem) return;

        const updatedItem = {
            ...currentItem,
            url: fileData
        };

        const updatedItems = currentModule.items.map((item, idx) =>
            idx === itemIndex ? updatedItem : item
        );

        const updatedModule = {
            ...currentModule,
            items: updatedItems
        };

        const updatedModules = modules.map((module, idx) =>
            idx === moduleIndex ? updatedModule : module
        );

        setModules(updatedModules);
        toast.success(`File "${currentItem.title || 'Untitled'}" uploaded successfully!`);
    };

    // Quiz handlers
    const handleQuizOptionChange = (moduleIndex, itemIndex, optionIndex, value) => {
        const updatedItems = modules[moduleIndex].items.map((item, idx) => {
            if (idx === itemIndex && item.type === 'quiz') {
                const newOptions = [...item.options];
                newOptions[optionIndex] = value;
                return { ...item, options: newOptions };
            }
            return item;
        });
        handleModuleFieldChange(moduleIndex, 'items', updatedItems);
    };

    const handleQuizAnswerChange = (moduleIndex, itemIndex, answerIndex) => {
        handleItemFieldChange(moduleIndex, itemIndex, 'answer', answerIndex);
    };

    // List handlers (learningItems, additionalMaterials, courseIncludes)
    const handleListTextChange = (setter, list, index, value) => {
        const updatedList = list.map((item, idx) =>
            idx === index ? { ...item, text: value } : item
        );
        setter(updatedList);
    };

    const handleAddListItem = (setter, list) => {
        setter([...list, { text: '' }]);
    };

    const handleRemoveListItem = (setter, list, index) => {
        setter(list.filter((_, idx) => idx !== index));
    };

    // Image upload handlers
    const handleUploadImage = async (event, setter) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            toast.info("Uploading image...");
            const imageUrl = await uploadFile(file);
            setter(imageUrl);
            toast.success("Image uploaded successfully!");
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image.");
        }
    };

    // Auto-save draft
    useEffect(() => {
        const saveDraft = () => {
            const draft = {
                formData: watch(),
                modules,
                coverPhotoUrl,
                instructorImage,
                learningItems,
                additionalMaterials,
                courseIncludes
            };
            localStorage.setItem('add_course_draft', JSON.stringify(draft));
        };

        const timer = setTimeout(saveDraft, 1000);
        return () => clearTimeout(timer);
    }, [watch(), modules, coverPhotoUrl, instructorImage, learningItems, additionalMaterials, courseIncludes]);

    // Load draft on mount
    useEffect(() => {
        const draft = localStorage.getItem('add_course_draft');
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                // Load form data
                Object.keys(parsed.formData || {}).forEach(key => {
                    setValue(key, parsed.formData[key]);
                });
                // Load other states
                setModules(parsed.modules || []);
                setCoverPhotoUrl(parsed.coverPhotoUrl || '');
                setInstructorImage(parsed.instructorImage || '');
                setLearningItems(parsed.learningItems || [{ text: '' }]);
                setAdditionalMaterials(parsed.additionalMaterials || [{ text: '' }]);
                setCourseIncludes(parsed.courseIncludes || [{ text: '' }]);

                // Check ID availability
                if (parsed.formData?.courseId) {
                    checkIdAvailability(parsed.formData.courseId);
                }

                toast.info("Draft loaded from previous session.");
            } catch (error) {
                console.error("Error loading draft:", error);
            }
        }
    }, []);
    const handleBeforeUnload = (e) => {
        if (!formSubmitted) {
            e.preventDefault();
            e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        }
    };
    // Prevent accidental navigation - Only show if form not submitted
    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [formSubmitted]);

    // Render helper components
    const renderModuleDuration = (module) => {
        if (!module.duration) return null;
        return (
            <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                <ClockSVG className="w-4 h-4" />
                <span>{module.duration}</span>
            </div>
        );
    };

    const renderQuizItem = (moduleIndex, itemIndex, item) => (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <div className="flex-1">
                    <input
                        type="text"
                        value={item.question || ''}
                        onChange={(e) =>
                            handleItemFieldChange(moduleIndex, itemIndex, 'question', e.target.value)
                        }
                        placeholder="Quiz Question"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleClearItemFields(moduleIndex, itemIndex, 'quiz')}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-full"
                        title="Clear Fields"
                    >
                        Clear
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRemoveItem(moduleIndex, itemIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Remove Quiz"
                    >
                        <TrashSVG className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {item.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                        <input
                            type="radio"
                            name={`quiz-${moduleIndex}-${itemIndex}`}
                            checked={item.answer === optionIndex}
                            onChange={() => handleQuizAnswerChange(moduleIndex, itemIndex, optionIndex)}
                            className="h-4 w-4 text-blue-600"
                        />
                        <input
                            type="text"
                            value={option || ''}
                            onChange={(e) =>
                                handleQuizOptionChange(moduleIndex, itemIndex, optionIndex, e.target.value)
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTextInstructionItem = (moduleIndex, itemIndex, item) => (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) =>
                        handleItemFieldChange(moduleIndex, itemIndex, 'title', e.target.value)
                    }
                    placeholder="Instruction Title"
                    className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <select
                    value={item.status || 'private'}
                    onChange={(e) =>
                        handleItemFieldChange(moduleIndex, itemIndex, 'status', e.target.value)
                    }
                    className="mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                </select>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleClearItemFields(moduleIndex, itemIndex, 'textInstruction')}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-full"
                        title="Clear Fields"
                    >
                        Clear
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRemoveItem(moduleIndex, itemIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Remove Instruction"
                    >
                        <TrashSVG className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                </label>
                <RichTextEditor
                    onContentChange={(content) =>
                        handleItemFieldChange(moduleIndex, itemIndex, 'content', content)
                    }
                    initialContent={item.content}
                    uniqueKey={`text-instruction-${moduleIndex}-${itemIndex}`}
                />
            </div>

            {item.content && (
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded">
                    <strong>Estimated reading time:</strong> {
                        Math.max(1, Math.ceil(
                            item.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200
                        ))
                    } minutes
                </div>
            )}
        </div>
    );

    const renderVideoItem = (moduleIndex, itemIndex, item) => {
        const handleUpload = (fileData) => {
            handleVideoUploadComplete(moduleIndex, itemIndex, fileData);
        };

        return (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) =>
                            handleItemFieldChange(moduleIndex, itemIndex, 'title', e.target.value)
                        }
                        placeholder="Video Title"
                        className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <select
                        value={item.status || 'private'}
                        onChange={(e) =>
                            handleItemFieldChange(moduleIndex, itemIndex, 'status', e.target.value)
                        }
                        disabled={item.url} // Disable when file is uploaded
                        className="mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                    </select>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => handleClearItemFields(moduleIndex, itemIndex, 'video')}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-full"
                            title="Clear Fields"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRemoveItem(moduleIndex, itemIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            title="Remove Video"
                        >
                            <TrashSVG className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) =>
                        handleItemFieldChange(moduleIndex, itemIndex, 'description', e.target.value)
                    }
                    placeholder="Video Description (optional)"
                    className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />

                {/* Single duration input - removed from CourseUploadBox */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center gap-2">
                            <ClockSVG className="w-4 h-4" />
                            Duration (minutes)
                        </div>
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={item.duration || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Update local state immediately for better UX
                            handleItemFieldChange(moduleIndex, itemIndex, 'duration', value);
                        }}
                        placeholder="Estimated duration in minutes"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                <div className="mb-3">
                    <CourseUploadBox
                        key={`upload-${moduleIndex}-${itemIndex}-${item.itemId}`}
                        label="Upload Video"
                        accept="video/*"
                        status={item.status || 'private'}
                        type="video"
                        estimatedDuration={item.duration || ''}
                        onDurationChange={(duration) =>
                            handleItemFieldChange(moduleIndex, itemIndex, 'duration', duration)
                        }
                        onUpload={handleUpload}
                        itemId={item.itemId}
                        disableStatusChange={!!item.url} // Disable status change when file exists
                    />
                    {item.url && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <VideoSVG className="w-4 h-4 text-green-600" />
                                        <span className="font-medium text-green-800 truncate">
                                            {item.url.originalName || item.url.filename}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-green-700 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Size:</span>
                                            <span>{item.url.size ? `${(item.url.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}</span>
                                        </div>
                                        {item.duration && item.duration > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Duration:</span>
                                                <span>{item.duration} minutes</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Ready
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderFileItem = (moduleIndex, itemIndex, item) => {
        const handleUpload = (fileData) => {
            handleFileUploadComplete(moduleIndex, itemIndex, fileData);
        };

        return (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) =>
                            handleItemFieldChange(moduleIndex, itemIndex, 'title', e.target.value)
                        }
                        placeholder="File Title"
                        className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <select
                        value={item.status || 'private'}
                        onChange={(e) =>
                            handleItemFieldChange(moduleIndex, itemIndex, 'status', e.target.value)
                        }
                        disabled={item.url} // Disable when file is uploaded
                        className="mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                    </select>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => handleClearItemFields(moduleIndex, itemIndex, 'file')}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-full"
                            title="Clear Fields"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRemoveItem(moduleIndex, itemIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            title="Remove File"
                        >
                            <TrashSVG className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) =>
                        handleItemFieldChange(moduleIndex, itemIndex, 'description', e.target.value)
                    }
                    placeholder="File Description (optional)"
                    className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />

                {/* Optional duration for files */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Time (minutes, optional)
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={item.duration || ''}
                        onChange={(e) =>
                            handleItemFieldChange(moduleIndex, itemIndex, 'duration', e.target.value)
                        }
                        placeholder="Estimated time to complete"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                <div className="mb-3">
                    <CourseUploadBox
                        key={`upload-file-${moduleIndex}-${itemIndex}-${item.itemId}`}
                        label="Upload File"
                        accept="application/pdf,image/*,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                        status={item.status || 'private'}
                        type="file"
                        onUpload={handleUpload}
                        itemId={item.itemId}
                        disableStatusChange={!!item.url} // Disable status change when file exists
                    />
                    {item.url && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <FileSVG className="w-4 h-4 text-green-600" />
                                        <span className="font-medium text-green-800 truncate">
                                            {item.url.originalName || item.url.filename}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-green-700">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Size:</span>
                                            <span>{item.url.size ? `${(item.url.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Ready
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Calculate statistics
    const totalItems = modules.reduce((sum, module) => sum + module.items.length, 0);
    const videoCount = modules.reduce((sum, module) =>
        sum + module.items.filter(item => item.type === 'video').length, 0
    );
    const quizCount = modules.reduce((sum, module) =>
        sum + module.items.filter(item => item.type === 'quiz').length, 0
    );
    const textCount = modules.reduce((sum, module) =>
        sum + module.items.filter(item => item.type === 'textInstruction').length, 0
    );
    const fileCount = modules.reduce((sum, module) =>
        sum + module.items.filter(item => item.type === 'file').length, 0
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto p-4 bg-white shadow-lg rounded-xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h2>
                <p className="text-gray-600">Fill in the details below to create a new course</p>
            </div>

            {/* Course Summary Stats */}
            <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{modules.length}</div>
                    <div className="text-sm text-blue-600">Modules</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{totalItems}</div>
                    <div className="text-sm text-green-600">Total Items</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">{videoCount}</div>
                    <div className="text-sm text-purple-600">Videos</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">{quizCount}</div>
                    <div className="text-sm text-yellow-600">Quizzes</div>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-pink-700">{textCount}</div>
                    <div className="text-sm text-pink-600">Texts</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-700">{calculateTotalDuration()}</div>
                    <div className="text-sm text-indigo-600">Duration</div>
                </div>
            </div>

            {/* Basic Information Section */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Course Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            {...register('title', { required: 'Course title is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter course title"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                            Course ID *
                        </label>
                        <input
                            type="text"
                            id="courseId"
                            {...register('courseId', {
                                required: 'Course ID is required',
                                pattern: {
                                    value: /^[a-zA-Z0-9_-]+$/,
                                    message: 'Only letters, numbers, hyphens and underscores allowed'
                                }
                            })}
                            onChange={(e) => {
                                const formatted = formatUrlAdIds(e.target.value);
                                setValue("courseId", formatted, { shouldValidate: true });
                            }}
                            onBlur={(e) => checkIdAvailability(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., python-basics"
                        />
                        <div className="mt-1">
                            {checkingId ? (
                                <p className="text-sm text-blue-600">Checking availability...</p>
                            ) : (
                                <p className={`text-sm ${idAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                    {idCheckMessage}
                                </p>
                            )}
                        </div>
                        {errors.courseId && <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Duration (auto-calculated)
                        </label>
                        <input
                            type="text"
                            id="duration"
                            value={calculateTotalDuration()}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-700"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Based on video durations and content length
                        </p>
                    </div>

                    <div>
                        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            Short Description *
                        </label>
                        <input
                            type="text"
                            id="shortDescription"
                            {...register('shortDescription', { required: 'Short description is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Brief description of the course"
                        />
                        {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>}
                    </div>
                </div>

                <div className="mt-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Description *
                    </label>
                    <Controller
                        name="description"
                        control={control}
                        rules={{ required: 'Course description is required' }}
                        render={({ field }) => (
                            <RichTextEditor
                                onContentChange={field.onChange}
                                initialContent={field.value}
                                uniqueKey="course-description"
                                height="300px"
                            />
                        )}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>
            </div>

            {/* Pricing Section */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price (৳) *
                        </label>
                        <input
                            type="number"
                            id="price"
                            {...register('price', {
                                required: 'Price is required',
                                min: { value: 0, message: 'Price cannot be negative' }
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter price in BDT"
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="offerPrice" className="block text-sm font-medium text-gray-700 mb-1">
                            Offer Price (৳) - Optional
                        </label>
                        <input
                            type="number"
                            id="offerPrice"
                            {...register('offerPrice', {
                                min: { value: 0, message: 'Offer price cannot be negative' }
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter offer price"
                        />
                        {errors.offerPrice && <p className="mt-1 text-sm text-red-600">{errors.offerPrice.message}</p>}
                    </div>
                </div>
            </div>

            {/* Instructor Section */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Instructor Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-1">
                            Instructor Name *
                        </label>
                        <input
                            type="text"
                            id="instructor"
                            {...register('instructor', { required: 'Instructor name is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter instructor name"
                        />
                        {errors.instructor && <p className="mt-1 text-sm text-red-600">{errors.instructor.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="instructorDesignation" className="block text-sm font-medium text-gray-700 mb-1">
                            Designation
                        </label>
                        <input
                            type="text"
                            id="instructorDesignation"
                            {...register('instructorDesignation')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Teacher, Developer, Expert"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label htmlFor="aboutInstructor" className="block text-sm font-medium text-gray-700 mb-1">
                        About Instructor
                    </label>
                    <Controller
                        name="aboutInstructor"
                        control={control}
                        render={({ field }) => (
                            <RichTextEditor
                                onContentChange={field.onChange}
                                initialContent={field.value}
                                uniqueKey="about-instructor"
                                height="200px"
                            />
                        )}
                    />
                </div>

                <div className="mt-6">
                    <label htmlFor="instructorImage" className="block text-sm font-medium text-gray-700 mb-1">
                        Instructor Photo
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            id="instructorImage"
                            accept="image/*"
                            onChange={(e) => handleUploadImage(e, setInstructorImage)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {instructorImage && (
                            <div className="relative">
                                <img
                                    src={instructorImage}
                                    alt="Instructor"
                                    className="w-24 h-24 object-cover rounded-lg border"
                                />
                                <button
                                    type="button"
                                    onClick={() => setInstructorImage('')}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <TrashSVG className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Media Section */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Media</h3>

                <div>
                    <label htmlFor="coverPhoto" className="block text-sm font-medium text-gray-700 mb-1">
                        Course Cover Photo *
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            id="coverPhoto"
                            accept="image/*"
                            onChange={(e) => handleUploadImage(e, setCoverPhotoUrl)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {coverPhotoUrl && (
                            <div className="relative">
                                <img
                                    src={coverPhotoUrl}
                                    alt="Cover"
                                    className="w-32 h-24 object-cover rounded-lg border"
                                />
                                <button
                                    type="button"
                                    onClick={() => setCoverPhotoUrl('')}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <TrashSVG className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    {!coverPhotoUrl && (
                        <p className="mt-1 text-sm text-red-600">Cover photo is required</p>
                    )}
                </div>
            </div>

            {/* SEO & Metadata */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">SEO & Metadata</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            SEO Description
                        </label>
                        <textarea
                            id="seoDescription"
                            {...register('seoDescription')}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Meta description for search engines"
                        />
                    </div>

                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <input
                            type="text"
                            id="tags"
                            {...register('tags')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Comma-separated tags"
                        />
                        <p className="mt-1 text-xs text-gray-500">e.g., python, programming, web-development</p>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Publication Date
                    </label>
                    <Controller
                        name="addedOn"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                noLabel={true}
                                defaultDate={new Date()}
                                onChangeHanlder={field.onChange}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Course Details Lists */}
            <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Who This Course is For */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Who This Course is For</h4>
                        {learningItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={item.text}
                                        onChange={(e) => handleListTextChange(setLearningItems, learningItems, index, e.target.value)}
                                        placeholder={`Point ${index + 1}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveListItem(setLearningItems, learningItems, index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    disabled={learningItems.length === 1}
                                >
                                    <TrashSVG className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddListItem(setLearningItems, learningItems)}
                            className="mt-2 w-full px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800"
                        >
                            + Add Another Point
                        </button>
                    </div>

                    {/* Additional Materials */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Additional Materials</h4>
                        {additionalMaterials.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={item.text}
                                        onChange={(e) => handleListTextChange(setAdditionalMaterials, additionalMaterials, index, e.target.value)}
                                        placeholder={`Material ${index + 1}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveListItem(setAdditionalMaterials, additionalMaterials, index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    disabled={additionalMaterials.length === 1}
                                >
                                    <TrashSVG className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddListItem(setAdditionalMaterials, additionalMaterials)}
                            className="mt-2 w-full px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800"
                        >
                            + Add Another Material
                        </button>
                    </div>

                    {/* Course Includes */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Course Includes</h4>
                        {courseIncludes.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={item.text}
                                        onChange={(e) => handleListTextChange(setCourseIncludes, courseIncludes, index, e.target.value)}
                                        placeholder={`Feature ${index + 1}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveListItem(setCourseIncludes, courseIncludes, index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    disabled={courseIncludes.length === 1}
                                >
                                    <TrashSVG className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddListItem(setCourseIncludes, courseIncludes)}
                            className="mt-2 w-full px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800"
                        >
                            + Add Another Feature
                        </button>
                    </div>
                </div>
            </div>

            {/* Modules Section */}
            <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Modules</h3>

                {modules.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                        <div className="text-gray-400 mb-4">
                            <AddSVG className="w-16 h-16 mx-auto" color="#9CA3AF" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-700 mb-2">No modules yet</h4>
                        <p className="text-gray-500 mb-4">Add your first module to start building your course</p>
                        <button
                            type="button"
                            onClick={handleAddModule}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create First Module
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {modules.map((module, moduleIndex) => (
                            <div key={module.moduleId} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium">
                                                {module.order}
                                            </span>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={module.title}
                                                    onChange={(e) => handleModuleFieldChange(moduleIndex, 'title', e.target.value)}
                                                    placeholder="Module Title"
                                                    className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                                                />
                                                <input
                                                    type="text"
                                                    value={module.description}
                                                    onChange={(e) => handleModuleFieldChange(moduleIndex, 'description', e.target.value)}
                                                    placeholder="Module Description (optional)"
                                                    className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 w-full mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {renderModuleDuration(module)}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveModule(moduleIndex)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Remove Module"
                                            >
                                                <TrashSVG className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Module Items */}
                                    {module.items.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                            <p className="text-gray-500 mb-4">No items in this module yet</p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddItem(moduleIndex, 'video')}
                                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center gap-2"
                                                >
                                                    <VideoSVG className="w-4 h-4" />
                                                    Add Video
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddItem(moduleIndex, 'textInstruction')}
                                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center gap-2"
                                                >
                                                    <ClipboardSVG className="w-4 h-4" />
                                                    Add Text
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddItem(moduleIndex, 'quiz')}
                                                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 flex items-center gap-2"
                                                >
                                                    <QuizSVG className="w-4 h-4" />
                                                    Add Quiz
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddItem(moduleIndex, 'file')}
                                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center gap-2"
                                                >
                                                    <FileSVG className="w-4 h-4" />
                                                    Add File
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {module.items.map((item, itemIndex) => (
                                                <div key={item.itemId} className="relative">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
                                                    <div className="ml-4">
                                                        {item.type === 'video' && renderVideoItem(moduleIndex, itemIndex, item)}
                                                        {item.type === 'textInstruction' && renderTextInstructionItem(moduleIndex, itemIndex, item)}
                                                        {item.type === 'quiz' && renderQuizItem(moduleIndex, itemIndex, item)}
                                                        {item.type === 'file' && renderFileItem(moduleIndex, itemIndex, item)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Item Buttons */}
                                    {module.items.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddItem(moduleIndex, 'video')}
                                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center gap-2"
                                                >
                                                    <VideoSVG className="w-4 h-4" />
                                                    Add Video
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddItem(moduleIndex, 'textInstruction')}
                                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center gap-2"
                                                >
                                                    <ClipboardSVG className="w-4 h-4" />
                                                    Add Text
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddItem(moduleIndex, 'quiz')}
                                                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 flex items-center gap-2"
                                                >
                                                    <QuizSVG className="w-4 h-4" />
                                                    Add Quiz
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddItem(moduleIndex, 'file')}
                                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center gap-2"
                                                >
                                                    <FileSVG className="w-4 h-4" />
                                                    Add File
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Module Button at the bottom */}
                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={handleAddModule}
                        className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 mx-auto"
                    >
                        <AddSVG className="w-6 h-6" color="#ffffff" />
                        Add Another Module
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 -mx-4 px-4">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        <p>Draft auto-saved locally</p>
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem('add_course_draft');
                                resetForm();
                                toast.success("Form cleared and draft removed.");
                            }}
                            className="text-red-600 hover:text-red-800 mt-1"
                        >
                            Clear all data
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!idAvailable || modules.length === 0 || isSubmitting || !coverPhotoUrl}
                            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                'Publish Course'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Flip}
            />
        </form>
    );
};

export default AddCourse;