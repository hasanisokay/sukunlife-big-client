import ManageCourses from "@/components/dashboard/Admin/courses/ManageCourses";
import NotFound from "@/components/not-found/NotFound";
import getAllCourse from "@/utils/getAllCourse.mjs";

const page = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 1000;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const tags = s?.tags || "";
    const skip = 0;

    const courses = await getAllCourse(page, limit, keyword, tags, sort, skip);

    if (courses?.status !== 200) return <NotFound />;

    return (
      <section>
        <ManageCourses courses={courses} />
      </section>
    );
  } catch {
    return <NotFound />;
  }
};

export default page;
