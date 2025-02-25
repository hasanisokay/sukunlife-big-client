import IdentityForm from "@/components/forms/IdentityForm";
import { websiteName } from "@/constants/names.mjs";
import identityCover from "@/../public/images/identity.jpg";
import hostname from "@/constants/hostname.mjs";

const identityPage = async () => {
  return <IdentityForm />;
};

export default identityPage;

export async function generateMetadata() {
  try {
    const host = await hostname();
    const identityCoverUrl = `${host}${identityCover.src}`; // Assuming you have an image for the identity page

    const metadata = {
      title: `Identity Verification | Secure Your Account`,
      description:
        "Verify your identity to reset password on Sukunlife to secure your account and access all features. Follow the simple steps to complete the process.",
      keywords: [
        "identity verification",
        "secure account",
        "verify identity",
        "sukunlife verification",
        "account security",
        "online identity check",
        "reset password",
      ],
      alternates: {
        canonical: `${host}/identity`,
      },
      openGraph: {
        title: `Identity Verification - ${websiteName}`,
        description:
          "Secure your Sukunlife account by verifying your identity. Follow the steps to complete the process.",
        url: `${host}/identity-verification`,
        siteName: websiteName,
        images: [
          {
            url: identityCoverUrl,
            width: 1200, // Optimized for social sharing
            height: 630,
            alt: `${websiteName} Identity Verification Page`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Identity Verification - ${websiteName}`,
        description:
          "Verify your identity on Sukunlife to secure your account and access all features.",
        images: [identityCoverUrl],
      },
      robots: "noindex", // Optional: prevents indexing of identity verification page
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter((kw) => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Identity verification metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Identity Verification`,
      description: "Verify your identity to secure your Sukunlife account.",
      alternates: {
        canonical: `${host}/identity-verification`,
      },
    };
  }
}
