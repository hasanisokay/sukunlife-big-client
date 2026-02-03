"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVER } from '@/constants/urls.mjs';
import BlogContent from '@/components/blogs/BlogContnet';

import {
  ClipboardSVG,
  DownArrowSVG,
  LeftArrowSVG,
  QuizSVG,
  RightArrowSVG,
  VideoSVG,
  FileSVG,
  TextSVG,
  CheckCircleSVG,
  LockClosedSVG
} from '../svg/AdditionalSVGS';
import { getFileToken, getStreamData, updateCourseProgress } from '@/server-functions/course-related/updateCourseProgress.mjs';
import VideoHLS from '../dashboard/user/VideoHLS';

const CourseLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-6 relative">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-primary border-l-primary animate-spin animation-delay-500"></div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
        Loading course content...
      </p>
    </div>
  </div>
);

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Helper functions for progress checking
const isItemViewed = (progress, moduleId, itemId) => {
  if (!progress || !progress.viewed) return false;

  const moduleProgress = progress.viewed.find(m => m.moduleId === moduleId);
  if (!moduleProgress) return false;

  const itemProgress = moduleProgress.items.find(i => i.itemId === itemId);
  return itemProgress !== undefined;
};

const getItemProgress = (progress, moduleId, itemId) => {
  if (!progress || !progress.viewed) return 0;

  const moduleProgress = progress.viewed.find(m => m.moduleId === moduleId);
  if (!moduleProgress) return 0;

  const itemProgress = moduleProgress.items.find(i => i.itemId === itemId);
  return itemProgress ? itemProgress.progress : 0;
};

