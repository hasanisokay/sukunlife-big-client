import courseCover from "@/../public/images/cart.jpg";
import CartPage from "@/components/cart/CartPage";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";

const page = async () => {
  return <CartPage />;
};

export default page;

export async function generateMetadata({ params }) {
  try {
    const host = await hostname();
    const p = await params;

    const cartCoverUrl = `${host}${courseCover.src}`;

    let metadata = {
      title: `Cart - ${websiteName}`,
      description: "Manage your cart.",
      keywords: ["সুকুনলাইফ, SukunLife, sukunlife, cart"],
      url: `${host}/cart`,
      canonical: `${host}/cart`,
    };
    metadata.other = {
      "twitter:image": cartCoverUrl || "",
      "twitter:card": "summary_large_image",
      "twitter:title": metadata.title,
      "twitter:description": metadata.description,
      "og:title": metadata.title,
      "og:description": metadata.description,
      "og:url": `${host}/cart`,
      "og:image": cartCoverUrl || "",
      "og:type": "website",
      "og:site_name": websiteName,
      "og:locale": "bn_BD",
    };

    return metadata;
  } catch (error) {
    console.log("error occured")
  }
}
