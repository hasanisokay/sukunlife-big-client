import AdminDashboard from "@/components/dashboard/Admin/AdminDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";
import NotFound from "@/components/not-found/NotFound";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";
import dashboardCover from "@/../public/images/dashboard.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";

const dashboardPage = async () => {
  try {
    const user = await getUserDataFromToken();
    if (user?.role === "admin") return <AdminDashboard />;
    else if (user?.role === "user") return <UserDashboard />;
    else return null;
  } catch {
    return <NotFound />;
  }
};

export default dashboardPage;

export async function generateMetadata() {
  try {
    const host = await hostname();
    const dashboardCoverUrl = `${host}${dashboardCover.src}`;
    let metadata = {
      title: `Dashboard - ${websiteName}`,
      description: "User dashboard.",
      keywords: ["Dashboard, sukunlife,"],
      url: `${host}/dashboard`,
      canonical: `${host}/dashboard`,
    };
    metadata.other = {
      "twitter:image": dashboardCoverUrl || "",
      "twitter:card": "summary_large_image",
      "twitter:title": metadata.title,
      "twitter:description": metadata.description,
      "og:title": metadata.title,
      "og:description": metadata.description,
      "og:url": `${host}/dashboard`,
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
