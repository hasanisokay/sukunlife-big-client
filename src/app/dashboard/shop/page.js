import NotFound from "@/components/not-found/NotFound";
import dashboardCover from "@/../public/images/dashboard.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import ManageProducts from "@/components/dashboard/Admin/shop/ManageProducts";
import getAllProducts from "@/utils/getAllProducts.mjs";

const page = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 1000;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const tags = s?.tags || "";
    const skip = '';
    const category = s?.category || "";

    const products = await getAllProducts(page, limit, keyword, tags, sort, skip, category);

    if (products?.status !== 200) return <NotFound />;

    return (
      <section>
        <ManageProducts p={products?.products} totalCount={products?.totalCount} />
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
      title: `Products - ${websiteName}`,
      description: "All shop.",
      keywords: ["Dashboard, sukunlife,"],
      url: `${host}/dashboard/shop`,
      canonical: `${host}/dashboard/shop`,
    };
    metadata.other = {
      "twitter:image": dashboardCoverUrl || "",
      "twitter:card": "summary_large_image",
      "twitter:title": metadata.title,
      "twitter:description": metadata.description,
      "og:title": metadata.title,
      "og:description": metadata.description,
      "og:url": `${host}/dashboard/shop`,
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