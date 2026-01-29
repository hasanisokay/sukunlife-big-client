'use client'
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import "plyr/dist/plyr.css";
import { SERVER } from '@/constants/urls.mjs';
import BlogContent from '@/components/blogs/BlogContnet';
import Spinner2 from '@/components/loaders/Spinner2';

import VideoHLS from '../dashboard/user/VideoHLS';
import {   ClipboardSVG,
  DownArrowSVG,
  LeftArrowSVG,
  QuizSVG,
  RightArrowSVG,
  VideoSVG,
  FileSVG,
  TextSVG,
  CheckCircleSVG, } from '../svg/AdditionalSVGS';
import {   markItemComplete, 
  updateVideoTime, 
  submitQuizResult, 
  setCurrentItem } from '@/server-functions/course-related/updateCourseProgress.mjs';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const CoursePlayer = ({ 
  course: initialCourse, 
  progress: initialProgress,
  initialModuleIndex = 0,
  initialItemIndex = 0 
}) => {
  const router = useRouter();
  const videoRef = useRef(null);
  const [hlsUrl, setHlsUrl] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(initialModuleIndex);
  const [activeItemIndex, setActiveItemIndex] = useState(initialItemIndex);
  const [userProgress, setUserProgress] = useState(initialProgress || {});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [expandedModule, setExpandedModule] = useState(initialModuleIndex);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoTimeInterval, setVideoTimeInterval] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [courseData, setCourseData] = useState(initialCourse);

  // Debug logging
  useEffect(() => {
    console.log('CoursePlayer Props:', {
      course: initialCourse,
      progress: initialProgress,
      initialModuleIndex,
      initialItemIndex
    });
  }, []);

  // Initialize from progress
  useEffect(() => {
    if (initialProgress?.currentItem) {
      // Find module and item index based on currentItem from progress
      let moduleIdx = 0;
      let itemIdx = 0;
      let found = false;
      
      initialCourse.modules.forEach((module, mIdx) => {
        module.items.forEach((item, iIdx) => {
          if (item.itemId === initialProgress.currentItem) {
            moduleIdx = mIdx;
            itemIdx = iIdx;
            found = true;
          }
        });
      });
      
      if (found) {
        setActiveModuleIndex(moduleIdx);
        setActiveItemIndex(itemIdx);
        setExpandedModule(moduleIdx);
      }
    } else {
      setExpandedModule(initialModuleIndex);
    }
  }, [initialCourse.modules, initialProgress, initialModuleIndex]);

  const currentModule = courseData.modules[activeModuleIndex];
  const currentItem = currentModule?.items[activeItemIndex];

  // Calculate overall progress
  const totalItems = courseData.modules.reduce((acc, module) => acc + module.items.length, 0);
  const completedCount = userProgress.completedItems?.length || 0;
  const overallProgress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  // Load video stream URL
  useEffect(() => {
    if (!currentItem || currentItem.type !== "video") {
      setHlsUrl(null);
      return;
    }

    // Get original course data to access video URLs
    const loadOriginalVideoData = async () => {
      try {
        const res = await fetch(
          `${SERVER}/api/public/course/${initialProgress.courseId}`,
          { credentials: "include" }
        );
        const courseDetails = await res.json();
        if (courseDetails.status===200) {
          // Find the video URL in original course data
          let videoUrl = null;
          courseDetails?.course?.modules?.forEach(module => {
            module.items.forEach(item => {
              if (item.itemId === currentItem.itemId && item.url?.filename) {
                videoUrl = item.url.filename;
              }
            });
          });
          
          if (videoUrl) {
            const streamRes = await fetch(
              `${SERVER}/api/user/course/stream-url/${initialProgress.courseId}/${videoUrl}`,
              { credentials: "include" }
            );
            const streamData = await streamRes.json();
            console.log(streamData)
            if (streamData.url) {
                setHlsUrl(streamData.url);
            }
          }
        }
      } catch (err) {
        console.error("Stream load failed", err);
      }
    };

    loadOriginalVideoData();
  }, [currentItem?.itemId, currentItem?.type, initialProgress.courseId]);

  // Save progress when item changes
  const saveItemProgress = useCallback(async (itemId, moduleId, markComplete = false) => {
    try {
      if (markComplete) {
        await markItemComplete(initialProgress.courseId, itemId, moduleId);
      }
      
      await setCurrentItem(initialProgress.courseId, itemId);
      
      // Update local state
      setUserProgress(prev => ({
        ...prev,
        currentItem: itemId,
        completedItems: markComplete 
          ? [...(prev.completedItems || []), itemId]
          : prev.completedItems
      }));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [initialProgress.courseId]);

  // Handle video time tracking
  const startVideoTimeTracking = useCallback(() => {
    if (videoTimeInterval) clearInterval(videoTimeInterval);
    
    const interval = setInterval(async () => {
      if (videoRef.current && currentItem?.type === 'video') {
        const video = videoRef.current;
        const currentTime = Math.floor(video.currentTime);
        const duration = Math.floor(video.duration);
        
        if (duration > 0) {
          const percentage = Math.round((currentTime / duration) * 100);
          
          // Save every 10 seconds or when 95%+ watched
          if (currentTime % 10 === 0 || percentage >= 95) {
            await updateVideoTime(initialProgress.courseId, currentItem.itemId, {
              currentTime,
              duration,
              percentage
            });
            
            // Update local progress state
            setUserProgress(prev => ({
              ...prev,
              videoProgress: {
                ...prev.videoProgress,
                [currentItem.itemId]: {
                  currentTime,
                  duration,
                  percentage,
                  lastWatched: new Date()
                }
              }
            }));
            
            // Auto-mark as complete if watched 95%+
            if (percentage >= 95 && !userProgress.completedItems?.includes(currentItem.itemId)) {
              await markItemComplete(initialProgress.courseId, currentItem.itemId, currentModule.moduleId);
              setUserProgress(prev => ({
                ...prev,
                completedItems: [...(prev.completedItems || []), currentItem.itemId]
              }));
            }
          }
        }
      }
    }, 10000); // Check every 10 seconds
    
    setVideoTimeInterval(interval);
    return () => clearInterval(interval);
  }, [initialProgress.courseId, currentItem, currentModule?.moduleId, userProgress.completedItems]);

  // Navigate to item
  const navigateToItem = useCallback(async (moduleIdx, itemIdx) => {
    const targetModule = courseData.modules[moduleIdx];
    const targetItem = targetModule.items[itemIdx];
    
    setActiveModuleIndex(moduleIdx);
    setActiveItemIndex(itemIdx);
    setExpandedModule(moduleIdx);
    setCurrentQuizIndex(0);
    setQuizCompleted(false);
    setSelectedAnswers({});
    
    // Save current item
    await saveItemProgress(targetItem.itemId, targetModule.moduleId);
    
    // Start video tracking if it's a video
    if (targetItem.type === 'video') {
      setTimeout(startVideoTimeTracking, 1000);
    }
  }, [courseData.modules, saveItemProgress, startVideoTimeTracking]);

  // Handle quiz submission
  const handleQuizSubmit = useCallback(async () => {
    if (!currentItem || currentItem.type !== 'quiz') return;
    
    const userAnswer = selectedAnswers[currentQuizIndex];
    const isCorrect = userAnswer === currentItem.answer;
    
    try {
      await submitQuizResult(initialProgress.courseId, currentItem.itemId, {
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        passed: isCorrect
      });
      
      if (isCorrect) {
        await markItemComplete(initialProgress.courseId, currentItem.itemId, currentModule.moduleId);
        setUserProgress(prev => ({
          ...prev,
          completedItems: [...(prev.completedItems || []), currentItem.itemId]
        }));
      }
      
      return isCorrect;
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      return false;
    }
  }, [initialProgress.courseId, currentItem, currentModule?.moduleId, currentQuizIndex, selectedAnswers]);

  // Render item content based on type
  const renderItemContent = () => {
    if (!currentItem) return null;

    // Get enriched item data from progress
    const enrichedItem = currentModule.items.find(item => item.itemId === currentItem.itemId) || currentItem;

    switch (enrichedItem.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <VideoHLS
                src={hlsUrl} 
                ref={videoRef}
                onPlay={startVideoTimeTracking}
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-xl font-bold mb-2">{enrichedItem.title || 'Video Lesson'}</h3>
              {enrichedItem.description && (
                <p className="text-gray-600 dark:text-gray-300">{enrichedItem.description}</p>
              )}
            </div>
          </div>
        );

      case 'textInstruction':
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">{enrichedItem.title}</h2>
              <div className="prose dark:prose-invert max-w-none">
                <BlogContent content={enrichedItem.content || ''} />
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={async () => {
                  await markItemComplete(initialProgress.courseId, enrichedItem.itemId, currentModule.moduleId);
                  setUserProgress(prev => ({
                    ...prev,
                    completedItems: [...(prev.completedItems || []), enrichedItem.itemId]
                  }));
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={userProgress.completedItems?.includes(enrichedItem.itemId)}
              >
                {userProgress.completedItems?.includes(enrichedItem.itemId) 
                  ? '✓ Marked as Complete' 
                  : 'Mark as Complete'}
              </button>
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <FileSVG className="w-8 h-8 mr-3 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold">{enrichedItem.title}</h2>
                  {enrichedItem.description && (
                    <p className="text-gray-600 dark:text-gray-300">{enrichedItem.description}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <a
                  href={`${SERVER}/api/user/course/file/${initialProgress.courseId}/${enrichedItem.url?.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  download
                >
                  <FileSVG className="w-5 h-5 mr-2" />
                  Download File
                </a>
                
                {enrichedItem.url?.mime === 'application/pdf' && (
                  <div className="mt-4">
                    <iframe
                      src={`${SERVER}/api/user/course/file/${initialProgress.courseId}/${enrichedItem.url?.filename}`}
                      className="w-full h-[500px] rounded-lg"
                      title={enrichedItem.title}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={async () => {
                  await markItemComplete(initialProgress.courseId, enrichedItem.itemId, currentModule.moduleId);
                  setUserProgress(prev => ({
                    ...prev,
                    completedItems: [...(prev.completedItems || []), enrichedItem.itemId]
                  }));
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={userProgress.completedItems?.includes(enrichedItem.itemId)}
              >
                {userProgress.completedItems?.includes(enrichedItem.itemId) 
                  ? '✓ Marked as Complete' 
                  : 'Mark as Complete'}
              </button>
            </div>
          </div>
        );

      case 'quiz':
        return renderQuizContent(enrichedItem);

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Content type not supported</p>
          </div>
        );
    }
  };

  // Render quiz content
  const renderQuizContent = (quizItem) => {
    if (!quizItem || quizItem.type !== 'quiz') return null;

    if (quizCompleted) {
      const isCorrect = selectedAnswers[currentQuizIndex] === quizItem.answer;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className={`text-center p-6 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}`}>
            <h3 className="text-2xl font-bold mb-4">
              {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
            </h3>
            <p className="mb-4 text-lg">{quizItem.question}</p>
            <div className="space-y-2">
              <p className="font-medium">Your answer: {quizItem.options[selectedAnswers[currentQuizIndex]]}</p>
              {!isCorrect && (
                <p className="font-medium text-green-600 dark:text-green-400">
                  Correct answer: {quizItem.options[quizItem.answer]}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => {
                setQuizCompleted(false);
                setCurrentQuizIndex(0);
                setSelectedAnswers({});
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={async () => {
                if (activeItemIndex < currentModule.items.length - 1) {
                  await navigateToItem(activeModuleIndex, activeItemIndex + 1);
                } else if (activeModuleIndex < courseData.modules.length - 1) {
                  await navigateToItem(activeModuleIndex + 1, 0);
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              Next Lesson <RightArrowSVG className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Quiz</h3>
            <span className="text-sm text-gray-500">Question 1 of 1</span>
          </div>
          <p className="text-lg mb-6">{quizItem.question}</p>
        </div>
        
        <div className="space-y-3">
          {quizItem.options?.map((option, idx) => (
            <button
              key={idx}
              onClick={async () => {
                setSelectedAnswers({ [currentQuizIndex]: idx });
                const isCorrect = idx === quizItem.answer;
                
                await handleQuizSubmit();
                setQuizCompleted(true);
              }}
              className={`w-full p-4 rounded-lg text-left transition-colors ${
                selectedAnswers[currentQuizIndex] === idx
                  ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Get item icon
  const getItemIcon = (type, isCompleted = false) => {
    const iconProps = { className: "w-5 h-5 mr-2" };
    
    if (isCompleted) {
      return <CheckCircleSVG {...iconProps} className={`${iconProps.className} text-green-500`} />;
    }
    
    switch (type) {
      case 'video':
        return <VideoSVG {...iconProps} />;
      case 'quiz':
        return <QuizSVG {...iconProps} />;
      case 'file':
        return <FileSVG {...iconProps} />;
      case 'textInstruction':
        return <TextSVG {...iconProps} />;
      default:
        return <ClipboardSVG {...iconProps} />;
    }
  };

  // Check if item is completed
  const isItemCompleted = (itemId) => {
    return userProgress.completedItems?.includes(itemId) || false;
  };

  // Check if module is completed
  const isModuleCompleted = (moduleId) => {
    const module = courseData.modules.find(m => m.moduleId === moduleId);
    if (!module) return false;
    
    return module.items.every(item => 
      userProgress.completedItems?.includes(item.itemId)
    );
  };

  // Get video progress percentage
  const getVideoProgress = (itemId) => {
    return userProgress.videoProgress?.[itemId]?.percentage || 0;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    return () => {
      if (videoTimeInterval) clearInterval(videoTimeInterval);
    };
  }, [videoTimeInterval]);

  if (!isClient || !currentItem) return <Spinner2 />;

  console.log('Current render state:', {
    activeModuleIndex,
    activeItemIndex,
    currentItem,
    currentModule,
    userProgress
  });

  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto py-4 px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <LeftArrowSVG className="w-5 h-5 mr-2" />
            Back to Courses
          </button>
          
          <h1 className="text-2xl font-bold mb-2">{courseData.title}</h1>
          <p className="text-gray-600 dark:text-gray-300">{courseData.shortDescription}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Course Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {completedCount} of {totalItems} items
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mt-1 text-right">
            <span className="text-lg font-bold">{overallProgress}%</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeModuleIndex}-${activeItemIndex}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={itemVariants}
                className="space-y-6"
              >
                {/* Item Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Module {activeModuleIndex + 1}</span>
                    <h2 className="text-xl font-bold">{currentItem.title || `Lesson ${activeItemIndex + 1}`}</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    {isItemCompleted(currentItem.itemId) && (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircleSVG className="w-5 h-5 mr-1" />
                        Completed
                      </span>
                    )}
                    <span className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {currentItem.type}
                    </span>
                  </div>
                </div>

                {/* Item Content */}
                {renderItemContent()}

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={async () => {
                      if (activeItemIndex > 0) {
                        await navigateToItem(activeModuleIndex, activeItemIndex - 1);
                      } else if (activeModuleIndex > 0) {
                        const prevModule = courseData.modules[activeModuleIndex - 1];
                        await navigateToItem(activeModuleIndex - 1, prevModule.items.length - 1);
                      }
                    }}
                    disabled={activeModuleIndex === 0 && activeItemIndex === 0}
                    className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <LeftArrowSVG className="w-4 h-4 mr-2" />
                    Previous
                  </button>

                  <button
                    onClick={async () => {
                      if (activeItemIndex < currentModule.items.length - 1) {
                        await navigateToItem(activeModuleIndex, activeItemIndex + 1);
                      } else if (activeModuleIndex < courseData.modules.length - 1) {
                        await navigateToItem(activeModuleIndex + 1, 0);
                      }
                    }}
                    disabled={activeModuleIndex === courseData.modules.length - 1 && 
                             activeItemIndex === currentModule.items.length - 1}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next Lesson
                    <RightArrowSVG className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar - Modules & Items */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-bold text-lg">Course Content</h3>
                <div className="text-sm text-gray-500 mt-1">
                  {totalItems} lessons • {overallProgress}% complete
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {courseData.modules.map((module, moduleIdx) => (
                  <div key={module.moduleId} className="border-b dark:border-gray-700 last:border-b-0">
                    <button
                      onClick={() => setExpandedModule(expandedModule === moduleIdx ? null : moduleIdx)}
                      className={`w-full px-4 py-3 flex justify-between items-center transition-colors ${
                        activeModuleIndex === moduleIdx
                          ? 'bg-blue-50 dark:bg-blue-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                    >
                      <div className="flex items-center">
                        {isModuleCompleted(module.moduleId) ? (
                          <CheckCircleSVG className="w-5 h-5 mr-2 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 mr-2 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                            <span className="text-xs">{moduleIdx + 1}</span>
                          </div>
                        )}
                        <span className="font-medium text-left">{module.title}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-3">
                          {module.items.length} lessons
                        </span>
                        <DownArrowSVG 
                          className={`w-4 h-4 transition-transform ${
                            expandedModule === moduleIdx ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {expandedModule === moduleIdx && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50 dark:bg-gray-900"
                        >
                          {module.items.map((item, itemIdx) => {
                            const isCompleted = isItemCompleted(item.itemId);
                            const isActive = activeModuleIndex === moduleIdx && activeItemIndex === itemIdx;
                            const videoProgress = getVideoProgress(item.itemId);
                            
                            return (
                              <button
                                key={item.itemId}
                                onClick={() => navigateToItem(moduleIdx, itemIdx)}
                                className={`w-full px-4 py-3 flex items-center text-left transition-colors ${
                                  isActive
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                              >
                                <div className="flex items-center flex-1">
                                  {getItemIcon(item.type, isCompleted)}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                      <span className={`font-medium truncate ${
                                        isCompleted ? 'text-green-600 dark:text-green-400' : ''
                                      }`}>
                                        {item.title || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${itemIdx + 1}`}
                                      </span>
                                      {isActive && (
                                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                          Now Playing
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {item.type}
                                    </div>
                                  </div>
                                </div>
                                
                                {item.type === 'video' && videoProgress > 0 && (
                                  <div className="text-xs text-gray-500 ml-2">
                                    {videoProgress}%
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
              
              {/* Progress Summary */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-t dark:border-gray-700">
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Overall Progress</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {overallProgress}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {completedCount} of {totalItems} lessons completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;