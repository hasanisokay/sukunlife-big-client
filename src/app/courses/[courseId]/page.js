import SingleCoursePage from "@/components/courses/SingleCoursePage";
import NotFound from "@/components/not-found/NotFound";
import getCoursePublic from "@/utils/getCoursePublic.mjs";
import courseCover from "@/../public/images/course.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";

export const revalidate = 3600;

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
    const courseData = await getCoursePublic(courseId);
    const course = courseData?.course;
    const courseCoverUrl = `${host}${courseCover.src}`;

    // Fallback description with HTML stripped and limited to 160 characters
    const fallbackDescription = course?.description
      ?.replace(/<[^>]+>/g, " ")
      .slice(0, 160)
      .trim() || "Learn with this expertly designed course at Sukunlife.";

    const metadata = {
      title: `${course?.title || "Course"}`,
      description:
        course?.seoDescription ||
        fallbackDescription ||
        "Explore this comprehensive course at Sukunlife to enhance your skills.",
      keywords: [
        "sukunlife course",
        "online course",
        "e-learning",
        "skill development",
        ...(course?.title?.split(" ").filter(kw => kw.length > 3) || []),
      ],
      alternates: {
        canonical: `${host}/courses/${courseId}`,
      },
      openGraph: {
        title: `${course?.title || "Course"} - ${websiteName}`,
        description:
          course?.seoDescription ||
          fallbackDescription ||
          "Join this Sukunlife course to master new skills with expert guidance.",
        url: `${host}/courses/${courseId}`,
        siteName: websiteName,
        images: [
          {
            url: course?.coverPhotoUrl || courseCoverUrl,
            width: 1200,
            height: 630,
            alt: `${course?.title || "Course"} Cover Image`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${course?.title || "Course"} - ${websiteName}`,
        description:
          course?.seoDescription ||
          fallbackDescription ||
          "Discover this Sukunlife course for expert-led learning.",
        images: [course?.coverPhotoUrl || courseCoverUrl],
      },
    };

    // Enhance keywords with course tags if available
    if (course?.tags?.length > 0) {
      const tagKeywords = course.tags.split(",").map(tag => tag.trim());
      metadata.keywords.push(...tagKeywords);
    }

    // Remove duplicates from keywords and limit to reasonable length
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Failed to generate course metadata:", error);
    // Fallback metadata
    const host = await hostname();
    return {
      title: `Course - ${websiteName}`,
      description: "Explore this course at Sukunlife.",
      alternates: {
        canonical: `${host}/courses/${p?.courseId || ""}`,
      },
    };
  }
}