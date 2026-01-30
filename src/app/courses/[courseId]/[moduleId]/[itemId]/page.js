import CoursePlayer from '@/components/courses/CoursePlayer';
import getCourseWithProgress from '@/server-functions/course-related/getCourseWithProgress.mjs';

const Page = async ({ params }) => {
  try {
    const { courseId, moduleId, itemId } = await params;
    
    // Get course with progress
    const data = await getCourseWithProgress(courseId);
    if (!data?.success || !data?.progress?.course) {
      console.error('No course data found');
    }
    
    const { progress } = data;
    const course = progress.course; 
    
    let targetModuleIndex = 0;
    let targetItemIndex = 0;
    let found = false;
    
    if (moduleId && itemId) {
      course?.modules?.forEach((module, mIdx) => {
        if (module?.moduleId === moduleId) {
          module?.items?.forEach((item, iIdx) => {
            if (item.itemId === itemId) {
              targetModuleIndex = mIdx;
              targetItemIndex = iIdx;
              found = true;
            }
          });
        }
      });
    }
    
    if (!found) {
      if (progress?.currentItem) {
        // Try to find current item from progress
        course?.modules?.forEach((module, mIdx) => {
          module?.items?.forEach((item, iIdx) => {
            if (item.itemId === progress.currentItem) {
              targetModuleIndex = mIdx;
              targetItemIndex = iIdx;
              found = true;
            }
          });
        });
      }
      
      if (!found) {
        // Default to first item
        targetModuleIndex = 0;
        targetItemIndex = 0;
      }
    }
    
    return (
      <CoursePlayer 
        course={course} 
        progress={progress}
        initialModuleIndex={targetModuleIndex}
        initialItemIndex={targetItemIndex}
      />
    );
    
  } catch (error) {
    console.error('Error loading course:', error);
  }
};

export default Page;