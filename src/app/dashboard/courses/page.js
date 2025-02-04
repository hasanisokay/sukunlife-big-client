import ManageCourses from "@/components/dashboard/Admin/courses/ManageCourses";
import NotFound from "@/components/not-found/NotFound";
import getAllCourse from "@/utils/getAllCourse.mjs";
import dashboardCover from "@/../public/images/dashboard.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";

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

export async function generateMetadata() {
  try {
    const host = await hostname();
    const dashboardCoverUrl = `${host}${dashboardCover.src}`;
    let metadata = {
      title: `Courses - ${websiteName}`,
      description: "All courses.",
      keywords: ["Dashboard, sukunlife,"],
      url: `${host}/dashboard/courses`,
      canonical: `${host}/dashboard/courses`,
    };
    metadata.other = {
      "twitter:image": dashboardCoverUrl || "",
      "twitter:card": "summary_large_image",
      "twitter:title": metadata.title,
      "twitter:description": metadata.description,
      "og:title": metadata.title,
      "og:description": metadata.description,
      "og:url": `${host}/dashboard/courses`,
      "og:image": dashboardCoverUrl || "",
      "og:type": "article",
      "og:site_name": websiteName,
      "og:locale": "bn_BD",
    };
    return metadata;
  } catch (error) {
    console.error("Error fetching blog metadata:", error);
  }
}