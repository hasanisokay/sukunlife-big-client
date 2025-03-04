import VideoPage from "@/components/resources/VideoPage";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import videoCover from "@/../public/images/video.jpg";

const page = () => {
    return <VideoPage />
};

export default page;


export async function generateMetadata() {
  try {
    const host = await hostname();
    const videoCoverUrl = `${host}${videoCover.src}`;

    const metadata = {
      title: `Video Resources`,
      description:
        "Watch Sukunlife's engaging video tutorials and presentations for personal development.",
      keywords: [
        "Sukunlife videos",
        "video tutorials",
        "video resources",
        "learning videos",
        "self-improvement videos",
        "educational videos",
        "video content",
        "digital videos",
        "motivational videos",
        "multimedia",
      ],
      alternates: {
        canonical: `${host}/resources/video`,
      },
      openGraph: {
        title: `Video Resources - ${websiteName}`,
        description:
          "Dive into Sukunlife's video library with tutorials and inspiring content.",
        url: `${host}/resources/video`,
        siteName: websiteName,
        images: [
          {
            url: videoCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Video Resources`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Video Resources - ${websiteName}`,
        description:
          "Explore Sukunlife's video resources for learning and growth!",
        images: [videoCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Video metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Video Resources - ${websiteName}`,
      description: "Watch Sukunlife's video resources.",
      alternates: {
        canonical: `${host}/resources/video`,
      },
    };
  }
}