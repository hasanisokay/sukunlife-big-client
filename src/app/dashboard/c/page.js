import UserCoursePage from "@/components/dashboard/user/UserCoursePage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import getEnrolledCoursesDetails from "@/utils/getUserEnrolledCoursesDetails.mjs";

const userCoursePage = async () => {
  try {
    let courses;
    courses = await getEnrolledCoursesDetails();
    if (courses?.status === 200) {
      return (
        <>
          <UserCoursePage courses={courses?.courses} />
        </>
      );
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default userCoursePage;

export async function generateMetadata() {
    try {
      const host = await hostname();
      let metadata = {
        title: `My Courses - ${websiteName}`,
        description: "All enrolled courses.",
        keywords: ["Dashboard, sukunlife, courses"],
        url: `${host}/dashboard/blogs`,
        canonical: `${host}/dashboard/blogs`,
      };
      return metadata;
    } catch (error) {
      console.error("Error fetching blog metadata:", error);
    }
  }