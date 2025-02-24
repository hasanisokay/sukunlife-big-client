import UserSingleCoursePage from "@/components/dashboard/user/UserSingleCoursePage";
import Spinner from "@/components/loaders/Spinner";
import NotFound from "@/components/not-found/NotFound";
import getSingleCourseDetails from "@/utils/getSingleCourseDetails.mjs";
import { Suspense } from "react";

const page = async ({ params }) => {
  try {
    const p = await params;
    const courseId = p.courseId;
    const courseData = await getSingleCourseDetails(courseId);
    console.log(courseData)
    if (courseData.status === 200) {
      return <Suspense fallback={<Spinner />}>
        <UserSingleCoursePage course={courseData?.course} />
      </Suspense>;
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default page;
