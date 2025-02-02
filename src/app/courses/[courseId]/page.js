import SingleCoursePage from "@/components/courses/SingleCoursePage";
import NotFound from "@/components/not-found/NotFound";
import getCoursePublic from "@/utils/getCoursePublic.mjs";

const singleCoursePage = async ({ params }) => {
  try {
    const p = await params;
    const courseId = p.courseId;
    const course = await getCoursePublic(courseId);
    if (course?.status === 200) {
      return <SingleCoursePage course={course?.course} />;
    } else return <NotFound />;
  } catch {
    return <NotFound />;
  }
};

export default singleCoursePage;
