import ResourcesPage from "@/components/resources/ResourcesPage";
import hostname from "@/constants/hostname.mjs";
import cartCover from "@/../public/images/resources.jpg";
import { websiteName } from "@/constants/names.mjs";
const page = () => {
  return (
    <>
      <ResourcesPage />
    </>
  );
};

export default page;

export const metadata = () => {
  try {
    const host = hostname();
    const cartCoverUrl = `${host}${cartCover.src}`;

    const metadata = {
      title: `Resources`,
      description:
        "Explore and manage your Sukunlife resources including PDFs, videos, and audio content tailored for your needs.",
      keywords: [
        "Sukunlife",
        "resources",
        "PDF downloads",
        "video tutorials",
        "audio guides",
        "learning materials",
        "self-improvement",
        "digital content",
        "educational resources",
        "multimedia",
      ],
      alternates: {
        canonical: `${host}/resources`,
      },
      openGraph: {
        title: `Resources - ${websiteName}`,
        description:
          "Discover a wide range of resources at Sukunlife, from insightful PDFs to engaging videos and audio content.",
        url: `${host}/resources`,
        siteName: websiteName,
        images: [
          {
            url: cartCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Resources`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Resources - ${websiteName}`,
        description:
          "Manage your Sukunlife resources with our curated collection of PDFs, videos, and audio files!",
        images: [cartCoverUrl],
      },
    };
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter((kw) => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Metadata generation failed:", error);
    const host = hostname();
    return {
      title: `Resources - ${websiteName}`,
      description: "Manage your Sukunlife resources.",
      alternates: {
        canonical: `${host}/resources`,
      },
    };
  }
};
