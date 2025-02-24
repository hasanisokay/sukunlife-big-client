import CoursesPage from "@/components/courses/CoursesPage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import getAllCoursePublic from "@/utils/getAllCoursePublic.mjs";
import courseCover from "@/../public/images/course.jpg";
import { websiteName } from "@/constants/names.mjs";

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

export async function generateMetadata() {
  try {
    const host = await hostname();
    const courseCoverUrl = `${host}${courseCover.src}`;
    let metadata = {
      title: `Courses - ${websiteName}`,
      description: "Explore sukunlife courses.",
      keywords: ["সুকুনলাইফ কোর্স, sukunlife, courses"],
      url: `${host}/courses`,
      canonical: `${host}/courses`,
    };
    metadata.other = {
      "twitter:image": courseCoverUrl || "",
      "twitter:card": "summary_large_image",
      "twitter:title": metadata.title,
      "twitter:description": metadata.description,
      "og:title": metadata.title,
      "og:description": metadata.description,
      "og:url": `${host}/courses`,
      "og:image": courseCoverUrl || "",
      "og:type": "article",
      "og:site_name": websiteName,
      "og:locale": "bn_BD",
    };
    return metadata;
  } catch (error) {
    console.log("error occured")
  }
}
