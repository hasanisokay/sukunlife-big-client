import SingleCoursePage from "@/components/courses/SingleCoursePage";
import NotFound from "@/components/not-found/NotFound";
import getCoursePublic from "@/utils/getCoursePublic.mjs";
import courseCover from "@/../public/images/course.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";

const singleCoursePage = async ({ params }) => {
  try {
    const p = await params;
    const courseId = p.courseId;
    let course = await getCoursePublic(courseId);
    if (course?.status === 200) {
      return <SingleCoursePage course={course?.course} />;
    } else return <NotFound />;
  } catch {
    return <NotFound />;
  }
};

export default singleCoursePage;

export async function generateMetadata({ params }) {
  try {
    const host = await hostname();
    const p = await params;
    const courseId = p.courseId;
    let courseData = await getCoursePublic(courseId);
    const course = courseData?.course;
    const courseCoverUrl = `${host}${courseCover.src}`;

    const description = course?.description
      ?.replace(/<[^>]+>/g, " ")
      .slice(0, 200);

    let metadata = {
      title: `${course?.title} - ${websiteName}`,
      description:
        course?.seoDescription ||
        description ||
        "Detailed description of the course.",
      keywords: ["সুকুনলাইফ কোর্স"],
      url: `${host}/courses/${courseId}`,
      canonical: `${host}/courses/${courseId}`,
    };
    if (course) {
      if (course?.tags?.length > 2) {
        const keywords = course?.tags.split(",");
        metadata.keywords.push(...keywords);
      } else {
        const titleKeywords = course?.title
          .split(" ")
          .filter((kw) => kw.length > 3);
        metadata.keywords.push(...titleKeywords);
      }
      metadata.other = {
        "twitter:image": course?.coverPhotoUrl || courseCoverUrl || "",
        "twitter:card": "summary_large_image",
        "twitter:title": metadata.title,
        "twitter:description": metadata.description,
        "og:title": metadata.title,
        "og:description": metadata.description,
        "og:url": `${host}/courses/${courseId}`,
        "og:image": course?.coverPhotoUrl || courseCoverUrl || "",
        "og:type": "website",
        "og:site_name": websiteName,
        "og:locale": "en_US",
      };
    }
    return metadata;
  } catch (error) {
    console.log("error occured")
  }


}
