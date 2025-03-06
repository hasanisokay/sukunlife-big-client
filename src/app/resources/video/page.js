import VideoPage from "@/components/resources/VideoPage";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import videoCover from "@/../public/images/video.jpg";
import PaginationDefault from "@/components/paginations/PaginationDefault";
import getResources from "@/utils/getResources.mjs";
import NotFound from "@/components/not-found/NotFound";

const videoPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 20;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const videoData = await getResources(page, limit, keyword, sort, "video");
    if (videoData?.status === 200) {
      return (
        <div className="overflow-hidden">
          <VideoPage videos={videoData?.resources} />
          <PaginationDefault p={page} totalPages={videoData?.totalPages} />
        </div>
      );
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default videoPage;

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
      .filter((kw) => kw && kw.length > 2)
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
