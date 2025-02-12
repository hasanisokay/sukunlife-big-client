import SingleProductPage from "@/components/dashboard/Admin/shop/SingleProductPage";
import NotFound from "@/components/not-found/NotFound";
import getSingleProduct from "@/utils/getSingleProduct.mjs";
import productCover from "@/../public/images/product.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
const page = async ({ params }) => {
  try {
    const p = await params;
    const productId = p.id;
    let product = await getSingleProduct(productId);
    if (product?.status === 200) {
      return <SingleProductPage product={product?.product} />;
    } else return <NotFound />;
  } catch {
    return <NotFound />;
  }
};

export default page;
export async function generateMetadata({ params }) {
  try {
    const host = await hostname();
    const p = await params;
    const productId = p.id;
    let productData = await getSingleProduct(productId);
    if (productData?.status === 200) {
      const product = productData?.product;
      const productCoverPhoto = `${host}${productCover.src}`;
      const description = product?.description
        ?.replace(/<[^>]+>/g, " ")
        .slice(0, 200);

      let metadata = {
        title: `${product?.title} - ${websiteName}`,
        description: description || "Detailed description of the product.",
        keywords: ["সুকুনলাইফ", "sukunlife"],
        url: `${host}/shop/${productId}`,
        canonical: `${host}/shop/${productId}`,
      };
      if (product) {
        if (product?.tags?.length > 2) {
          const keywords = product?.tags.split(",");
          metadata.keywords.push(...keywords);
        } else {
          const titleKeywords = product?.title
            .split(" ")
            .filter((kw) => kw.length > 3);
          metadata.keywords.push(...titleKeywords);
        }
        metadata.other = {
          "twitter:image":
            product?.images?.length > 0 ? product.images[0] : productCoverPhoto,
          "twitter:card": "summary_large_image",
          "twitter:title": metadata.title,
          "twitter:description": metadata.description,
          "og:title": metadata.title,
          "og:description": metadata.description,
          "og:url": `${host}/shop/${productId}`,
          "og:image":
            product?.images?.length > 0 ? product.images[0] : productCoverPhoto,
          "og:type": "website",
          "og:site_name": websiteName,
          "og:locale": "en_US",
        };
      }
      return metadata;
    } else {
      let metadata = {
        title: `Product Not Found - ${websiteName}`,
        description: "Detailed description of the product.",
        keywords: ["সুকুনলাইফ", "sukunlife"],
        url: `${host}/shop/${productId}`,
        canonical: `${host}/shop/${productId}`,
      };
      return metadata;
    }
  } catch (error) {
    console.error("Error fetching blog metadata:", error);
  }
}
