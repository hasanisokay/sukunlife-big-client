'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { v4 as uuidv4 } from 'uuid';
import { Flip, toast, ToastContainer } from 'react-toastify';
import DatePicker from '@/components/ui/datepicker/Datepicker';
import { AddSVG, ClipboardSVG, QuizSVG, VideoSVG, FileSVG, ClockSVG, TrashSVG, UploadSVG } from '@/components/svg/SvgCollection';
import getDateObjWithoutTime from '@/utils/getDateObjWithoutTime.mjs';
import editCourse from '@/server-functions/editCourse.mjs';
import checkCourseId from '@/server-functions/checkCourseId.mjs';
import formatUrlAdIds from '@/utils/formatUrlAdIds.mjs';
import uploadFile from '@/utils/uploadFile.mjs';
import CourseUploadBox from '@/components/shared/CourseUploadBox';

const EditCourse = ({ course }) => {
    const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm();
    const [checkingId, setCheckingId] = useState(false);
    const [idCheckMessage, setIdCheckMessage] = useState('');
    const [idAvailable, setIdAvailable] = useState(true);
    const [modules, setModules] = useState([]);
    const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
    const [instructorImage, setInstructorImage] = useState('');
    const [learningItems, setLearningItems] = useState([{ text: '' }]);
    const [additionalMaterials, setAdditionalMaterials] = useState([{ text: '' }]);
    const [courseIncludes, setCourseIncludes] = useState([{ text: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [idValidation, setIdValidation] = useState({
        moduleIds: {},
        itemIds: {}
    });

    // Use refs to track focus
    const moduleIdRefs = useRef({});
    const itemIdRefs = useRef({});

    // Watch courseId for validation
    const courseId = watch('courseId');

    useEffect(() => {
        if (course) {
            // First reset the form
            reset({
                title: course.title || '',
                courseId: course.courseId || '',
                shortDescription: course.shortDescription || '',
                duration: course.duration || '',
                description: course.description || '',
                price: course.price || '',
                offerPrice: course.offerPrice || '',
                instructor: course.instructor || '',
                instructorDesignation: course.instructorDesignation || '',
                aboutInstructor: course.aboutInstructor || '',
                seoDescription: course.seoDescription || '',
                tags: course.tags || '',
                addedOn: course.addedOn ? new Date(course.addedOn) : new Date()
            });

            // Set other states
            setModules(course.modules?.map((module, index) => ({
                ...module,
                moduleId: module.moduleId || `module-${uuidv4().split('-')[0]}`,
                order: module.order || index + 1,
                items: module.items?.map((item, itemIndex) => ({
                    ...item,
                    itemId: item.itemId || `item-${uuidv4().split('-')[0]}`,
                    order: item.order || itemIndex + 1
                })) || []
            })) || []);

            setCoverPhotoUrl(course.coverPhotoUrl || '');
            setInstructorImage(course.instructorImage || '');
            setLearningItems(course.learningItems?.length > 0 ? course.learningItems : [{ text: '' }]);
            setAdditionalMaterials(course.additionalMaterials?.length > 0 ? course.additionalMaterials : [{ text: '' }]);
            setCourseIncludes(course.courseIncludes?.length > 0 ? course.courseIncludes : [{ text: '' }]);

            setIdAvailable(true);
            setIdCheckMessage('✓ Current course ID');
        }
    }, [course, reset]);

    // Generate unique IDs
    const generateModuleId = () => `module-${uuidv4().split('-')[0]}`;
    const generateItemId = () => `item-${uuidv4().split('-')[0]}`;

    // ID Validation Functions
    // Reusable validation function
    const validateId = (id, type = "ID") => {
        if (!id || id.trim() === "") {
            return { isValid: false, message: `${type} is required` };
        }

        // Regex: only lowercase letters, numbers, hyphens, and underscores
        const regex = /^[a-z0-9-_]+$/;
        if (!regex.test(id)) {
            return { isValid: false, message: "Only lowercase letters, numbers, hyphens, and underscores allowed" };
        }

        return { isValid: true, message: "✓ Format valid" };
    };

    // Validate Module ID
    const validateModuleId = (moduleId, currentModuleIndex) => {
        const baseValidation = validateId(moduleId, "Module ID");
        if (!baseValidation.isValid) return baseValidation;

        // Check for duplicates
        const duplicateIndex = modules.findIndex(
            (module, index) => index !== currentModuleIndex && module.moduleId === moduleId
        );

        if (duplicateIndex !== -1) {
            return { isValid: false, message: `Duplicate ID used in module ${duplicateIndex + 1}` };
        }

        return { isValid: true, message: "✓ Available" };
    };

    // Validate Item ID
    const validateItemId = (itemId, moduleIndex, currentItemIndex) => {
        const baseValidation = validateId(itemId, "Item ID");
        if (!baseValidation.isValid) return baseValidation;

        // Check for duplicates within the same module
        const currentModule = modules[moduleIndex];
        if (currentModule?.items) {
            const duplicateIndex = currentModule.items.findIndex(
                (item, index) => index !== currentItemIndex && item.itemId === itemId
            );

            if (duplicateIndex !== -1) {
                return { isValid: false, message: "Duplicate ID in same module" };
            }
        }

        return { isValid: true, message: "✓ Available" };
    };

    const handleIdChange = (type, moduleIndex, itemIndex, value) => {
        const formatted = formatUrlAdIds(value);

        if (type === 'module') {
            // Update module ID
            setModules(prevModules =>
                prevModules.map((module, idx) =>
                    idx === moduleIndex ? { ...module, moduleId: formatted } : module
                )
            );

            // Validate immediately
            const validation = validateModuleId(formatted, moduleIndex);
            setIdValidation(prev => ({
                ...prev,
                moduleIds: {
                    ...prev.moduleIds,
                    [`${moduleIndex}`]: validation
                }
            }));
        } else if (type === 'item') {
            // Update item ID
            setModules(prevModules =>
                prevModules.map((module, modIdx) => {
                    if (modIdx === moduleIndex) {
                        return {
                            ...module,
                            items: module.items.map((item, itmIdx) =>
                                itmIdx === itemIndex ? { ...item, itemId: formatted } : item
                            )
                        };
                    }
                    return module;
                })
            );

            // Validate immediately
            const validation = validateItemId(formatted, moduleIndex, itemIndex);
            setIdValidation(prev => ({
                ...prev,
                itemIds: {
                    ...prev.itemIds,
                    [`${moduleIndex}-${itemIndex}`]: validation
                }
            }));
        }
    };

    const handleIdBlur = (type, moduleIndex, itemIndex, value) => {
        if (!value || value.trim() === '') return;

        if (type === 'module') {
            const validation = validateModuleId(value, moduleIndex);
            setIdValidation(prev => ({
                ...prev,
                moduleIds: {
                    ...prev.moduleIds,
                    [`${moduleIndex}`]: validation
                }
            }));

            if (!validation.isValid) {
                toast.error(`Module ID error: ${validation.message}`);
            }
        } else if (type === 'item') {
            const validation = validateItemId(value, moduleIndex, itemIndex);
            setIdValidation(prev => ({
                ...prev,
                itemIds: {
                    ...prev.itemIds,
                    [`${moduleIndex}-${itemIndex}`]: validation
                }
            }));

            if (!validation.isValid) {
                toast.error(`Item ID error: ${validation.message}`);
            }
        }
    };

    // Calculate durations
    const calculateModuleDuration = (items) => {
        let totalMinutes = 0;

        items.forEach(item => {
            if (item.type === 'video' && item.duration) {
                totalMinutes += parseInt(item.duration) || 0;
            } else if (item.type === 'textInstruction' && item.content) {
                const wordCount = item.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
                totalMinutes += Math.max(1, Math.ceil(wordCount / 200));
            } else if (item.type === 'quiz') {
                totalMinutes += 5;
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

    // Form submission with ID validation
    const validateAllIds = () => {
        const errors = [];

        // Validate module IDs
        modules.forEach((module, moduleIndex) => {
            const validation = validateModuleId(module.moduleId, moduleIndex);
            if (!validation.isValid) {
                errors.push(`Module ${moduleIndex + 1}: ${validation.message}`);
            }

            // Validate item IDs
            module.items.forEach((item, itemIndex) => {
                const itemValidation = validateItemId(item.itemId, moduleIndex, itemIndex);
                if (!itemValidation.isValid) {
                    errors.push(`Module ${moduleIndex + 1}, Item ${itemIndex + 1}: ${itemValidation.message}`);
                }
            });
        });

        return errors;
    };

    const onSubmit = async (data) => {
        if (!idAvailable && data.courseId !== course.courseId) {
            toast.error("Course ID is not available.");
            return;
        }

        if (modules.length === 0) {
            toast.error("Please add at least one module.");
            return;
        }

        if (!coverPhotoUrl) {
            toast.error("Cover photo is required.");
            return;
        }

        // Validate all IDs before submission
        const idErrors = validateAllIds();
        if (idErrors.length > 0) {
            toast.error("Please fix the ID errors before submitting:");
            idErrors.forEach(error => {
                toast.error(error, { autoClose: 3000 });
            });
            return;
        }

        setIsSubmitting(true);
        setFormSubmitted(true);

        try {
            const totalDuration = calculateTotalDuration();
            const dateObj = data.addedOn || new Date();
            const date = getDateObjWithoutTime(dateObj);
            const now = new Date();

            const courseData = {
                ...data,
                _id: course._id,
                addedOn: date,
                updatedOn: getDateObjWithoutTime(now),
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
                courseIncludes: courseIncludes.filter(item => item.text.trim())
            };

            const result = await editCourse(courseData, course?._id);

            if (result?.status === 200) {
                toast.success(result?.message || "Course updated successfully!");
                window.removeEventListener("beforeunload", handleBeforeUnload);
                setTimeout(() => {
                    window.location.href = "/dashboard/courses";
                }, 1500);
            } else {
                toast.error(result?.message || "Failed to update course.");
                setFormSubmitted(false);
            }
        } catch (error) {
            console.error("Error updating course:", error);
            toast.error("An error occurred while updating the course.");
            setFormSubmitted(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check ID availability
    const checkIdAvailability = async (id) => {
        if (!id || id.trim() === '') {
            setIdCheckMessage('');
            setIdAvailable(false);
            return;
        }

        // If ID hasn't changed, it's available
        if (id === course.courseId) {
            setIdCheckMessage('✓ Current course ID');
            setIdAvailable(true);
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
    };

    const handleRemoveItem = (moduleIndex, itemIndex) => {
        const updatedItems = modules[moduleIndex].items.filter((_, idx) => idx !== itemIndex);
        const reorderedItems = updatedItems.map((item, idx) => ({
            ...item,
            order: idx + 1
        }));
        handleModuleFieldChange(moduleIndex, 'items', reorderedItems);
    };

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

                    // Recalculate module duration
                    // setTimeout(() => {
                    //     const newModuleDuration = calculateModuleDuration(updatedItems);
                    //     if (newModuleDuration !== module.duration) {
                    //         handleModuleFieldChange(moduleIndex, 'duration', newModuleDuration);
                    //     }
                    // }, 300);

                    return { ...module, items: updatedItems };
                }
                return module;
            });
        });
    };

    // Clear item fields
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

        const updatedItem = {
            ...currentItem,
            url: fileData,
            isEncrypted: currentItem?.isEncrypted ||currentItem.status === 'private',
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
        toast.success(`Video "${currentItem.title || 'Untitled'}" updated successfully!`);
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

    // List handlers
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

    // Prevent accidental navigation
    const handleBeforeUnload = (e) => {
        if (!formSubmitted) {
            e.preventDefault();
            e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        }
    };

    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [formSubmitted]);

    // Get module validation
    const getModuleValidation = (moduleIndex) => {
        return idValidation.moduleIds[`${moduleIndex}`] || null;
    };

    // Get item validation
    const getItemValidation = (moduleIndex, itemIndex) => {
        return idValidation.itemIds[`${moduleIndex}-${itemIndex}`] || null;
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

    // Render helper components with stable keys
    const renderModuleDuration = (module) => {
        if (!module.duration) return null;
        return (
            <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                <ClockSVG className="w-4 h-4" />
                <span>{module.duration}</span>
            </div>
        );
    };

    const renderQuizItem = (moduleIndex, itemIndex, item) => {
        const itemValidation = getItemValidation(moduleIndex, itemIndex);

        return (
            <div key={`quiz-${moduleIndex}-${itemIndex}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex-1 flex items-center gap-2">
                        <input
                            type="text"
                            value={item.question || ''}
                            onChange={(e) =>
                                handleItemFieldChange(moduleIndex, itemIndex, 'question', e.target.value)
                            }
                            placeholder="Quiz Question"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">ID:</span>
                                <input
                                    key={`quiz-id-${moduleIndex}-${itemIndex}`}
                                    type="text"
                                    value={item.itemId || ''}
                                    onChange={(e) => handleIdChange('item', moduleIndex, itemIndex, e.target.value)}
                                    onBlur={(e) => handleIdBlur('item', moduleIndex, itemIndex, e.target.value)}
                                    placeholder="item-xyz123"
                                    className={`text-xs w-28 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${itemValidation
                                            ? itemValidation.isValid
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-red-500 bg-red-50'
                                            : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {itemValidation && (
                                <span className={`text-xs mt-1 ${itemValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                    {itemValidation.message}
                                </span>
                            )}
                        </div>
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
                                name={`quiz-${moduleIndex}-${itemIndex}-${item.itemId}`}
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
    };

    const renderTextInstructionItem = (moduleIndex, itemIndex, item) => {
        const itemValidation = getItemValidation(moduleIndex, itemIndex);

        return (
            <div key={`text-${moduleIndex}-${itemIndex}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 flex-1">
                        <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) =>
                                handleItemFieldChange(moduleIndex, itemIndex, 'title', e.target.value)
                            }
                            placeholder="Instruction Title"
                            className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">ID:</span>
                                <input
                                    key={`text-id-${moduleIndex}-${itemIndex}`}
                                    type="text"
                                    value={item.itemId || ''}
                                    onChange={(e) => handleIdChange('item', moduleIndex, itemIndex, e.target.value)}
                                    onBlur={(e) => handleIdBlur('item', moduleIndex, itemIndex, e.target.value)}
                                    placeholder="item-xyz123"
                                    className={`text-xs w-28 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${itemValidation
                                            ? itemValidation.isValid
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-red-500 bg-red-50'
                                            : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {itemValidation && (
                                <span className={`text-xs mt-1 ${itemValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                    {itemValidation.message}
                                </span>
                            )}
                        </div>
                    </div>
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
    };

    const renderVideoItem = (moduleIndex, itemIndex, item) => {
        const itemValidation = getItemValidation(moduleIndex, itemIndex);
        const handleUpload = (fileData) => {
            handleVideoUploadComplete(moduleIndex, itemIndex, fileData);
        };

        return (
            <div key={`video-${moduleIndex}-${itemIndex}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 flex-1">
                        <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) =>
                                handleItemFieldChange(moduleIndex, itemIndex, 'title', e.target.value)
                            }
                            placeholder="Video Title"
                            className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">ID:</span>
                                <input
                                    key={`video-id-${moduleIndex}-${itemIndex}`}
                                    type="text"
                                    value={item.itemId || ''}
                                    onChange={(e) => handleIdChange('item', moduleIndex, itemIndex, e.target.value)}
                                    onBlur={(e) => handleIdBlur('item', moduleIndex, itemIndex, e.target.value)}
                                    placeholder="item-xyz123"
                                    className={`text-xs w-28 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${itemValidation
                                            ? itemValidation.isValid
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-red-500 bg-red-50'
                                            : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {itemValidation && (
                                <span className={`text-xs mt-1 ${itemValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                    {itemValidation.message}
                                </span>
                            )}
                        </div>
                    </div>
                    <select
                        value={item.status || 'private'}
                        onChange={(e) =>
                            handleItemFieldChange(moduleIndex, itemIndex, 'status', e.target.value)
                        }
                        disabled={item.url}
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
                            handleItemFieldChange(moduleIndex, itemIndex, 'duration', e.target.value);
                        }}
                        placeholder="Estimated duration in minutes"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                <div className="mb-3">
                    <CourseUploadBox
                        key={`upload-video-${moduleIndex}-${itemIndex}`}
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
                        disableStatusChange={!!item.url}
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
        const itemValidation = getItemValidation(moduleIndex, itemIndex);
        const handleUpload = (fileData) => {
            handleFileUploadComplete(moduleIndex, itemIndex, fileData);
        };

        return (
            <div key={`file-${moduleIndex}-${itemIndex}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 flex-1">
                        <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) =>
                                handleItemFieldChange(moduleIndex, itemIndex, 'title', e.target.value)
                            }
                            placeholder="File Title"
                            className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">ID:</span>
                                <input
                                    key={`file-id-${moduleIndex}-${itemIndex}`}
                                    type="text"
                                    value={item.itemId || ''}
                                    onChange={(e) => handleIdChange('item', moduleIndex, itemIndex, e.target.value)}
                                    onBlur={(e) => handleIdBlur('item', moduleIndex, itemIndex, e.target.value)}
                                    placeholder="item-xyz123"
                                    className={`text-xs w-28 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${itemValidation
                                            ? itemValidation.isValid
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-red-500 bg-red-50'
                                            : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {itemValidation && (
                                <span className={`text-xs mt-1 ${itemValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                    {itemValidation.message}
                                </span>
                            )}
                        </div>
                    </div>
                    <select
                        value={item.status || 'private'}
                        onChange={(e) =>
                            handleItemFieldChange(moduleIndex, itemIndex, 'status', e.target.value)
                        }
                        disabled={item.url}
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
                        key={`upload-file-${moduleIndex}-${itemIndex}`}
                        label="Upload File"
                        accept="application/pdf,image/*,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                        status={item.status || 'private'}
                        type="file"
                        onUpload={handleUpload}
                        itemId={item.itemId}
                        disableStatusChange={!!item.url}
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto p-4 bg-white shadow-lg rounded-xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Course: {course?.title || 'Untitled'}</h2>
                <p className="text-gray-600">Update the course details below</p>
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
                                key={`description-editor-${field.value?.substring(0, 20) || 'empty'}`}
                                onContentChange={field.onChange}
                                initialContent={field.value || ''}
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
                                defaultDate={field.value}
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
                        {modules.map((module, moduleIndex) => {
                            const moduleValidation = getModuleValidation(moduleIndex);

                            return (
                                <div key={`module-${moduleIndex}`} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium">
                                                    {module.order}
                                                </span>
                                                <div className="flex flex-col">
                                                    <input
                                                        type="text"
                                                        value={module.title}
                                                        onChange={(e) => handleModuleFieldChange(moduleIndex, 'title', e.target.value)}
                                                        placeholder="Module Title"
                                                        className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                                                    />
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500">ID:</span>
                                                        <input
                                                            key={`module-id-${moduleIndex}`}
                                                            type="text"
                                                            value={module.moduleId || ''}
                                                            onChange={(e) => handleIdChange('module', moduleIndex, null, e.target.value)}
                                                            onBlur={(e) => handleIdBlur('module', moduleIndex, null, e.target.value)}
                                                            placeholder="module-xyz123"
                                                            className={`text-xs w-32 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${moduleValidation
                                                                    ? moduleValidation.isValid
                                                                        ? 'border-green-500 bg-green-50'
                                                                        : 'border-red-500 bg-red-50'
                                                                    : 'border-gray-300'
                                                                }`}
                                                        />
                                                        {moduleValidation && (
                                                            <span className={`text-xs ${moduleValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                                                {moduleValidation.message}
                                                            </span>
                                                        )}
                                                    </div>
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
                                                    <div key={`item-${moduleIndex}-${itemIndex}`} className="relative">
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
                            );
                        })}
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
                                if (course) {
                                    reset(course);
                                    setModules(course.modules || []);
                                    setCoverPhotoUrl(course.coverPhotoUrl || '');
                                    setInstructorImage(course.instructorImage || '');
                                    setLearningItems(course.learningItems || [{ text: '' }]);
                                    setAdditionalMaterials(course.additionalMaterials || [{ text: '' }]);
                                    setCourseIncludes(course.courseIncludes || [{ text: '' }]);
                                    setIdValidation({ moduleIds: {}, itemIds: {} });
                                }
                                toast.success("Changes reverted to original course data.");
                            }}
                            className="text-red-600 hover:text-red-800 mt-1"
                        >
                            Discard all changes
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
                                'Update Course'
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

export default EditCourse;