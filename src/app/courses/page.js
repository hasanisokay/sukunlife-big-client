import CoursesPage from "@/components/courses/CoursesPage";
import NotFound from "@/components/not-found/NotFound";
import getAllCoursePublic from "@/utils/getAllCoursePublic.mjs";

const coursesPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 50;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const tags = s?.tags || "";
    const skip = 0;

    const courses = await getAllCoursePublic(
      page,
      limit,
      keyword,
      tags,
      sort,
      skip
    );
    if (courses?.status !== 200) return <NotFound />;
    return <CoursesPage courses={courses} page={page} />;
  } catch {
    return <NotFound />;
  }
};

export default coursesPage;
