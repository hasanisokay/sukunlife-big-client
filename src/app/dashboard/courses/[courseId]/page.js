import EditCourse from "@/components/dashboard/Admin/courses/EditCourse";
import NotFound from "@/components/not-found/NotFound";
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
