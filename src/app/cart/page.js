import cartCover from "@/../public/images/cart.jpg";
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
    const cartCoverUrl = `${host}${cartCover.src}`;

    const metadata = {
      title: `Shopping Cart`,
      description:
        "Review and manage your Sukunlife cart. Proceed to checkout now!",
      keywords: [
        "sukunlife cart",
        "shopping cart",
        "online checkout",
        "cart management",
        "sukunlife",
        "buy online",
      ],
      alternates: {
        canonical: `${host}/cart`,
      },
      openGraph: {
        title: `Cart - ${websiteName}`,
        description:
          "View and update your Sukunlife shopping cart. Shop now!",
        url: `${host}/cart`,
        siteName: websiteName,
        images: [
          {
            url: cartCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Shopping Cart`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Cart - ${websiteName}`,
        description:
          "Manage your Sukunlife cart and checkout today!",
        images: [cartCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Cart metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Cart - ${websiteName}`,
      description: "Manage your shopping cart at Sukunlife.",
      alternates: {
        canonical: `${host}/cart`,
      },
    };
  }
}
