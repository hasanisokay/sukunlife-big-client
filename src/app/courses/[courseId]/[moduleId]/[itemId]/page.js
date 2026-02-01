import CoursePlayer from '@/components/courses/CoursePlayer';
import getCourseWithProgress from '@/server-functions/course-related/getCourseWithProgress.mjs';

const Page = async ({ params }) => {
  try {
    const { courseId, moduleId, itemId } = await params;
    
    const data = await getCourseWithProgress(courseId);
    if (!data?.success || !data?.progress?.course) {
      return <div>Course not found</div>;
    }
    const { progress } = data;
    const {course, ...userProgress} = progress
    return (
      <CoursePlayer 
        course={course}
        progress={userProgress}
        currentModuleId={moduleId}
        currentItemId={itemId}
      />
    );
    
  } catch (error) {
    console.error('Error loading course:', error);
    return <div>Error loading course</div>;
  }
};

export default Page;