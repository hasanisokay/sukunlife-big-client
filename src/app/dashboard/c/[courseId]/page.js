import UserSingleCoursePage from "@/components/dashboard/user/UserSingleCoursePage";
import NotFound from "@/components/not-found/NotFound";
import getSingleCourseDetails from "@/utils/getSingleCourseDetails.mjs";

const page = async ({ params }) => {
  try {
    const p = await params;
    const courseId = p.courseId;
    const courseData = await getSingleCourseDetails(courseId);
    if (courseData.status === 200) {
      return <UserSingleCoursePage course={courseData?.course} />;
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default page;
