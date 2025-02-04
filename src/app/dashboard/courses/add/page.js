import AddCourse from "@/components/dashboard/Admin/courses/AddCourse";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
const page = () => {
  return <AddCourse />;
};

export default page;


export async function generateMetadata() {
  try {
    const host = await hostname();
    let metadata = {
      title: `Add Course - ${websiteName}`,
      description: "Add course.",
      keywords: ["Dashboard, sukunlife,"],
      url: `${host}/dashboard/courses/add`,
      canonical: `${host}/dashboard/courses/add`,
    };

    return metadata;
  } catch (error) {
    console.error("Error fetching blog metadata:", error);
  }
}