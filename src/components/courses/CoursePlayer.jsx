"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import "plyr/dist/plyr.css";
import { SERVER } from '@/constants/urls.mjs';
import BlogContent from '@/components/blogs/BlogContnet';
import VideoHLS from '../dashboard/user/VideoHLS';
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

const PRIMARY_COLOR = '#63953a';
const PRIMARY_LIGHT = '#8bc34a';
const PRIMARY_DARK = '#4a7c2a';

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
  const pathname = usePathname();
  const router = useRouter();
  const [hlsUrl, setHlsUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileData, setFileData] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState({});
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [videoProgressTime, setVideoProgressTime] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  // Extract data
  const courseData = course;
  const userProgress = progress || {};

  // Find current module and item
  const currentModule = courseData?.modules?.find(m => m?.moduleId === currentModuleId);
  const currentItem = currentModule?.items?.find(i => i.itemId === currentItemId);

  // Calculate progress for UI
  const totalItems = courseData.modules?.reduce((acc, module) => acc + (module.items?.length || 0), 0) || 0;
  const completedCount = userProgress?.viewed?.reduce((acc, module) => 
    acc + module.items.filter(item => item.progress === 100).length, 0) || 0;
  const overallProgress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Check if current item is unlocked on first load
  useEffect(() => {
    if (!currentItemId || !currentModuleId || !courseData.modules || isInitialized) {
      return;
    }

    const checkUnlockStatus = () => {
      // Case 1: Item is already in viewed array - always unlocked
      if (isItemViewed(userProgress, currentModuleId, currentItemId)) {
        setIsUnlocked(true);
        setIsInitialized(true);
        return;
      }

      // Find current module and item index
      const currentModuleIndex = courseData.modules.findIndex(m => m.moduleId === currentModuleId);
      if (currentModuleIndex === -1) {
        setIsUnlocked(false);
        setIsInitialized(true);
        return;
      }

      const currentModule = courseData.modules[currentModuleIndex];
      const currentItemIndex = currentModule.items.findIndex(i => i.itemId === currentItemId);
      
      if (currentItemIndex === -1) {
        setIsUnlocked(false);
        setIsInitialized(true);
        return;
      }

      // Case 2: Check previous item in same module
      if (currentItemIndex > 0) {
        const previousItem = currentModule.items[currentItemIndex - 1];
        if (isItemViewed(userProgress, currentModuleId, previousItem.itemId)) {
          setIsUnlocked(true);
          setIsInitialized(true);
          // Save progress for this item since it's newly accessed
          setTimeout(() => {
            if (["textInstruction", "file"].includes(currentItem?.type)) {
              saveProgress("MARK_COMPLETE");
            } else if (currentItem?.type === "video") {
              saveProgress("VIDEO_PROGRESS", { progress: 0 });
            }
          }, 100);
          return;
        } else {
          setIsUnlocked(false);
          setIsInitialized(true);
          return;
        }
      }

      // Case 3: First item in module, check previous module's last item
      if (currentItemIndex === 0 && currentModuleIndex > 0) {
        const previousModule = courseData.modules[currentModuleIndex - 1];
        if (previousModule.items.length > 0) {
          const lastItem = previousModule.items[previousModule.items.length - 1];
          if (isItemViewed(userProgress, previousModule.moduleId, lastItem.itemId)) {
            setIsUnlocked(true);
            setIsInitialized(true);
            // Save progress for this item since it's newly accessed
            setTimeout(() => {
              if (["textInstruction", "file"].includes(currentItem?.type)) {
                saveProgress("MARK_COMPLETE");
              } else if (currentItem?.type === "video") {
                saveProgress("VIDEO_PROGRESS", { progress: 0 });
              }
            }, 100);
            return;
          } else {
            setIsUnlocked(false);
            setIsInitialized(true);
            return;
          }
        }
      }

      // Case 4: First item of first module - always unlocked
      if (currentItemIndex === 0 && currentModuleIndex === 0) {
        setIsUnlocked(true);
        setIsInitialized(true);
        // Save progress for this item since it's newly accessed
        setTimeout(() => {
          if (["textInstruction", "file"].includes(currentItem?.type)) {
            saveProgress("MARK_COMPLETE");
          } else if (currentItem?.type === "video") {
            saveProgress("VIDEO_PROGRESS", { progress: 0 });
          }
        }, 100);
        return;
      }

      // Default case: locked
      setIsUnlocked(false);
      setIsInitialized(true);
    };

    checkUnlockStatus();
  }, [currentItemId, currentModuleId, userProgress, courseData.modules, currentItem, isInitialized]);

  const saveProgress = async (action, payload = {}) => {
    try {
      const res = await updateCourseProgress(userProgress.courseId, currentModuleId, currentItemId, payload, action)
      console.log(res)
    } catch (err) {
      console.error("Progress save failed", err);
    }
  };

  // Handle video ended
  const handleVideoEnded = async () => {
    if (currentItem?.type !== 'video') return;
    
    setVideoEnded(true);
    
    // Save progress as 100% when video ends
    await saveProgress("VIDEO_PROGRESS", { progress: 100 });
    await saveProgress("MARK_COMPLETE");
    
    // Navigate to next item after a short delay
    const { next: nextItem } = getNavigationItems();
    if (nextItem) {
      setTimeout(() => {
        router.push(`/courses/${userProgress?.courseId}/${nextItem.moduleId}/${nextItem.itemId}`);
      }, 1500); // 1.5 second delay to show completion
    }
  };

  // Initialize expanded modules with current module
  useEffect(() => {
    if (currentModuleId) {
      setExpandedModules(prev => new Set([...prev, currentModuleId]));
    }
  }, [currentModuleId]);

  const getNavigationItems = () => {
    if (!currentItemId) return { previous: null, next: null };

    let found = false;
    let previousItem = null;
    let nextItem = null;

    // Find current item and its neighbors
    for (let mIdx = 0; mIdx < courseData.modules.length; mIdx++) {
      const module = courseData.modules[mIdx];
      for (let iIdx = 0; iIdx < module.items.length; iIdx++) {
        if (module.moduleId === currentModuleId && module.items[iIdx].itemId === currentItemId) {
          found = true;

          // Previous item
          if (iIdx > 0) {
            // Previous item in same module
            previousItem = {
              ...module.items[iIdx - 1],
              moduleId: module.moduleId // Include moduleId
            };
          } else if (mIdx > 0) {
            // Last item of previous module
            const prevModule = courseData.modules[mIdx - 1];
            previousItem = {
              ...prevModule.items[prevModule.items.length - 1],
              moduleId: prevModule.moduleId // Include moduleId
            };
          }

          // Next item
          if (iIdx < module.items.length - 1) {
            // Next item in same module
            nextItem = {
              ...module.items[iIdx + 1],
              moduleId: module.moduleId // Include moduleId
            };
          } else if (mIdx < courseData.modules.length - 1) {
            // First item of next module
            const nextModule = courseData.modules[mIdx + 1];
            if (nextModule.items.length > 0) {
              nextItem = {
                ...nextModule.items[0],
                moduleId: nextModule.moduleId // Include moduleId
              };
            }
          }

          break;
        }
      }
      if (found) break;
    }

    return { previous: previousItem, next: nextItem };
  };
  const { previous: previousItem, next: nextItem } = getNavigationItems();

  // Load video stream on first load
  useEffect(() => {
    if (!currentItem || currentItem.type !== "video" || !isUnlocked) {
      setHlsUrl(null);
      setLoading(false);
      return;
    }

    // Get video progress from userProgress
    const getVideoProgress = () => {
      if (userProgress && userProgress.viewed) {
        const moduleProgress = userProgress.viewed.find(m => m.moduleId === currentModuleId);
        if (moduleProgress) {
          const itemProgress = moduleProgress.items.find(i => i.itemId === currentItemId);
          if (itemProgress) {
            // Store progress percentage for later use with video duration
            setVideoProgressTime(itemProgress.progress);
          }
        }
      }
    };

    getVideoProgress();

    const loadVideoStream = async () => {
      try {
        if (currentItem.url?.filename) {
          const streamData = await getStreamData(userProgress?.courseId, currentItem?.url?.filename);
          console.log(streamData)
          if (streamData?.url) {
            setHlsUrl(streamData?.url);
          }
        }
      } catch (err) {
        console.error("Stream load failed", err);
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
          // Get token only if file is not public
          if (currentItem.status !== 'public') {
            token = await getFileToken(userProgress?.courseId, currentItem?.url?.filename);
          }

          // Build file URL with token if needed
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
        console.error("File load failed", err);
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

  useEffect(() => {
    if (currentItem?.type === "file" && fileData?.url && isUnlocked) {
      saveProgress("MARK_COMPLETE");
    }
  }, [fileData, isUnlocked]);

  // Reset quiz state when item changes
  useEffect(() => {
    if (currentItem?.type === 'quiz' && isUnlocked) {
      setQuizCompleted(prev => ({ ...prev, [currentItemId]: false }));
    }
  }, [currentItemId, currentItem?.type, isUnlocked]);

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Check if a specific item is accessible (for UI display only)
  const checkItemAccessible = (itemId, moduleId) => {
    if (!itemId || !moduleId) return false;
    
    // If item is already viewed, it's accessible
    if (isItemViewed(userProgress, moduleId, itemId)) {
      return true;
    }
    
    // Find the module index
    const moduleIndex = courseData.modules.findIndex(m => m.moduleId === moduleId);
    if (moduleIndex === -1) return false;
    
    const module = courseData.modules[moduleIndex];
    const itemIndex = module.items.findIndex(i => i.itemId === itemId);
    
    // If it's the first item of the first module, it's accessible
    if (moduleIndex === 0 && itemIndex === 0) {
      return true;
    }
    
    // Check previous item in same module
    if (itemIndex > 0) {
      const previousItem = module.items[itemIndex - 1];
      return isItemViewed(userProgress, moduleId, previousItem.itemId);
    }
    
    // Check last item of previous module
    if (moduleIndex > 0) {
      const previousModule = courseData.modules[moduleIndex - 1];
      if (previousModule.items.length > 0) {
        const lastItem = previousModule.items[previousModule.items.length - 1];
        return isItemViewed(userProgress, previousModule.moduleId, lastItem.itemId);
      }
    }
    
    return false;
  };

  // Get item icon
  const getItemIcon = (item) => {
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
  };

  const handleQuizSubmit = async (selectedOption) => {
    if (!currentItem || currentItem.type !== "quiz" || !isUnlocked) return;

    const isCorrect = selectedOption === currentItem.answer;

    await saveProgress("QUIZ_SUBMIT", {
      selected: selectedOption,
      correct: isCorrect,
    });
    await saveProgress("MARK_COMPLETE");

    // if (isCorrect) {
    // }

    setQuizAnswers(prev => ({ ...prev, [currentItemId]: selectedOption }));
    setQuizCompleted(prev => ({ ...prev, [currentItemId]: true }));
  };

  // Render locked content
  const renderLockedContent = () => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
        <LockClosedSVG className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
        Content Locked
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
        Complete the previous lesson to unlock this content. Make sure you've finished all required items in the previous module.
      </p>
      {previousItem && (
        <Link
          href={`/courses/${userProgress?.courseId}/${previousItem.moduleId}/${previousItem.itemId}`}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-black font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
        >
          <LeftArrowSVG className="w-4 h-4 mr-2" />
          Go to Previous Lesson
        </Link>
      )}
    </div>
  );

  // Render video ended overlay
  const renderVideoEndedOverlay = () => (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 rounded-xl">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
          <CheckCircleSVG className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white">
          Video Completed!
        </h3>
        <p className="text-gray-300 mb-6">
          Great job! You've completed this video lesson.
        </p>
        {nextItem ? (
          <p className="text-gray-400 text-sm">
            Redirecting to next lesson in 1 second...
          </p>
        ) : (
          <Link
            href={`/courses/${userProgress?.courseId}`}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold mt-4"
          >
            Finish Course
            <RightArrowSVG className="w-4 h-4 ml-2" />
          </Link>
        )}
      </div>
    </div>
  );

  // Render content based on type
  const renderContent = () => {
    if (loading || !isInitialized) return <CourseLoader />;
    if (!currentItem) return <div className="text-center py-12">Content not found</div>;
    
    // Check if content is unlocked
    if (!isUnlocked) {
      return renderLockedContent();
    }

    const isCompleted = getItemProgress(userProgress, currentModuleId, currentItemId) === 100;

    switch (currentItem.type) {
      case 'video':
        return (
          <div className="space-y-6 relative">
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
              {hlsUrl ? (
                <>
                  <VideoHLS
                    src={hlsUrl}
                    initialProgress={videoProgressTime}
                    onEnded={handleVideoEnded}
                    onProgress={(percent) => {
                      // Only save progress during playback, not at the end
                      if (percent < 95 && percent % 30 === 0) {
                        saveProgress("VIDEO_PROGRESS", { progress: percent });
                      }
                    }}
                  />
                  {videoEnded && renderVideoEndedOverlay()}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white">Loading video...</p>
                  </div>
                </div>
              )}
            </div>
            {currentItem?.description && <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <p className="text-gray-600 dark:text-gray-300">
                {currentItem.description}
              </p>
            </div>}
          </div>
        );

      case 'textInstruction':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="prose max-h-screen overflow-y-auto dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <BlogContent content={currentItem.content || ''} />
            </div>
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
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-black font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md whitespace-nowrap"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                )}
              </div>

              {/* Inline Preview for PDF and Images */}
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
        const userAnswer = quizAnswers[currentItemId];
        const isQuizCompleted = quizCompleted[currentItemId];

        if (isQuizCompleted && userAnswer !== undefined) {
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
  };

  if (!currentItem || !isInitialized) return <CourseLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
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

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="space-y-1">
              <div className="w-6 h-0.5 bg-gray-600 rounded-full"></div>
              <div className="w-6 h-0.5 bg-gray-600 rounded-full"></div>
              <div className="w-6 h-0.5 bg-gray-600 rounded-full"></div>
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar - LEFT SIDE */}
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
                              const isAccessible = checkItemAccessible(item.itemId, module.moduleId);
                              const isActive = item.itemId === currentItemId;
                              const isCompleted = getItemProgress(userProgress, module.moduleId, item.itemId) === 100;
                              const isViewed = isItemViewed(userProgress, module.moduleId, item.itemId);
                              const itemPath = `/courses/${userProgress?.courseId}/${module.moduleId}/${item.itemId}`;

                              return (
                                <Link
                                  key={item.itemId}
                                  href={itemPath}
                                  className={`flex items-center px-4 py-3 text-left transition-all border-l-4 ${isActive
                                    ? 'bg-primary/10 border-l-primary shadow-sm'
                                    : 'border-l-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-l-primary/30'
                                    }`}
                                >
                                  <div className="flex items-center flex-1 min-w-0">
                                    <div className="mr-3">
                                      {isCompleted ? (
                                        <CheckCircleSVG className="w-5 h-5 text-green-500" />
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
                                            Playing
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm lg:shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-4 lg:p-6">
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
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Course Content</h3>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {courseData.modules.map((module) => (
                    <div key={module.moduleId}>
                      <button
                        onClick={() => toggleModule(module.moduleId)}
                        className="w-full flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl mb-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 mr-3 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {module.order}
                            </span>
                          </div>
                          <span className="font-medium text-sm">{module.title || `Module ${module.order}`}</span>
                        </div>
                        <DownArrowSVG
                          className={`w-4 h-4 transition-transform ${expandedModules.has(module.moduleId) ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      {expandedModules.has(module.moduleId) && (
                        <div className="space-y-1 ml-4">
                          {module.items.map((item) => {
                            const isAccessible = checkItemAccessible(item.itemId, module.moduleId);
                            const isActive = item.itemId === currentItemId;
                            const isCompleted = getItemProgress(userProgress, module.moduleId, item.itemId) === 100;
                            const isViewed = isItemViewed(userProgress, module.moduleId, item.itemId);
                            const itemPath = `/courses/${userProgress?.courseId}/${module.moduleId}/${item.itemId}`;

                            return (
                              <Link
                                key={item.itemId}
                                href={itemPath}
                                onClick={() => {
                                  setShowMobileMenu(false);
                                }}
                                className={`flex items-center p-2.5 rounded-lg transition-all ${isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                              >
                                <div className="mr-2">
                                  {isCompleted ? (
                                    <CheckCircleSVG className="w-4 h-4 text-green-500" />
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
                                    {isViewed && !isCompleted && (
                                      <span className="ml-1 text-primary">• In Progress</span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursePlayer;