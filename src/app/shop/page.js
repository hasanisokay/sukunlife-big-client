import AllShopItems from "@/components/dashboard/Admin/shop/AllShopItems";
import NotFound from "@/components/not-found/NotFound";
import SearchBar from "@/components/search/SearchBar";
import hostname from "@/constants/hostname.mjs";
import getAllProducts from "@/utils/getAllProducts.mjs";
import shopCover from "@/../public/images/shop.jpg";
import { websiteName } from "@/constants/names.mjs";

export const revalidate = 360;

const shopPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 5;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const tags = s?.tags || "";
    const skip = "";
    const category = s?.category || "";

    const products = await getAllProducts(
      page,
      limit,
      keyword,
      tags,
      sort,
      skip,
      category
    );

    if (products.status === 200 && products.products.length === 0)
      return (
        <div className="mt-10">
          <SearchBar placeholder={"Search for products"}/>
          <p className="text-center">No Product found</p>
        </div>
      );
    if (products?.status !== 200) return <NotFound />;
    return (
      <AllShopItems p={products?.products} totalCount={products.totalCount} />
    );
  } catch {
    return <NotFound />;
  }
};

export default shopPage;


export async function generateMetadata() {
  try {
    const host = await hostname();
    const shopCoverUrl = `${host}${shopCover.src}`;

    const metadata = {
      title: `Shop Products`,
      description:
        "Browse premium products at Sukunlife. Discover our curated shop collection today!",
      keywords: [
        "sukunlife shop",
        "online shopping",
        "products",
        "e-commerce",
        "buy online",
        "shop catalog",
        "sukunlife products",
      ],
      alternates: {
        canonical: `${host}/shop`,
      },
      openGraph: {
        title: `Shop - ${websiteName}`,
        description:
          "Explore quality products in the Sukunlife shop. Start shopping now!",
        url: `${host}/shop`,
        siteName: websiteName,
        images: [
          {
            url: shopCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Shop Collection`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Shop - ${websiteName}`,
        description:
          "Discover top products at Sukunlife. Shop our collection now!",
        images: [shopCoverUrl],
      },
    };

    // Remove duplicate keywords and ensure relevance
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Shop metadata generation failed:", error);
    const host = await hostname(); // Ensure host is available in fallback
    return {
      title: `Shop - ${websiteName}`,
      description: "Explore products at Sukunlife's online shop.",
      alternates: {
        canonical: `${host}/shop`,
      },
    };
  }
}