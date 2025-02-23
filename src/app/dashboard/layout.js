import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
import NotFound from "@/components/not-found/NotFound";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";
import dashboardCover from "@/../public/images/dashboard.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import UserSidebar from "@/components/dashboard/user/UserSidebar";

const dashboardLayout = async ({ children }) => {
  try {
    const user = await getUserDataFromToken();
    if (user?.role === "admin") {
      return (
        <div className="flex">
          <AdminSidebar />
          {children}
        </div>
      );
    }
    if (user?.role === "user") {
      return <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <UserSidebar />
        <main className="flex-1 md:p-8 p-1 overflow-x-auto">{children}</main>
      </div>;
    }
    // return children;
  } catch {
    return <NotFound />;
  }
};

export default dashboardLayout;

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
      "og:type": "website",
      "og:site_name": websiteName,
      "og:locale": "en_US",
    };
    return metadata;
  } catch (error) {
    console.error("Error fetching blog metadata:", error);
  }
}
