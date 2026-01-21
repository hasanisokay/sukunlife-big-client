import SingleProductPage from "@/components/dashboard/Admin/shop/SingleProductPage";
import NotFound from "@/components/not-found/NotFound";
import getSingleProduct from "@/utils/getSingleProduct.mjs";
import productCover from "@/../public/images/product.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import EmptyState from "@/components/shared/EmptyState";



const page = async ({ params }) => {
  try {
    const p = await params;
    const productId = p.id;
    let product = await getSingleProduct(productId);
    if (product?.status === 200) {
      return <SingleProductPage product={product?.product} />;
    } else return <EmptyState description="Maybe the link is broken or product is removed."  />;
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
    const productData = await getSingleProduct(productId);
    const product = productData?.status === 200 ? productData.product : null;
    const productCoverPhoto = `${host}${productCover.src}`;

    const fallbackDescription = product?.description
      ?.replace(/<[^>]+>/g, " ")
      .slice(0, 160)
      .trim() || "Shop this product at Sukunlife.";

    const metadata = {
      title: `${product?.title || "Product"}`,
      description:
        product?.seoDescription ||
        fallbackDescription ||
        "Discover this premium product at Sukunlife. Shop now!",
      keywords: [
        "sukunlife product",
        "online shopping",
        "e-commerce",
        ...(product?.title?.split(" ").filter(kw => kw.length > 3) || []),
      ],
      alternates: {
        canonical: `${host}/shop/${productId}`,
      },
      openGraph: {
        title: `${product?.title || "Product"} - ${websiteName}`,
        description:
          product?.seoDescription ||
          fallbackDescription ||
          "Buy this quality product from Sukunlife. Explore now!",
        url: `${host}/shop/${productId}`,
        siteName: websiteName,
        images: [
          {
            url: product?.images?.[0] || productCoverPhoto,
            width: 1200,
            height: 630,
            alt: `${product?.title || "Product"} Image`,
          },
        ],
        locale: "bn_BD", 
        type:"website"
      },
      twitter: {
        card: "summary_large_image",
        title: `${product?.title || "Product"} - ${websiteName}`,
        description:
          product?.seoDescription ||
          fallbackDescription ||
          "Check out this product at Sukunlife!",
        images: [product?.images?.[0] || productCoverPhoto],
      },
    };

    // Enhance keywords with tags if available
    if (product?.tags?.length > 0) {
      const tagKeywords = product.tags.split(",").map(tag => tag.trim());
      metadata.keywords.push(...tagKeywords);
    }

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    // Handle not found case
    if (!product) {
      metadata.title = `Product Not Found - ${websiteName}`;
      metadata.description = "This product is unavailable. Explore more at Sukunlife.";
      metadata.openGraph.title = metadata.title;
      metadata.openGraph.description = metadata.description;
      metadata.twitter.title = metadata.title;
      metadata.twitter.description = metadata.description;
    }

    return metadata;
  } catch (error) {
    console.error("Product metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Product - ${websiteName}`,
      description: "Explore products at Sukunlife.",
      alternates: {
        canonical: `${host}/shop/${params?.id || ""}`,
      },
    };
  }
}