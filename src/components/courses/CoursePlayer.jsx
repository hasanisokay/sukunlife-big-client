"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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

// Primary color
const PRIMARY_COLOR = '#63953a';
const PRIMARY_LIGHT = '#8bc34a';
const PRIMARY_DARK = '#4a7c2a';

// Lock Modal Component
const LockModal = ({ isOpen, onClose, onGoToPrevious }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <LockClosedSVG className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            Content Locked
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please view the previous lesson to unlock this content.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={onGoToPrevious}
              className="px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Go to Previous Lesson
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Custom Loader Component
const CourseLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-primary border-l-primary animate-spin animation-delay-500"></div>
          <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-primary/50 border-r-primary/50 animate-spin animation-delay-1000"></div>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary-light animate-pulse" 
              style={{ width: '70%' }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
            Loading your course...
          </p>
        </div>
      </div>
    </div>
  </div>
);

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const CoursePlayer = ({ 
  course, 
  progress,
  initialModuleIndex = 0,
  initialItemIndex = 0 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const videoRef = useRef(null);
  const [hlsUrl, setHlsUrl] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(initialModuleIndex);
  const [activeItemIndex, setActiveItemIndex] = useState(initialItemIndex);
  const [userProgress, setUserProgress] = useState(progress || {});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [expandedModule, setExpandedModule] = useState(initialModuleIndex);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockedItem, setLockedItem] = useState(null);
  
  // Store progress tracking interval
  const progressIntervalRef = useRef(null);
  // Store video element reference
  const videoElementRef = useRef(null);
  // Track if we're currently saving to prevent race conditions
  const saveQueueRef = useRef([]);
  const isSavingRef = useRef(false);

  // Extract course data from progress response
  const courseData = course || userProgress?.course || { modules: [] };

  // Get current module and item
  const currentModule = courseData.modules?.[activeModuleIndex];
  const currentItem = currentModule?.items?.[activeItemIndex];

  // Calculate overall progress
  const totalItems = courseData.modules?.reduce((acc, module) => acc + (module.items?.length || 0), 0) || 0;
  const completedCount = userProgress?.completedItems?.length || 0;
  const overallProgress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Precompute unlocked items based on VIEWED items (not completed)
  const [unlockedItems, setUnlockedItems] = useState(new Set());

  useEffect(() => {
    if (!courseData.modules) return;
    
    const unlocked = new Set();
    const viewedItems = userProgress?.viewedItems || [];
    const completedItems = userProgress?.completedItems || [];
    
    courseData.modules.forEach((module, moduleIdx) => {
      module.items.forEach((item, itemIdx) => {
        const itemId = item.itemId;
        
        // First item is always unlocked
        if (moduleIdx === 0 && itemIdx === 0) {
          unlocked.add(itemId);
          return;
        }
        
        // If completed or viewed, it's unlocked
        if (completedItems.includes(itemId) || viewedItems.includes(itemId)) {
          unlocked.add(itemId);
          return;
        }
        
        // Find previous item
        let prevItemId = null;
        if (itemIdx === 0) {
          // First item of module - check last item of previous module
          if (moduleIdx > 0) {
            const prevModule = courseData.modules[moduleIdx - 1];
            prevItemId = prevModule.items[prevModule.items.length - 1]?.itemId;
          }
        } else {
          // Previous item in same module
          prevItemId = module.items[itemIdx - 1]?.itemId;
        }
        
        // KEY CHANGE: Unlock if previous item is VIEWED (not necessarily completed)
        if (prevItemId && viewedItems.includes(prevItemId)) {
          unlocked.add(itemId);
        }
      });
    });
    
    setUnlockedItems(unlocked);
  }, [courseData.modules, userProgress?.viewedItems, userProgress?.completedItems]);

  const isItemUnlocked = useCallback((itemId) => {
    return unlockedItems.has(itemId);
  }, [unlockedItems]);

  // Get item position
  const getItemPosition = useCallback((itemId) => {
    for (let mIdx = 0; mIdx < courseData.modules.length; mIdx++) {
      const module = courseData.modules[mIdx];
      for (let iIdx = 0; iIdx < module.items.length; iIdx++) {
        if (module.items[iIdx].itemId === itemId) {
          return { moduleIdx: mIdx, itemIdx: iIdx };
        }
      }
    }
    return null;
  }, [courseData.modules]);

  // Initialize from URL and progress
  useEffect(() => {
    if (!courseData.modules?.length) return;

    const initializeFromProgress = () => {
      let targetModuleIndex = initialModuleIndex;
      let targetItemIndex = initialItemIndex;
      
      // If there's a current item in progress, use it
      if (userProgress?.currentItem) {
        const position = getItemPosition(userProgress.currentItem);
        if (position) {
          targetModuleIndex = position.moduleIdx;
          targetItemIndex = position.itemIdx;
        }
      }
      
      setActiveModuleIndex(targetModuleIndex);
      setActiveItemIndex(targetItemIndex);
      setExpandedModule(targetModuleIndex);
    };

    initializeFromProgress();
  }, [courseData.modules, userProgress?.currentItem, initialModuleIndex, initialItemIndex, getItemPosition]);

  // Update URL when item changes
  useEffect(() => {
    if (!currentModule || !currentItem) return;
    
    const newPath = `/courses/${userProgress.courseId}/${currentModule.moduleId}/${currentItem.itemId}`;
    
    // Only update URL if it's different from current path
    if (pathname !== newPath) {
      router.replace(newPath, { scroll: false });
    }
  }, [currentModule, currentItem, userProgress?.courseId, pathname, router]);

  // Queue-based progress save to prevent race conditions
  const queueProgressSave = useCallback(async (action, data) => {
    return new Promise((resolve, reject) => {
      saveQueueRef.current.push({ action, data, resolve, reject });
      processQueue();
    });
  }, []);

  const processQueue = useCallback(async () => {
    if (isSavingRef.current || saveQueueRef.current.length === 0) return;
    
    isSavingRef.current = true;
    setIsSavingProgress(true);
    
    const { action, data, resolve, reject } = saveQueueRef.current.shift();
    
    try {
      const response = await fetch(
        `${SERVER}/api/user/update-progress/${userProgress.courseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ action, ...data }),
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        setUserProgress(prev => ({
          ...prev,
          ...result.progress
        }));
        
        resolve(result);
      } else {
        reject(new Error('Failed to save progress'));
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
      reject(error);
    } finally {
      isSavingRef.current = false;
      setIsSavingProgress(false);
      
      // Process next item in queue
      if (saveQueueRef.current.length > 0) {
        setTimeout(processQueue, 100);
      }
    }
  }, [userProgress?.courseId]);

  // Mark item as viewed when user opens/clicks it
  useEffect(() => {
    if (!currentItem?.itemId || !userProgress?.courseId) return;
    
    const viewedItems = userProgress?.viewedItems || [];
    
    // Only mark as viewed if not already viewed
    if (!viewedItems.includes(currentItem.itemId)) {
      console.log('Marking item as viewed:', currentItem.itemId);
      queueProgressSave("mark-viewed", {
        itemId: currentItem.itemId
      }).catch(console.error);
    }
  }, [currentItem?.itemId, userProgress?.courseId, userProgress?.viewedItems, queueProgressSave]);

  // Load video stream URL
  useEffect(() => {
    if (!currentItem || currentItem.type !== "video") {
      setHlsUrl(null);
      return;
    }

    const loadVideoStream = async () => {
      try {
        // Get the original course to access the video filename
        const courseRes = await fetch(
          `${SERVER}/api/public/course/${userProgress.courseId}`,
          { credentials: "include" }
        );
        const courseDetails = await courseRes.json();
        
        if (courseDetails.status === 200) {
          let videoFilename = null;
          
          // Find the video filename from original course data
          courseDetails?.course?.modules?.forEach(module => {
            module.items.forEach(item => {
              if (item.itemId === currentItem.itemId && item.url?.filename) {
                videoFilename = item.url.filename;
              }
            });
          });
          
          if (videoFilename) {
            const streamRes = await fetch(
              `${SERVER}/api/user/course/stream-url/${userProgress.courseId}/${videoFilename}`,
              { credentials: "include" }
            );
            const streamData = await streamRes.json();
            if (streamData.url) {
              setHlsUrl(streamData.url);
            }
          } else {
            console.error('Video filename not found for item:', currentItem.itemId);
          }
        }
      } catch (err) {
        console.error("Stream load failed", err);
      }
    };

    loadVideoStream();
  }, [currentItem, userProgress?.courseId]);

  // Cleanup progress tracking on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Get next item in sequence
  const getNextItem = useCallback(() => {
    if (!currentItem) return null;
    
    for (let mIdx = 0; mIdx < courseData.modules.length; mIdx++) {
      const module = courseData.modules[mIdx];
      for (let iIdx = 0; iIdx < module.items.length; iIdx++) {
        if (module.items[iIdx].itemId === currentItem.itemId) {
          if (iIdx + 1 < module.items.length) {
            return { 
              item: module.items[iIdx + 1], 
              moduleIdx: mIdx, 
              itemIdx: iIdx + 1 
            };
          } else if (mIdx + 1 < courseData.modules.length) {
            return { 
              item: courseData.modules[mIdx + 1].items[0], 
              moduleIdx: mIdx + 1, 
              itemIdx: 0 
            };
          }
        }
      }
    }
    return null;
  }, [currentItem, courseData.modules]);

  // Get previous item in sequence
  const getPreviousItem = useCallback(() => {
    if (!currentItem) return null;
    
    for (let mIdx = 0; mIdx < courseData.modules.length; mIdx++) {
      const module = courseData.modules[mIdx];
      for (let iIdx = 0; iIdx < module.items.length; iIdx++) {
        if (module.items[iIdx].itemId === currentItem.itemId) {
          if (iIdx > 0) {
            return { 
              item: module.items[iIdx - 1], 
              moduleIdx: mIdx, 
              itemIdx: iIdx - 1 
            };
          } else if (mIdx > 0) {
            const prevModule = courseData.modules[mIdx - 1];
            return { 
              item: prevModule.items[prevModule.items.length - 1], 
              moduleIdx: mIdx - 1, 
              itemIdx: prevModule.items.length - 1 
            };
          }
        }
      }
    }
    return null;
  }, [currentItem, courseData.modules]);

  // Start video progress tracking
  const startVideoProgressTracking = useCallback(() => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const trackVideoProgress = async () => {
      const video = videoElementRef.current;
      if (!video || !currentItem || currentItem.type !== 'video') return;
      
      const currentTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);
      
      if (duration > 0 && currentTime > 0) {
        const percentage = Math.round((currentTime / duration) * 100);
        
        // Save progress
        await queueProgressSave("update-video-time", {
          itemId: currentItem.itemId,
          data: { currentTime, duration, percentage }
        });
        
        // Auto-mark as complete if watched 90%+
        if (percentage >= 90 && !userProgress.completedItems?.includes(currentItem.itemId)) {
          await queueProgressSave("mark-complete", {
            itemId: currentItem.itemId,
            moduleId: currentModule.moduleId
          });
        }
      }
    };

    // Start tracking every 10 seconds
    progressIntervalRef.current = setInterval(trackVideoProgress, 10000);
    
    // Also track on play/pause events
    const video = videoElementRef.current;
    if (video) {
      video.addEventListener('play', trackVideoProgress);
      video.addEventListener('pause', trackVideoProgress);
      video.addEventListener('timeupdate', () => {
        // Save on significant time changes
        const currentTime = Math.floor(video.currentTime);
        if (currentTime % 30 === 0) { // Every 30 seconds
          trackVideoProgress();
        }
      });
    }

    return () => {
      if (video) {
        video.removeEventListener('play', trackVideoProgress);
        video.removeEventListener('pause', trackVideoProgress);
        video.removeEventListener('timeupdate', trackVideoProgress);
      }
    };
  }, [currentItem, currentModule, userProgress.completedItems, queueProgressSave]);

  // Setup video tracking when video is ready
  useEffect(() => {
    if (currentItem?.type === 'video' && hlsUrl) {
      // Start tracking after a short delay to ensure video is loaded
      const timer = setTimeout(() => {
        startVideoProgressTracking();
      }, 2000);

      return () => {
        clearTimeout(timer);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };
    }
  }, [currentItem?.type, hlsUrl, startVideoProgressTracking]);

  // Navigate to item with URL update
  const navigateToItem = useCallback(async (moduleIdx, itemIdx) => {
    const targetModule = courseData.modules[moduleIdx];
    const targetItem = targetModule.items[itemIdx];
    
    // Check if item is unlocked
    if (!isItemUnlocked(targetItem?.itemId)) {
      setLockedItem({ moduleIdx, itemIdx });
      setShowLockModal(true);
      return;
    }
    
    // Update state
    setActiveModuleIndex(moduleIdx);
    setActiveItemIndex(itemIdx);
    setExpandedModule(moduleIdx);
    setCurrentQuizIndex(0);
    setQuizCompleted(false);
    setSelectedAnswers({});
    setShowMobileMenu(false);
    
    // Clear existing progress tracking
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, [courseData.modules, isItemUnlocked]);

  // Handle video play for progress tracking
  const handleVideoPlay = useCallback(() => {
    console.log('Video play detected, starting progress tracking');
    startVideoProgressTracking();
  }, [startVideoProgressTracking]);

  // Handle manual completion for files and text
  const handleMarkComplete = useCallback(async () => {
    if (!currentItem || !currentModule) return;
    
    try {
      await queueProgressSave("mark-complete", {
        itemId: currentItem.itemId,
        moduleId: currentModule.moduleId
      });
    } catch (error) {
      console.error('Failed to mark as complete:', error);
    }
  }, [currentItem, currentModule, queueProgressSave]);

  // Handle quiz submission
  const handleQuizSubmit = useCallback(async (selectedOption) => {
    if (!currentItem || currentItem.type !== 'quiz') return;
    
    const isCorrect = selectedOption === currentItem.answer;
    
    try {
      await queueProgressSave("quiz-result", {
        itemId: currentItem.itemId,
        moduleId: currentModule.moduleId,
        data: {
          score: isCorrect ? 1 : 0,
          maxScore: 1,
          passed: isCorrect
        }
      });
      
      setSelectedAnswers({ [currentQuizIndex]: selectedOption });
      setQuizCompleted(true);
      
      return isCorrect;
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      return false;
    }
  }, [currentItem, currentModule, currentQuizIndex, queueProgressSave]);

  // Render item content based on type
  const renderItemContent = () => {
    if (!currentItem) return null;

    const isCompleted = userProgress?.completedItems?.includes(currentItem.itemId);
    const videoProgress = userProgress?.videoProgress?.[currentItem.itemId];

    switch (currentItem.type) {
      case 'video':
        return (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative">
              <div className="relative w-full h-full">
                <VideoHLS
                  src={hlsUrl}
                  ref={(el) => {
                    videoRef.current = el;
                    if (el?.videoRef) {
                      videoElementRef.current = el.videoRef.current;
                    }
                  }}
                  onPlay={handleVideoPlay}
                />
              </div>
              {isSavingProgress && (
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                  Saving progress...
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {currentItem.title || 'Video Lesson'}
              </h2>
              {currentItem.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {currentItem.description}
                </p>
              )}
              <div className="flex items-center gap-3">
                {isCompleted && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircleSVG className="w-4 h-4 mr-1" />
                    Completed
                  </div>
                )}
                {videoProgress?.percentage > 0 && !isCompleted && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <span className="text-sm">
                      {videoProgress.percentage}% watched
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'textInstruction':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {currentItem.title}
              </h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                <BlogContent content={currentItem.content || ''} />
              </div>
            </div>
            
            {!isCompleted && (
              <div className="flex justify-center">
                <button
                  onClick={handleMarkComplete}
                  disabled={isSavingProgress}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
                >
                  {isSavingProgress ? 'Saving...' : 'Mark as Complete'}
                </button>
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-start mb-6">
                <div className="p-3 bg-primary/10 rounded-lg mr-4">
                  <FileSVG className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {currentItem.title}
                  </h2>
                  {currentItem.description && (
                    <p className="text-gray-600 dark:text-gray-300">
                      {currentItem.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <a
                  href={`${SERVER}/api/user/course/file/${userProgress.courseId}/${currentItem.itemId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md"
                  download
                >
                  <FileSVG className="w-5 h-5 mr-2" />
                  Download File
                </a>
                
                {currentItem.url?.mime === 'application/pdf' && (
                  <div className="mt-6">
                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-t-lg flex items-center px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        PDF Preview
                      </span>
                    </div>
                    <iframe
                      src={`${SERVER}/api/user/course/file/${userProgress.courseId}/${currentItem.itemId}`}
                      className="w-full h-[500px] rounded-b-lg"
                      title={currentItem.title}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {!isCompleted && (
              <div className="flex justify-center">
                <button
                  onClick={handleMarkComplete}
                  disabled={isSavingProgress}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
                >
                  {isSavingProgress ? 'Saving...' : 'Mark as Complete'}
                </button>
              </div>
            )}
          </div>
        );

      case 'quiz':
        return renderQuizContent();

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Content type not supported</p>
          </div>
        );
    }
  };

  // Render quiz content
  const renderQuizContent = () => {
    if (!currentItem || currentItem.type !== 'quiz') return null;

    if (quizCompleted) {
      const userAnswer = selectedAnswers[currentQuizIndex];
      const isCorrect = userAnswer === currentItem.answer;
      
      return (
        <div className="space-y-6">
          <div className={`bg-gradient-to-r ${
            isCorrect 
              ? 'from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30' 
              : 'from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30'
          } p-8 rounded-xl shadow-sm`}>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
              }`}>
                {isCorrect ? (
                  <span className="text-3xl">🎉</span>
                ) : (
                  <span className="text-3xl">❌</span>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-3">
                {isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
              </h3>
              <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
                {currentItem.question}
              </p>
              <div className="space-y-3 max-w-md mx-auto">
                <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-medium">Your answer:</span>
                  <span className={`ml-2 ${
                    isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {currentItem.options[userAnswer]}
                  </span>
                </div>
                {!isCorrect && (
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="font-medium">Correct answer:</span>
                    <span className="ml-2 text-green-600 dark:text-green-400">
                      {currentItem.options[currentItem.answer]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t dark:border-gray-700">
            <button
              onClick={() => {
                setQuizCompleted(false);
                setCurrentQuizIndex(0);
                setSelectedAnswers({});
              }}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Try Again
            </button>
            
            <button
              onClick={async () => {
                const nextItem = getNextItem();
                if (nextItem) {
                  await navigateToItem(nextItem.moduleIdx, nextItem.itemIdx);
                }
              }}
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md flex items-center justify-center"
            >
              Next Lesson
              <RightArrowSVG className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <QuizSVG className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Quiz</h3>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-full">
                Question 1 of 1
              </span>
            </div>
            <p className="text-lg mb-8 text-gray-800 dark:text-gray-200">
              {currentItem.question}
            </p>
          </div>
          
          <div className="space-y-3">
            {currentItem.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleQuizSubmit(idx)}
                disabled={isSavingProgress}
                className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                  selectedAnswers[currentQuizIndex] === idx
                    ? 'bg-primary/10 border-2 border-primary shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedAnswers[currentQuizIndex] === idx
                      ? 'border-primary bg-primary'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedAnswers[currentQuizIndex] === idx && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-gray-800 dark:text-gray-200">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Get item icon
  const getItemIcon = (item, isCompleted = false) => {
    const iconProps = { className: "w-5 h-5" };
    
    if (isCompleted) {
      return <CheckCircleSVG {...iconProps} className="text-green-500" />;
    }
    
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

  // Get item status
  const getItemStatus = (itemId, type) => {
    const isCompleted = userProgress?.completedItems?.includes(itemId);
    const isUnlocked = isItemUnlocked(itemId);
    const videoProgress = userProgress?.videoProgress?.[itemId]?.percentage || 0;
    
    if (isCompleted) return 'completed';
    if (!isUnlocked) return 'locked';
    if (type === 'video' && videoProgress > 0) return 'in-progress';
    return 'unlocked';
  };

  // Handle go to previous locked item
  const goToPreviousItem = () => {
    const prevItem = getPreviousItem();
    if (prevItem) {
      navigateToItem(prevItem.moduleIdx, prevItem.itemIdx);
    }
    setShowLockModal(false);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !currentItem) return <CourseLoader />;

  return (
    <>
      <LockModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onGoToPrevious={goToPreviousItem}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LeftArrowSVG className="w-5 h-5" />
            </button>
            
            <div className="flex-1 px-4">
              <h2 className="text-sm font-medium truncate">
                {currentItem.title || 'Course Content'}
              </h2>
              <div className="text-xs text-gray-500 truncate">
                Module {activeModuleIndex + 1} • Lesson {activeItemIndex + 1}
              </div>
            </div>
            
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="space-y-1">
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
              </div>
            </button>
          </div>
          
          {/* Mobile Progress Bar */}
          <div className="px-4 pb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Progress: {overallProgress}%
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {completedCount}/{totalItems}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Back Button */}
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors mb-2"
                >
                  <LeftArrowSVG className="w-4 h-4 mr-2" />
                  Back to Courses
                </button>
                
                {/* Course Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                  <h1 className="font-bold text-lg mb-2 line-clamp-2">
                    {courseData.title}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {courseData.shortDescription}
                  </p>
                  
                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-primary font-bold">
                        {overallProgress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300"
                        style={{ width: `${overallProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-center text-gray-500">
                      {completedCount} of {totalItems} lessons completed
                    </div>
                  </div>
                </div>
                
                {/* Course Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-bold text-lg">Course Content</h3>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                    {courseData?.modules?.map((module, moduleIdx) => (
                      <div key={module.moduleId} className="border-b dark:border-gray-700 last:border-b-0">
                        <button
                          onClick={() => setExpandedModule(expandedModule === moduleIdx ? null : moduleIdx)}
                          className={`w-full px-4 py-3 flex justify-between items-center transition-colors ${
                            activeModuleIndex === moduleIdx
                              ? 'bg-primary/5'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                          }`}
                        >
                          <div className="flex items-center flex-1">
                            <div className={`w-8 h-8 rounded-lg mr-3 flex items-center justify-center ${
                              module.items.every(item => 
                                userProgress?.completedItems?.includes(item.itemId)
                              ) 
                                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              <span className="font-medium">{moduleIdx + 1}</span>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-medium truncate">{module.title}</div>
                              <div className="text-xs text-gray-500">
                                {module.items.length} lessons
                              </div>
                            </div>
                          </div>
                          <DownArrowSVG 
                            className={`w-4 h-4 transition-transform flex-shrink-0 ${
                              expandedModule === moduleIdx ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        <AnimatePresence>
                          {expandedModule === moduleIdx && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gray-50/50 dark:bg-gray-900/50"
                            >
                              {module.items.map((item, itemIdx) => {
                                const status = getItemStatus(item.itemId, item.type);
                                const isActive = activeModuleIndex === moduleIdx && 
                                               activeItemIndex === itemIdx;
                                
                                return (
                                  <button
                                    key={item.itemId}
                                    onClick={() => navigateToItem(moduleIdx, itemIdx)}
                                    disabled={status === 'locked'}
                                    className={`w-full px-4 py-3 flex items-center text-left transition-colors border-l-4 ${
                                      isActive
                                        ? 'bg-primary/10 border-l-primary'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    } ${status === 'locked' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                  >
                                    <div className="flex items-center flex-1 min-w-0">
                                      <div className="mr-3">
                                        {status === 'locked' ? (
                                          <LockClosedSVG className="w-5 h-5 text-gray-400" />
                                        ) : (
                                          getItemIcon(item, status === 'completed')
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center">
                                          <span className={`font-medium truncate ${
                                            status === 'completed' 
                                              ? 'text-green-600 dark:text-green-400' 
                                              : ''
                                          }`}>
                                            {item.title || `${item.type} ${itemIdx + 1}`}
                                          </span>
                                          {isActive && (
                                            <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                              Now Playing
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                                          <span className="capitalize">{item.type}</span>
                                          {status === 'in-progress' && (
                                            <>
                                              <span className="mx-2">•</span>
                                              <span className="text-primary">
                                                {userProgress?.videoProgress?.[item.itemId]?.percentage}% watched
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {status === 'completed' && (
                                      <CheckCircleSVG className="w-5 h-5 text-green-500 flex-shrink-0" />
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
                <p className="text-gray-600 dark:text-gray-300">
                  {courseData.shortDescription}
                </p>
              </div>

              {/* Content Container */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm lg:shadow-md overflow-hidden">
                <div className="p-4 lg:p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeModuleIndex}-${activeItemIndex}`}
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
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                              Module {activeModuleIndex + 1}
                            </span>
                            {userProgress?.completedItems?.includes(currentItem.itemId) && (
                              <span className="text-xs font-medium px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full">
                                Completed
                              </span>
                            )}
                          </div>
                          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                            {currentItem.title || `Lesson ${activeItemIndex + 1}`}
                          </h2>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="hidden sm:block text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                            {currentItem.type}
                          </div>
                          {isSavingProgress && (
                            <div className="text-xs text-gray-500 animate-pulse">
                              Saving...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Content */}
                      {renderItemContent()}

                      {/* Navigation */}
                      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t dark:border-gray-700">
                        <button
                          onClick={async () => {
                            const prevItem = getPreviousItem();
                            if (prevItem) {
                              await navigateToItem(prevItem.moduleIdx, prevItem.itemIdx);
                            }
                          }}
                          disabled={!getPreviousItem()}
                          className="flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          <LeftArrowSVG className="w-4 h-4 mr-2" />
                          Previous Lesson
                        </button>

                        <button
                          onClick={async () => {
                            const nextItem = getNextItem();
                            if (nextItem) {
                              await navigateToItem(nextItem.moduleIdx, nextItem.itemIdx);
                            }
                          }}
                          disabled={!getNextItem()}
                          className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next Lesson
                          <RightArrowSVG className="w-4 h-4 ml-2" />
                        </button>
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
                transition={{ type: 'tween' }}
                className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden overflow-y-auto"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Course Content</h3>
                    <button
                      onClick={() => setShowMobileMenu(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {courseData.modules.map((module, moduleIdx) => (
                      <div key={module.moduleId} className="border-b dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                        <button
                          onClick={() => setExpandedModule(expandedModule === moduleIdx ? null : moduleIdx)}
                          className="w-full flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 mr-3 flex items-center justify-center">
                              <span className="font-medium">{moduleIdx + 1}</span>
                            </div>
                            <span className="font-medium text-left">{module.title}</span>
                          </div>
                          <DownArrowSVG 
                            className={`w-4 h-4 transition-transform ${
                              expandedModule === moduleIdx ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        {expandedModule === moduleIdx && (
                          <div className="mt-3 ml-11 space-y-2">
                            {module.items.map((item, itemIdx) => {
                              const status = getItemStatus(item.itemId, item.type);
                              const isActive = activeModuleIndex === moduleIdx && 
                                             activeItemIndex === itemIdx;
                              
                              return (
                                <button
                                  key={item.itemId}
                                  onClick={() => {
                                    navigateToItem(moduleIdx, itemIdx);
                                    setShowMobileMenu(false);
                                  }}
                                  disabled={status === 'locked'}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left ${
                                    isActive
                                      ? 'bg-primary/10 text-primary'
                                      : status === 'locked'
                                      ? 'opacity-60 cursor-not-allowed'
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  <div className="flex items-center flex-1 min-w-0">
                                    <div className="mr-3">
                                      {status === 'locked' ? (
                                        <LockClosedSVG className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        getItemIcon(item, status === 'completed')
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate text-sm">
                                        {item.title || `${item.type} ${itemIdx + 1}`}
                                      </div>
                                    </div>
                                  </div>
                                  {status === 'completed' && (
                                    <CheckCircleSVG className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                                  )}
                                </button>
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
    </>
  );
};

export default CoursePlayer;
