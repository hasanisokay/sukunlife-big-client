import CoursesPage from "@/components/courses/CoursesPage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import getAllCoursePublic from "@/utils/getAllCoursePublic.mjs";
import courseCover from "@/../public/images/course.jpg";
import { websiteName } from "@/constants/names.mjs";
import EmptyState from "@/components/shared/EmptyState";

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
  
    if (courses?.status !== 200)
      return (
        <EmptyState
          title="No courses yet"
          description="New courses are coming soon."
        />
      );
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

    const metadata = {
      title: `Online Courses - Learn with ${websiteName}`,
      description:
        "Discover quality online courses at Sukunlife. Learn new skills with expert-led training. Explore our course catalog now!",
      keywords: [
        "sukunlife courses",
        "online learning",
        "e-learning platform",
        "educational courses",
        "online training",
        "sukunlife",
        "learn online",
        "skill development",
        "course catalog",
      ],
      alternates: {
        canonical: `${host}/courses`,
      },
      openGraph: {
        title: `Online Courses - ${websiteName}`,
        description:
          "Explore our diverse range of online courses at Sukunlife. Start learning today with expert instructors!",
        url: `${host}/courses`,
        siteName: websiteName,
        images: [
          {
            url: courseCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Course Catalog`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Online Courses - ${websiteName}`,
        description:
          "Discover expert-led online courses at Sukunlife. Start your learning journey today!",
        images: [courseCoverUrl],
      },
    };

    return metadata;
  } catch (error) {
    console.error("Metadata generation failed:", error);
    // Return fallback metadata in case of error
    return {
      title: `Courses - ${websiteName}`,
      description: "Explore online courses at Sukunlife.",
      alternates: {
        canonical: `${await hostname()}/courses`,
      },
    };
  }
}