const CoursePlayer = ({
  course,
  progress,
  currentModuleId,
  currentItemId
}) => {
  const router = useRouter();
  const [hlsUrl, setHlsUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileData, setFileData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState({});
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [videoProgressTime, setVideoProgressTime] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [retakeMode, setRetakeMode] = useState({});

  // Refs for cleanup and optimization
  const navigationTimeoutRef = useRef(null);
  const progressInitializedRef = useRef(new Set());
  const fileSavedRef = useRef(new Set());
  const lastProgressSaveRef = useRef(0);
  const saveInProgressRef = useRef(false);
  const hasNavigatedToNextRef = useRef(false);

  // Extract data
  const courseData = course;
  const userProgress = progress || {};

  // Find current module and item
  const currentModule = courseData?.modules?.find(m => m?.moduleId === currentModuleId);
  const currentItem = currentModule?.items?.find(i => i.itemId === currentItemId);

  // Memoized progress calculation
  const { totalItems, completedCount, overallProgress } = useMemo(() => {
    const total = courseData.modules?.reduce((acc, module) =>
      acc + (module.items?.length || 0), 0) || 0;

    const completed = userProgress?.viewed?.reduce((acc, module) =>
      acc + module.items.filter(item => item.progress === 100).length, 0) || 0;

    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalItems: total,
      completedCount: completed,
      overallProgress: progressPercent
    };
  }, [courseData.modules, userProgress?.viewed]);

  // Centralized accessibility checker
  const getItemAccessibility = useCallback((itemId, moduleId) => {
    if (!itemId || !moduleId) {
      return { accessible: false, reason: 'invalid-params' };
    }

    // If already viewed, it's accessible
    if (isItemViewed(userProgress, moduleId, itemId)) {
      return { accessible: true, reason: 'viewed' };
    }

    const moduleIndex = courseData.modules.findIndex(m => m.moduleId === moduleId);
    if (moduleIndex === -1) {
      return { accessible: false, reason: 'module-not-found' };
    }

    const module = courseData.modules[moduleIndex];
    const itemIndex = module.items.findIndex(i => i.itemId === itemId);
    if (itemIndex === -1) {
      return { accessible: false, reason: 'item-not-found' };
    }

    // First item of first module - always accessible
    if (moduleIndex === 0 && itemIndex === 0) {
      return { accessible: true, reason: 'first-item' };
    }

    // Check previous item in same module
    if (itemIndex > 0) {
      const previousItem = module.items[itemIndex - 1];
      const accessible = isItemViewed(userProgress, moduleId, previousItem.itemId);
      return {
        accessible,
        reason: accessible ? 'previous-complete' : 'previous-incomplete',
        previousItem: accessible ? null : previousItem
      };
    }

    // Check last item of previous module
    if (moduleIndex > 0) {
      const previousModule = courseData.modules[moduleIndex - 1];
      if (previousModule.items.length > 0) {
        const lastItem = previousModule.items[previousModule.items.length - 1];
        const accessible = isItemViewed(userProgress, previousModule.moduleId, lastItem.itemId);
        return {
          accessible,
          reason: accessible ? 'previous-module-complete' : 'previous-module-incomplete',
          previousItem: accessible ? null : { ...lastItem, moduleId: previousModule.moduleId }
        };
      }
    }

    return { accessible: false, reason: 'default-locked' };
  }, [userProgress, courseData.modules]);

  // Optimized save progress with debouncing and deduplication
  const saveProgress = useCallback(async (action, payload = {}) => {
    // Check if item is already at 100% progress
    const currentProgress = getItemProgress(userProgress, currentModuleId, currentItemId);
    
    // Allow saving for quiz retakes
    const isQuizRetake = action === "QUIZ_SUBMIT" && payload.isRetake === true;
    
    // Only block saves if already at 100% AND not a quiz retake
    if (currentProgress === 100 && !isQuizRetake) {
      console.log('Item already completed (100%), skipping save');
      return;
    }

    // Prevent duplicate saves within 1 second
    const now = Date.now();
    const timeSinceLastSave = now - lastProgressSaveRef.current;

    if (saveInProgressRef.current || timeSinceLastSave < 1000) {
      return;
    }

    try {
      saveInProgressRef.current = true;
      lastProgressSaveRef.current = now;

      const res = await updateCourseProgress(
        userProgress.courseId,
        currentModuleId,
        currentItemId,
        payload,
        action
      );

      console.log('Progress saved:', res);
      return res;
    } catch (err) {
      console.error("Progress save failed:", err);
      throw err;
    } finally {
      saveInProgressRef.current = false;
    }
  }, [userProgress, currentModuleId, currentItemId]);

  // Memoized navigation items
  const getNavigationItems = useCallback(() => {
    if (!currentItemId) return { previous: null, next: null };

    let found = false;
    let previousItem = null;
    let nextItem = null;

    for (let mIdx = 0; mIdx < courseData.modules.length; mIdx++) {
      const module = courseData.modules[mIdx];
      for (let iIdx = 0; iIdx < module.items.length; iIdx++) {
        if (module.moduleId === currentModuleId && module.items[iIdx].itemId === currentItemId) {
          found = true;

          // Previous item
          if (iIdx > 0) {
            previousItem = {
              ...module.items[iIdx - 1],
              moduleId: module.moduleId
            };
          } else if (mIdx > 0) {
            const prevModule = courseData.modules[mIdx - 1];
            previousItem = {
              ...prevModule.items[prevModule.items.length - 1],
              moduleId: prevModule.moduleId
            };
          }

          // Next item
          if (iIdx < module.items.length - 1) {
            nextItem = {
              ...module.items[iIdx + 1],
              moduleId: module.moduleId
            };
          } else if (mIdx < courseData.modules.length - 1) {
            const nextModule = courseData.modules[mIdx + 1];
            if (nextModule.items.length > 0) {
              nextItem = {
                ...nextModule.items[0],
                moduleId: nextModule.moduleId
              };
            }
          }

          break;
        }
      }
      if (found) break;
    }

    return { previous: previousItem, next: nextItem };
  }, [currentItemId, currentModuleId, courseData.modules]);


  // Check if current item is unlocked on first load
  useEffect(() => {
    if (!currentItemId || !currentModuleId || !courseData.modules || isInitialized) {
      return;
    }

    const checkUnlockStatus = () => {
      const accessibility = getItemAccessibility(currentItemId, currentModuleId);
      setIsUnlocked(accessibility.accessible);
      setIsInitialized(true);

      // Initialize progress for newly accessible items
      if (accessibility.accessible && currentItem) {
        const progressKey = `${currentModuleId}-${currentItemId}`;

        if (!progressInitializedRef.current.has(progressKey)) {
          progressInitializedRef.current.add(progressKey);

          // AUTO-COMPLETE TEXT INSTRUCTIONS AND FILES ON FIRST LOAD
          if (["textInstruction", "file"].includes(currentItem.type)) {
            // Check if already completed
            const currentProgress = getItemProgress(userProgress, currentModuleId, currentItemId);
            const wasAlreadyCompleted = currentProgress === 100;

            // Only mark complete if not already completed
            if (!wasAlreadyCompleted) {
              console.log(`Auto-completing ${currentItem.type} on first load`);
              saveProgress("MARK_COMPLETE");
            }
          } else if (currentItem.type === "video") {
            saveProgress("VIDEO_PROGRESS", { progress: 0 });
          }
        }
      }
    };

    checkUnlockStatus();
  }, [currentItemId, currentModuleId, userProgress, courseData.modules, isInitialized, getItemAccessibility, currentItem, saveProgress]);

  // Handle video ended with proper cleanup
  const handleVideoEnded = useCallback(async () => {
    if (currentItem?.type !== 'video') return;

    // Check if this video was already completed before
    const currentProgress = getItemProgress(userProgress, currentModuleId, currentItemId);
    const wasAlreadyCompleted = currentProgress === 100;

    // Only save progress if not already at 100%
    if (!wasAlreadyCompleted) {
      await saveProgress("VIDEO_PROGRESS", { progress: 100 });
      await saveProgress("MARK_COMPLETE");
    }

    // Only auto-navigate if this is the first time completing the video
    // This allows users to replay completed videos without auto-navigation
    if (!wasAlreadyCompleted && !hasNavigatedToNextRef.current) {
      hasNavigatedToNextRef.current = true;

      const { next: nextItem } = getNavigationItems();
      if (nextItem) {
        // Clear any existing timeout
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }

        navigationTimeoutRef.current = setTimeout(() => {
          router.push(`/courses/${userProgress?.courseId}/${nextItem.moduleId}/${nextItem.itemId}`);
        }, 1500);
      }
    }
  }, [currentItem, saveProgress, userProgress, currentModuleId, currentItemId, getNavigationItems, router]);

  // Reset navigation flag when item changes
  useEffect(() => {
    hasNavigatedToNextRef.current = false;
  }, [currentItemId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Initialize expanded modules with current module
  useEffect(() => {
    if (currentModuleId) {
      setExpandedModules(prev => new Set([...prev, currentModuleId]));
    }
  }, [currentModuleId]);


  const { previous: previousItem, next: nextItem } = useMemo(() =>
    getNavigationItems(),
    [getNavigationItems]
  );

  // Load video stream on first load
  useEffect(() => {
    if (!currentItem || currentItem.type !== "video" || !isUnlocked) {
      setHlsUrl(null);
      setLoading(false);
      return;
    }

    // Get video progress from userProgress
    const savedProgress = getItemProgress(userProgress, currentModuleId, currentItemId);
    setVideoProgressTime(savedProgress === 100 ? 0 : savedProgress);

    const loadVideoStream = async () => {
      try {
        if (currentItem.url?.filename) {
          const streamData = await getStreamData(userProgress?.courseId, currentItem?.url?.filename);

          if (streamData?.url) {
            setHlsUrl(streamData?.url);
          }
        }
      } catch (err) {
        console.error("Stream load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVideoStream();
  }, [currentItem, userProgress, currentModuleId, currentItemId, isUnlocked]);

  // Load file data on first load
  useEffect(() => {
    if (!currentItem || currentItem.type !== 'file' || !isUnlocked) {
      setFileData(null);
      setLoading(false);
      return;
    }

    const loadFileData = async () => {
      try {
        if (currentItem.url?.filename) {
          let token = null;

          if (currentItem.status !== 'public') {
            token = await getFileToken(userProgress?.courseId, currentItem?.url?.filename);
          }

          let fileUrl = `${SERVER}/api/user/course/file/${userProgress?.courseId}/${currentItem?.url?.filename}`;
          if (token) {
            fileUrl += `?token=${token}`;
          }

          setFileData({
            filename: currentItem?.url?.filename,
            mime: currentItem?.url?.mime,
            inline: currentItem?.inline || false,
            url: fileUrl
          });
        }
      } catch (err) {
        console.error("File load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFileData();
  }, [currentItem, userProgress, isUnlocked]);

  // Reset loading state for non-media items
  useEffect(() => {
    if (currentItem?.type && !['video', 'file'].includes(currentItem.type) && isUnlocked) {
      setLoading(false);
    }
  }, [currentItem, isUnlocked]);

  // Save file progress (with deduplication)
  useEffect(() => {
    const fileKey = `${currentModuleId}-${currentItemId}`;

    if (currentItem?.type === "file" && fileData?.url && isUnlocked) {
      if (!fileSavedRef.current.has(fileKey)) {
        fileSavedRef.current.add(fileKey);
        saveProgress("MARK_COMPLETE");
      }
    }
  }, [fileData, isUnlocked, currentItem, currentModuleId, currentItemId, saveProgress]);

  // Load quiz data when item changes
  useEffect(() => {
    if (currentItem?.type === 'quiz' && isUnlocked) {
      const quizProgress = getItemProgress(userProgress, currentModuleId, currentItemId);
      
      console.log('Quiz progress:', quizProgress);
      
      // Check if quiz is completed (100% progress)
      if (quizProgress === 100) {
        console.log('Quiz is completed, loading previous data');
        // Load previous data from progress
        const moduleProgress = userProgress?.viewed?.find(m => m.moduleId === currentModuleId);
        if (moduleProgress) {
          const itemProgress = moduleProgress.items.find(i => i.itemId === currentItemId);
          if (itemProgress?.data?.selected !== undefined) {
            console.log('Found previous quiz data:', itemProgress.data);
            setQuizAnswers(prev => ({ 
              ...prev, 
              [currentItemId]: itemProgress.data.selected 
            }));
          }
        }
        setQuizCompleted(prev => ({ ...prev, [currentItemId]: true }));
        
        // Check if we're in retake mode
        if (retakeMode[currentItemId]) {
          console.log('In retake mode, resetting quiz');
          setQuizCompleted(prev => ({ ...prev, [currentItemId]: false }));
          setQuizAnswers(prev => ({ ...prev, [currentItemId]: undefined }));
        }
      } else {
        console.log('Quiz not completed yet');
        setQuizCompleted(prev => ({ ...prev, [currentItemId]: false }));
      }
    }
  }, [currentItemId, currentItem?.type, isUnlocked, userProgress, currentModuleId, retakeMode]);

  // Reset retake mode when leaving quiz
  useEffect(() => {
    return () => {
      // Clean up retake mode when component unmounts or item changes
      setRetakeMode({});
    };
  }, [currentItemId]);

  // Toggle module expansion
  const toggleModule = useCallback((moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  }, []);

  // Get item icon
  const getItemIcon = useCallback((item) => {
    const iconProps = { className: "w-5 h-5" };

    switch (item.type) {
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
  }, []);

  const handleQuizSubmit = useCallback(async (selectedOption) => {
    if (!currentItem || currentItem.type !== "quiz" || !isUnlocked) return;

    console.log('Submitting quiz answer:', selectedOption);
    
    const isCorrect = selectedOption === currentItem.answer;
    const isRetake = retakeMode[currentItemId] || false;

    console.log('Is retake mode?', isRetake);

    try {
      // Save quiz submission data
      await saveProgress("QUIZ_SUBMIT", {
        selected: selectedOption,
        correct: isCorrect,
        isRetake: isRetake
      });
      
      // Mark as complete
      await saveProgress("MARK_COMPLETE");

      console.log('Quiz submitted successfully');
      
      // Update local state
      setQuizAnswers(prev => ({ ...prev, [currentItemId]: selectedOption }));
      setQuizCompleted(prev => ({ ...prev, [currentItemId]: true }));
      
      // Exit retake mode if we were in it
      if (isRetake) {
        console.log('Exiting retake mode');
        setRetakeMode(prev => ({ ...prev, [currentItemId]: false }));
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  }, [currentItem, isUnlocked, currentItemId, saveProgress, retakeMode]);

  // Handle retake quiz
  const handleRetakeQuiz = useCallback(async () => {
    if (!currentItem || currentItem.type !== "quiz") return;
    
    console.log('Starting quiz retake for:', currentItemId);
    
    try {
      // Enter retake mode
      setRetakeMode(prev => ({ ...prev, [currentItemId]: true }));
      
      // Reset local state immediately
      setQuizAnswers(prev => ({ ...prev, [currentItemId]: undefined }));
      setQuizCompleted(prev => ({ ...prev, [currentItemId]: false }));
      
      console.log('Retake mode activated, local state reset');
      
      // Reset progress to 0 to allow saving new attempt
      try {
        await updateCourseProgress(
          userProgress.courseId,
          currentModuleId,
          currentItemId,
          { progress: 0 },
          "RESET_QUIZ"
        );
        console.log('Quiz progress reset in database');
      } catch (err) {
        console.error("Failed to reset quiz progress in database:", err);
        // Continue anyway - local state is reset
      }
    } catch (err) {
      console.error('Error in handleRetakeQuiz:', err);
    }
  }, [currentItem, currentItemId, userProgress, currentModuleId]);

  // Render locked content
  const renderLockedContent = useCallback(() => {
    const accessibility = getItemAccessibility(currentItemId, currentModuleId);

    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <LockClosedSVG className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
          Content Locked
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          Complete the previous lesson to unlock this content.
        </p>
        {accessibility.previousItem && (
          <Link
            href={`/courses/${userProgress?.courseId}/${accessibility.previousItem.moduleId}/${accessibility.previousItem.itemId}`}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-black font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
          >
            <LeftArrowSVG className="w-4 h-4 mr-2" />
            Go to Previous Lesson
          </Link>
        )}
      </div>
    );
  }, [currentItemId, currentModuleId, getItemAccessibility, userProgress?.courseId]);

  // Render content based on type
  const renderContent = useCallback(() => {
    if (loading || !isInitialized) return <CourseLoader />;
    if (!currentItem) return <div className="text-center py-12">Content not found</div>;

    if (!isUnlocked) {
      return renderLockedContent();
    }

    const isCompleted = getItemProgress(userProgress, currentModuleId, currentItemId) === 100;

    switch (currentItem.type) {
      case 'video':
        return (
          <div className="space-y-6 relative">
            <div className="w-full md:h-[70vh] h-fit aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
              {hlsUrl ? (
                <VideoHLS
                  src={hlsUrl}
                  title={currentItem.title || `Lesson ${currentItem?.order || 1}`}
                  initialProgress={videoProgressTime}
                  onEnded={handleVideoEnded}
                  onProgress={(percent) => {
                    const now = Date.now();
                    // Save at key milestones or every 10 seconds
                    if ([25, 50, 75].includes(percent) || now - lastProgressSaveRef.current > 10000) {
                      saveProgress("VIDEO_PROGRESS", { progress: percent });
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#63953a] mx-auto mb-4"></div>
                    <p className="text-white">Loading video...</p>
                  </div>
                </div>
              )}
            </div>
            {currentItem?.description && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <p className="text-gray-600 dark:text-gray-300">
                  {currentItem.description}
                </p>
              </div>
            )}
          </div>
        );

      case 'textInstruction':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="prose max-h-screen overflow-y-auto dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <BlogContent content={currentItem.content || ''} />
            </div>
            {!isCompleted && (
              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <button
                  onClick={() => saveProgress("MARK_COMPLETE")}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-black font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <CheckCircleSVG className="w-5 h-5 mr-2" />
                  Mark as Complete
                </button>
              </div>
            )}
          </div>
        );

      case 'file':
        const isPDF = fileData?.mime === 'application/pdf';
        const isImage = fileData?.mime?.includes('image');

        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start flex-1">
                  <div className="p-3 bg-primary/10 rounded-lg mr-4">
                    <FileSVG className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                      {currentItem.title || 'File'}
                    </h2>
                    {currentItem.description && (
                      <p className="text-gray-600 dark:text-gray-300">
                        {currentItem.description}
                      </p>
                    )}
                  </div>
                </div>

                {fileData?.url && (
                  <a
                    href={fileData.url}
                    download
                    target='_blank'
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-black font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md whitespace-nowrap"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                )}
              </div>

              {fileData?.url && (isPDF || isImage) && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  {isPDF && (
                    <div className="w-full" style={{ height: '600px' }}>
                      <iframe
                        src={fileData.url}
                        className="w-full h-full"
                        title={currentItem.title || 'PDF File'}
                      />
                    </div>
                  )}

                  {isImage && (
                    <div className="p-4">
                      <img
                        src={fileData.url}
                        alt={currentItem.title || 'Image'}
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'quiz':
        const quizProgress = getItemProgress(userProgress, currentModuleId, currentItemId);
        const isQuizCompleted = quizProgress === 100;
        const userAnswer = quizAnswers[currentItemId];
        const isInRetakeMode = retakeMode[currentItemId];
        
        console.log('Quiz rendering state:', {
          quizProgress,
          isQuizCompleted,
          userAnswer,
          isInRetakeMode,
          quizCompleted: quizCompleted[currentItemId]
        });

        // Get previous submission data
        let previousData = null;
        const moduleProgress = userProgress?.viewed?.find(m => m.moduleId === currentModuleId);
        if (moduleProgress) {
          const itemProgress = moduleProgress.items.find(i => i.itemId === currentItemId);
          if (itemProgress?.data) {
            previousData = itemProgress.data;
          }
        }
        
        const previousSelectedOption = previousData?.selected;
        const previousWasCorrect = previousData?.correct;

        // If quiz is completed and not in retake mode, show results
        if (isQuizCompleted && !isInRetakeMode) {
          console.log('Showing completed quiz results');
          
          return (
            <div className="space-y-6">
              <div className={`bg-gradient-to-r ${previousWasCorrect
                ? 'from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30'
                : 'from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30'
                } p-8 rounded-xl shadow-sm`}>
                <div className="text-center">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary/10 rounded-lg mr-3">
                        <QuizSVG className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Quiz</h3>
                    </div>
                  </div>
                  
                  <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
                    {currentItem.question}
                  </p>
                  
                  {/* Display all options with user's selection and correct answer */}
                  <div className="space-y-3 max-w-lg mx-auto">
                    {currentItem.options?.map((option, idx) => {
                      const isUserChoice = idx === previousSelectedOption;
                      const isCorrectAnswer = idx === currentItem.answer;
                      
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border-2 transition-all ${isUserChoice
                            ? isCorrectAnswer
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                              : 'border-red-500 bg-red-50 dark:bg-red-900/30'
                            : isCorrectAnswer
                              ? 'border-green-300 bg-green-50/50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${isUserChoice
                                ? isCorrectAnswer
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-red-500 bg-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                {isUserChoice && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className="text-gray-800 dark:text-gray-200">{option}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isUserChoice && (
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${isCorrectAnswer
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                  }`}>
                                  Your answer
                                </span>
                              )}
                              {isCorrectAnswer && !isUserChoice && (
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                  Correct
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Result Summary */}
                  <div className="mt-8 pt-6 border-t dark:border-gray-700">
                    <div className={`inline-flex items-center px-6 py-3 rounded-xl ${previousWasCorrect
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                      <span className="text-lg font-semibold">
                        {previousWasCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                      {!previousWasCorrect && (
                        <span className="ml-4 text-sm">
                          Correct answer: <strong>{currentItem.options[currentItem.answer]}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Retake Quiz Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleRetakeQuiz}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-black font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      <QuizSVG className="w-5 h-5 mr-2" />
                      Retake Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Show quiz after submission (before marking complete in database)
        if (quizCompleted[currentItemId] && userAnswer !== undefined) {
          console.log('Showing just submitted quiz results');
          const isCorrect = userAnswer === currentItem.answer;

          return (
            <div className="space-y-6">
              <div className={`bg-gradient-to-r ${isCorrect
                ? 'from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30'
                : 'from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30'
                } p-8 rounded-xl shadow-sm`}>
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                    }`}>
                    <span className="text-3xl">{isCorrect ? '✓' : '✗'}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
                    {currentItem.question}
                  </p>
                  <div className="space-y-3 max-w-md mx-auto">
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-medium">Your answer: </span>
                      <span className={`ml-2 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {currentItem.options[userAnswer]}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="font-medium">Correct answer: </span>
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          {currentItem.options[currentItem.answer]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Show quiz form for new or retake
        console.log('Showing quiz form');
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <QuizSVG className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Quiz</h3>
              </div>
              <p className="text-lg mb-6 text-gray-800 dark:text-gray-200">
                {currentItem.question}
              </p>
            </div>

            <div className="space-y-3">
              {currentItem.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuizSubmit(idx)}
                  className="w-full p-4 rounded-xl text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border-2 border-transparent hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${quizAnswers[currentItemId] === idx
                      ? 'border-primary bg-primary'
                      : 'border-gray-300 dark:border-gray-600'
                      }`}>
                      {quizAnswers[currentItemId] === idx && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-gray-800 dark:text-gray-200">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Content type not supported</p>
          </div>
        );
    }
  }, [
    loading,
    isInitialized,
    currentItem,
    isUnlocked,
    renderLockedContent,
    userProgress,
    currentModuleId,
    currentItemId,
    hlsUrl,
    videoProgressTime,
    handleVideoEnded,
    saveProgress,
    fileData,
    quizAnswers,
    quizCompleted,
    handleQuizSubmit,
    handleRetakeQuiz,
    retakeMode
  ]);

  if (!currentItem || !isInitialized) return <CourseLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Header - SIMPLIFIED - NO HAMBURGER MENU */}
      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm">
        <div className="px-4 py-3 flex items-center">
          <Link
            href="/courses"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LeftArrowSVG className="w-5 h-5" />
          </Link>

          <div className="flex-1 px-4">
            <h2 className="text-sm font-medium truncate">
              {currentItem.title || 'Course Content'}
            </h2>
            <div className="text-xs text-gray-500 truncate">
              {currentModule?.title || 'Module'} • {currentItem.type}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto md:px-4 md:py-4 lg:py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar - LEFT SIDE (Desktop only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Course Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-primary font-bold">
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-center text-gray-500">
                    {completedCount} of {totalItems} lessons completed
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
                  <h3 className="font-bold text-lg">Course Content</h3>
                </div>

                <div className="overflow-y-auto max-h-[calc(100vh-380px)]">
                  {courseData.modules.map((module) => (
                    <div key={module.moduleId} className="border-b dark:border-gray-700 last:border-b-0">
                      <button
                        onClick={() => toggleModule(module.moduleId)}
                        className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        aria-expanded={expandedModules.has(module.moduleId)}
                      >
                        <div className="flex items-center flex-1">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 mr-3 flex items-center justify-center">
                            <span className="font-semibold text-sm text-primary">
                              {module.order}
                            </span>
                          </div>
                          <span className="font-medium text-left text-sm">{module.title || `Module ${module.order}`}</span>
                        </div>
                        <DownArrowSVG
                          className={`w-4 h-4 transition-transform duration-200 ${expandedModules.has(module.moduleId) ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedModules.has(module.moduleId) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gray-50/50 dark:bg-gray-900/50"
                          >
                            {module.items.map((item) => {
                              const accessibility = getItemAccessibility(item.itemId, module.moduleId);
                              const isActive = item.itemId === currentItemId;
                              const isCompleted = getItemProgress(userProgress, module.moduleId, item.itemId) === 100;
                              const isViewed = isItemViewed(userProgress, module.moduleId, item.itemId);
                              const itemPath = `/courses/${userProgress?.courseId}/${module.moduleId}/${item.itemId}`;

                              return (
                                <Link
                                  key={item.itemId}
                                  href={itemPath}
                                  onClick={() => setIsTransitioning(true)}
                                  className={`flex items-center px-4 py-3 text-left transition-all border-l-4 ${isActive
                                    ? 'bg-primary/10 border-l-primary shadow-sm'
                                    : 'border-l-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-l-primary/30'
                                    } ${!accessibility.accessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  aria-disabled={!accessibility.accessible}
                                >
                                  <div className="flex items-center flex-1 min-w-0">
                                    <div className="mr-3">
                                      {isCompleted ? (
                                        <CheckCircleSVG className="w-5 h-5 text-green-500" />
                                      ) : !accessibility.accessible ? (
                                        <LockClosedSVG className="w-5 h-5 text-gray-400" />
                                      ) : (
                                        getItemIcon(item)
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center">
                                        <span className={`font-medium truncate text-sm ${isCompleted ? 'text-green-600 dark:text-green-400' : ''
                                          }`}>
                                          {item.title || `${item.type} ${item.order}`}
                                        </span>
                                        {isActive && (
                                          <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
                                            Current
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        <span className="capitalize">{item.type}</span>
                                        {isViewed && !isCompleted && (
                                          <span className="ml-1 text-primary">• In Progress</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Desktop Header */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                {courseData.title}
              </h1>
            </div>

            {/* Content Container */}
            <div className="bg-white dark:bg-gray-800 shadow-sm lg:shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="py-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentItemId}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={itemVariants}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Item Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-medium px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                            {currentModule?.title || `Module ${currentModule?.order || 1}`}
                          </span>
                          <span className="text-xs font-medium px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                            {currentItem.title || currentItem.type || `Lesson ${currentItem?.order || 1}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    {renderContent()}

                    {/* Navigation - Always enabled */}
                    <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700 gap-4">
                      <div className="flex-1">
                        {previousItem ? (
                          <Link
                            href={`/courses/${userProgress?.courseId}/${previousItem.moduleId}/${previousItem.itemId}`}
                            onClick={() => setIsTransitioning(true)}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-black rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                          >
                            <LeftArrowSVG className="w-4 h-4 mr-2" />
                            Previous
                          </Link>
                        ) : (
                          <div></div>
                        )}
                      </div>

                      <div className="flex-1 flex justify-end">
                        {nextItem ? (
                          <Link
                            href={`/courses/${userProgress?.courseId}/${nextItem.moduleId}/${nextItem.itemId}`}
                            onClick={() => setIsTransitioning(true)}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-black rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                          >
                            Next Lesson
                            <RightArrowSVG className="w-4 h-4 ml-2" />
                          </Link>
                        ) : (
                          <Link
                            href={`/courses/${userProgress?.courseId}`}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                          >
                            Finish Course
                            <RightArrowSVG className="w-4 h-4 ml-2" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* MOBILE MODULE DETAILS - Below content on mobile */}
            <div className="lg:hidden mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
                  <h3 className="font-bold text-lg">Course Modules</h3>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {courseData.modules.map((module) => (
                    <div key={module.moduleId} className="border-b dark:border-gray-700 last:border-b-0">
                      <button
                        onClick={() => toggleModule(module.moduleId)}
                        className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        aria-expanded={expandedModules.has(module.moduleId)}
                      >
                        <div className="flex items-center flex-1">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 mr-3 flex items-center justify-center">
                            <span className="font-semibold text-xs text-primary">
                              {module.order}
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="font-medium text-sm block">{module.title || `Module ${module.order}`}</span>
                            <span className="text-xs text-gray-500">
                              {module.items?.length || 0} lessons
                            </span>
                          </div>
                        </div>
                        <DownArrowSVG
                          className={`w-4 h-4 transition-transform duration-200 ${expandedModules.has(module.moduleId) ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedModules.has(module.moduleId) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gray-50/50 dark:bg-gray-900/50"
                          >
                            {module.items.map((item) => {
                              const accessibility = getItemAccessibility(item.itemId, module.moduleId);
                              const isActive = item.itemId === currentItemId;
                              const isCompleted = getItemProgress(userProgress, module.moduleId, item.itemId) === 100;
                              const isViewed = isItemViewed(userProgress, module.moduleId, item.itemId);
                              const itemPath = `/courses/${userProgress?.courseId}/${module.moduleId}/${item.itemId}`;

                              return (
                                <Link
                                  key={item.itemId}
                                  href={itemPath}
                                  onClick={() => setIsTransitioning(true)}
                                  className={`flex items-center px-4 py-3 text-left transition-all border-l-4 ${isActive
                                    ? 'bg-primary/10 border-l-primary shadow-sm'
                                    : 'border-l-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                                    } ${!accessibility.accessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  aria-disabled={!accessibility.accessible}
                                >
                                  <div className="flex items-center flex-1 min-w-0">
                                    <div className="mr-3">
                                      {isCompleted ? (
                                        <CheckCircleSVG className="w-4 h-4 text-green-500" />
                                      ) : !accessibility.accessible ? (
                                        <LockClosedSVG className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        getItemIcon(item)
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate text-sm">
                                        {item.title || `${item.type} ${item.order}`}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        <span className="capitalize">{item.type}</span>
                                        {isActive && (
                                          <span className="ml-1 text-primary">• Current</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePlayer;