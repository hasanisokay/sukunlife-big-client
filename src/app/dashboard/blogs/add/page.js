import AdminAddBlogPage from '@/components/dashboard/Admin/blogs/AdminAddBlogPage';
import dashboardCover from "@/../public/images/dashboard.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
const addBlogPage = () => {
    return <AdminAddBlogPage />
};

export default addBlogPage;

export async function generateMetadata() {
    try {
      const host = await hostname();
      const dashboardCoverUrl = `${host}${dashboardCover.src}`;
      let metadata = {
        title: `Add Blog - ${websiteName}`,
        description: "All Blogs.",
        keywords: ["Dashboard, sukunlife,"],
        url: `${host}/dashboard/blogs/add`,
        canonical: `${host}/dashboard/blogs/add`,
      };
      metadata.other = {
        "twitter:image": dashboardCoverUrl || "",
        "twitter:card": "summary_large_image",
        "twitter:title": metadata.title,
        "twitter:description": metadata.description,
        "og:title": metadata.title,
        "og:description": metadata.description,
        "og:url": `${host}/dashboard/blogs/add`,
        "og:image": dashboardCoverUrl || "",
        "og:type": "website",
        "og:site_name": websiteName,
        "og:locale": "bn_BD",
      };
      return metadata;
    } catch (error) {
      console.error("Error fetching blog metadata:", error);
    }
  }