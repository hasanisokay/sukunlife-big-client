import AdminBlogsPage from "@/components/dashboard/Admin/blogs/AdminBlogsPage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import getAllBlogAdmin from "@/utils/getAllBlogAdmin.mjs";
import dashboardCover from "@/../public/images/dashboard.jpg";

const adminBlogsPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 100;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const tags = s?.tags || "";
    const blogs = await getAllBlogAdmin(page, limit, keyword, tags, sort);
    return (
      <>
        <AdminBlogsPage blogs={blogs?.blogs} />
      </>
    );
  } catch {
    return <NotFound />;
  }
};

export default adminBlogsPage;

export async function generateMetadata() {
  try {
    const host = await hostname();
    const dashboardCoverUrl = `${host}${dashboardCover.src}`;
    let metadata = {
      title: `All Blog - ${websiteName}`,
      description: "All Blogs.",
      keywords: ["Dashboard, sukunlife,"],
      url: `${host}/dashboard/blogs`,
      canonical: `${host}/dashboard/blogs`,
    };
    metadata.other = {
      "twitter:image": dashboardCoverUrl || "",
      "twitter:card": "summary_large_image",
      "twitter:title": metadata.title,
      "twitter:description": metadata.description,
      "og:title": metadata.title,
      "og:description": metadata.description,
      "og:url": `${host}/dashboard/blogs`,
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
