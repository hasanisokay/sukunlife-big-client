'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import {
  CertificateSVG,
  ClipboardSVG,
  DownArrowSVG,
  LeftArrowSVG,
  QuizSVG,
  RightArrowSVG,
  VideoSVG,
} from '@/components/svg/SvgCollection';
import { SERVER } from '@/constants/urls.mjs';
import BlogContent from '@/components/blogs/BlogContnet';
import { setEnrolledCourses } from '@/store/slices/authSlice';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const UserSingleCoursePage = ({ course }) => {
  const router = useRouter();
  const enrolledCourses = useSelector((state) => state.user.enrolledCourses);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [progress, setProgress] = useState({ percentage: 0 });
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [expandedModule, setExpandedModule] = useState(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();
  // Initialize progress
  useEffect(() => {
    const enrollment = enrolledCourses.find((c) => c.courseId === course._id);
    if (enrollment) {
      setProgress(enrollment.lastSync);
      setActiveModuleIndex(enrollment.lastSync.module);
      setActiveItemIndex(enrollment.lastSync.item);
      setExpandedModule(enrollment.lastSync.module);
    }
  }, [enrolledCourses, course._id]);

  const currentModule = course.modules[activeModuleIndex];
  const currentItem = currentModule.items[activeItemIndex];
  const totalItems = course.modules.reduce((acc, module) => acc + module.items.length, 0);

  // Group consecutive quizzes
  const groupConsecutiveQuizzes = (items) => {
    const groups = [];
    let currentGroup = [];

    items.forEach((item, index) => {
      if (item.type === 'quiz') {
        currentGroup.push({ ...item, originalIndex: index });
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
        groups.push([{ ...item, originalIndex: index }]);
      }
    });

    if (currentGroup.length > 0) groups.push(currentGroup);
    return groups;
  };

  const itemGroups = groupConsecutiveQuizzes(currentModule.items);
  const currentGroup = itemGroups.find((group) =>
    group.some((item) => item.originalIndex === activeItemIndex)
  );

  const calculatePercentage = (moduleIdx, itemIdx) => {
    let count = 0;
    for (let i = 0; i < moduleIdx; i++) count += course.modules[i].items.length;
    return Math.round(((count + itemIdx + 1) / totalItems) * 100);
  };

  const saveProgress = async (moduleIdx, itemIdx) => {
    const newPercentage = calculatePercentage(moduleIdx, itemIdx);
    if (newPercentage <= progress.percentage) return;
    try {
      await fetch(`${SERVER}/api/user/update-progress`, {
        method: 'PUT',
        body: JSON.stringify({
          module: moduleIdx,
          courseId: course._id,
          item: itemIdx,
          percentage: newPercentage,
        }),
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include'
      });
      const newProgressData = enrolledCourses.map(c =>
        c._id === course._id
          ? { ...c, module: moduleIdx, item: itemIdx, percentage: newPercentage }
          : c
      );
      dispatch(setEnrolledCourses(newProgressData));
      // setProgress({ module: moduleIdx, item: itemIdx, percentage: newPercentage });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleItemSelect = (moduleIdx, itemIdx) => {
    setActiveModuleIndex(moduleIdx);
    setActiveItemIndex(itemIdx);
    setCurrentQuizIndex(0);
    setQuizCompleted(false);
    saveProgress(moduleIdx, itemIdx);
  };

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));

    if (currentQuizIndex < currentGroup.length - 1) {
      setTimeout(() => {
        setCurrentQuizIndex((prev) => prev + 1);
      }, 300);
    } else {
      setQuizCompleted(true);
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'video':
        return <VideoSVG height={'20px'} width={'20px'} classes={'mr-1'} />;
      case 'quiz':
        return <QuizSVG height={'20px'} width={'20px'} classes={'mr-1'} />;
      default:
        return <ClipboardSVG height={'20px'} width={'20px'} classes={'mr-1'} />;
    }
  };

  const renderQuizResults = () => {
    return currentGroup.map((item, idx) => {
      const userAnswer = selectedAnswers[idx];
      const isCorrect = userAnswer === item.answer;
      return (
        <div key={idx} className="mb-4">
          <p className="font-medium">{item.question}</p>
          <div className="mt-2">
            <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              Your answer: {item.options[userAnswer]}
            </p>
            {!isCorrect && (
              <p className="text-sm text-green-600">Correct answer: {item.options[item.answer]}</p>
            )}
          </div>
        </div>
      );
    });
  };

  const handleNextAfterQuiz = (quizLength) => {
    const nextItemIndex = activeItemIndex + quizLength;

    // Check if the next item is within the current module
    if (nextItemIndex < currentModule.items.length) {
      // Reset quiz state and navigate to the next item
      setCurrentQuizIndex(0);
      setQuizCompleted(false);
      setSelectedAnswers({});
      handleItemSelect(activeModuleIndex, nextItemIndex);
    } else {
      // Move to the next module if available
      const nextModuleIndex = activeModuleIndex + 1;
      if (nextModuleIndex < course.modules.length) {
        // Reset quiz state and navigate to the first item of the next module
        setCurrentQuizIndex(0);
        setQuizCompleted(false);
        setSelectedAnswers({});
        setExpandedModule(nextModuleIndex); // Expand the next module
        handleItemSelect(nextModuleIndex, 0);
      }
    }
  };
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null
  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen ">
      <div className="max-w-7xl mx-auto  py-4">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.back()}
          className="mb-4 flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          <LeftArrowSVG width={'20px'} height={'20px'} classes={'mr-2'} /> Back to Courses
        </motion.button>

        {/* Progress Bar */}
        <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <motion.div
              className="h-2 bg-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {progress.percentage}% Complete
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeModuleIndex}-${activeItemIndex}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={itemVariants}
                className="space-y-4"
              >
                {/* Video or Text Content */}
                {currentItem.type !== 'quiz' && (
                  <>
                    {currentItem.type === 'video' && (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <ReactPlayer
                          key={currentItem.url} // Force re-render on video change
                          // url={currentItem.url}
                          url={`${currentItem.url}?cc_load_policy=0`}
                          width="100%"
                          height="100%"
                          controls
                          playsinline
                          playing={true}
                          onEnded={() => {
                            if (activeItemIndex < currentModule.items.length - 1) {
                              handleItemSelect(activeModuleIndex, activeItemIndex + 1); // Move to next item in the same module
                            } else if (activeModuleIndex < course.modules.length - 1) {
                              setExpandedModule(activeModuleIndex + 1); // Expand next module
                              handleItemSelect(activeModuleIndex + 1, 0); // Move to first item of next module
                            }
                          }}
                        />
                      </div>
                    )}

                    {currentItem.type === 'textInstruction' && (
                      <div
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow prose dark:prose-invert">
                        <BlogContent content={currentItem?.content} />
                      </div>

                    )}

                    {/* Navigation for Videos/Text */}
                    <div className="flex justify-between">
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        onClick={() => handleItemSelect(activeModuleIndex, activeItemIndex - 1)}
                        disabled={activeItemIndex === 0 && activeModuleIndex === 0}
                      >
                        <LeftArrowSVG width={'14px'} height={'14px'} classes={'mr-1'} /> Previous
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        onClick={() => {
                          if (activeItemIndex < currentModule.items.length - 1) {
                            handleItemSelect(activeModuleIndex, activeItemIndex + 1);
                          } else if (activeModuleIndex < course.modules.length - 1) {
                            setExpandedModule(activeModuleIndex + 1); // Expand the next module
                            handleItemSelect(activeModuleIndex + 1, 0);
                          }
                        }}
                        disabled={
                          activeItemIndex === currentModule.items.length - 1 &&
                          activeModuleIndex === course.modules.length - 1
                        }
                      >
                        Next <RightArrowSVG width={'14px'} height={'14px'} classes={'ml-1'} />
                      </button>
                    </div>
                  </>
                )}

                {/* Quiz Section */}
                {currentGroup?.[0]?.type === 'quiz' && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    {!quizCompleted ? (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <button
                            className="flex text-sm items-center gap-2 px-2 md:px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                            onClick={() => setCurrentQuizIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentQuizIndex === 0}
                          >
                            <LeftArrowSVG width={'14px'} height={'14px'} /> Previous
                          </button>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {currentQuizIndex + 1} of {currentGroup.length}
                          </div>
                          <button
                            className="flex text-sm items-center gap-2 px-2 md:px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                            onClick={() =>
                              setCurrentQuizIndex((prev) => Math.min(currentGroup.length - 1, prev + 1))
                            }
                            disabled={currentQuizIndex === currentGroup.length - 1}
                          >
                            Next <RightArrowSVG width={'14px'} height={'14px'} classes={'mr-1'} />
                          </button>
                        </div>

                        <h3 className="text-xl font-bold mb-4">
                          {currentGroup[currentQuizIndex].question}
                        </h3>

                        <div className="space-y-3">
                          {currentGroup[currentQuizIndex].options.map((option, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.02 }}
                              className={`w-full p-3 rounded text-left ${selectedAnswers[currentQuizIndex] === idx
                                ? 'bg-blue-100 dark:bg-blue-900'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              onClick={() => handleQuizAnswer(currentQuizIndex, idx)}
                            >
                              {option}
                            </motion.button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mt-4 p-4 bg-green-100 dark:bg-gray-900 rounded-lg">
                          <h4 className="font-bold mb-4">Quiz Results:</h4>
                          {renderQuizResults()}
                        </div>
                        <button
                          className="w-full mt-4 px-4 flex items-center justify-center py-2 bg-blue-600 text-white rounded-lg"
                          onClick={() => handleNextAfterQuiz(currentGroup?.length || 1)}
                        >
                          Next <RightArrowSVG width={'14px'} height={'14px'} classes={'mr-1'} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Modules Sidebar */}
          <div className="lg:w-1/4 md:h-auto h-[calc(100vh-408px)] overflow-auto bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-lg shadow lg:order-last">
            <h2 className="text-xl font-bold mb-4">Modules</h2>
            <div className="space-y-2">
              {course.modules.map((module, moduleIdx) => {
                const quizGroups = groupConsecutiveQuizzes(module.items);
                return (
                  <div key={moduleIdx} className="rounded-lg overflow-hidden">
                    <button
                      className={`w-full p-2 sm:p-3 flex justify-between items-center ${activeModuleIndex === moduleIdx
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      onClick={() => setExpandedModule(expandedModule === moduleIdx ? null : moduleIdx)}
                    >
                      <span>{module.title}</span>
                      <DownArrowSVG
                        classes={`w-5 h-5 transform transition-transform ${expandedModule === moduleIdx ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedModule === moduleIdx && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 space-y-2"
                        >
                          {quizGroups.map((group, groupIdx) => (
                            <button
                              key={groupIdx}
                              className={`w-full text-left p-2 rounded flex items-center text-sm ${activeItemIndex === group[0].originalIndex
                                ? 'bg-blue-50 dark:bg-blue-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                              onClick={() => handleItemSelect(moduleIdx, group[0].originalIndex)}
                            >
                              <span>{getItemIcon(group[0].type)}</span>
                              {group[0].type === 'quiz'
                                ? `Quiz (${group.length})`
                                : group[0].title}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSingleCoursePage;