import UserSingleCoursePage from "@/components/dashboard/user/UserSingleCoursePage";
import Spinner from "@/components/loaders/Spinner";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import getSingleCourseDetails from "@/utils/getSingleCourseDetails.mjs";
import { Suspense } from "react";

const page = async ({ params }) => {
  try {
    const p = await params;
    const courseId = p.courseId;
    const courseData = await getSingleCourseDetails(courseId);
    if (courseData?.status === 200) {
      return (
        <Suspense fallback={<Spinner />}>
          <UserSingleCoursePage course={courseData?.course} />
        </Suspense>
      );
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default page;

export async function generateMetadata({ params }) {
  const p = await params;
  const courseId = p.courseId;
  const courseData = await getSingleCourseDetails(courseId);
  let course;
  if (courseData?.status === 200) {
    course = courseData.course;
  }
  try {
    const host = await hostname();
    let metadata = {
      title: `My Courses`,
      description: "Enrolled course.",
      keywords: ["Dashboard, sukunlife, courses"],
      url: `${host}/dashboard/c/${courseId}`,
      canonical: `${host}/dashboard/c/${courseId}`,
    };
    if (course) {
      metadata.title = course.title;
    }
    return metadata;
  } catch (error) {
    console.log("error occured");
  }
}
