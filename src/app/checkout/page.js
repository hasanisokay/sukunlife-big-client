import hostname from "@/constants/hostname.mjs"; // Required import
import checkoutCover from "@/../public/images/checkout.jpg"; // Adjust path if needed
import { websiteName } from "@/constants/names.mjs"; // Required import


import CheckOutPage from "@/components/checkout/CheckOutPage";

const page = () => {
  return (
    <>
      <CheckOutPage />
    </>
  );
};

export default page;



export async function generateMetadata({ params }) {
  try {
    const host = await hostname();
    await params; // Kept for consistency, though unused here
    const checkoutCoverUrl = `${host}${checkoutCover.src}`;

    const metadata = {
      title: `Checkout | Complete Your Purchase`,
      description:
        "Securely complete your purchase at Sukunlife. Fast checkout now!",
      keywords: [
        "sukunlife checkout",
        "online checkout",
        "secure payment",
        "complete purchase",
        "sukunlife",
        "shop online",
        "payment process",
      ],
      alternates: {
        canonical: `${host}/checkout`,
      },
      openGraph: {
        title: `Checkout - ${websiteName}`,
        description:
          "Finalize your Sukunlife order with secure checkout. Pay now!",
        url: `${host}/checkout`,
        siteName: websiteName,
        images: [
          {
            url: checkoutCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Checkout Page`,
          },
        ],
        locale: "bn_BD", // Adjust if targeting a different audience
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Checkout - ${websiteName}`,
        description:
          "Securely checkout at Sukunlife. Finish your order now!",
        images: [checkoutCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Checkout metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Checkout - ${websiteName}`,
      description: "Complete your purchase at Sukunlife.",
      alternates: {
        canonical: `${host}/checkout`,
      },
    };
  }
}