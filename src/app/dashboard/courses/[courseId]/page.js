import EditCourse from "@/components/dashboard/Admin/courses/EditCourse";
import NotFound from "@/components/not-found/NotFound";
import { websiteName } from "@/constants/names.mjs";
import getCourse from "@/utils/getCourse.mjs";

const editCoursePage = async ({ params }) => {
  try {
    const p = await params;
    const courseId = p.courseId;
    const course = await getCourse(courseId);
    if (course?.status !== 200) return <NotFound />;
    return (
      <section>
        <EditCourse course={course?.course} />
      </section>
    );
  } catch {
    return <NotFound />;
  }
};

export default editCoursePage;


export async function generateMetadata() {
  try {
    let metadata = {
      title: `Edit Course - ${websiteName}`,
      description: "Edit courses.",
      keywords: ["Dashboard, Edit Course, sukunlife,"],
    };

    return metadata;
  } catch (error) {
    console.log("error occured")
  }
}
