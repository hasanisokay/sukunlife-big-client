import hostname from "@/constants/hostname.mjs";
import videoCover from "@/../public/images/video.jpg";
import { websiteName } from "@/constants/names.mjs";
import NotFound from "@/components/not-found/NotFound";
import EmptyState from "@/components/shared/EmptyState";
import Pagination2 from "@/components/paginations/Pagination2";
import VideoResources from "@/components/resources/VideoResources";
import getResourcesPublic from "@/utils/getResourcesPublic.mjs";
const page = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page =  Number(s?.page) || 1;
    const limit =  Number(s?.limit) || 20;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const subType = s?.lang || "all";
    const type = "video";
    const r = await getResourcesPublic(page, limit, keyword, sort, type, subType);

    if (r?.status === 200) {
      const totalItems = Number(r?.totalCount || 0);
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      return (
        <>
          <VideoResources videos={r?.resources} />
          {totalPages > 1 && (
            <Pagination2
              itemsPerPage={limit}
              totalItems={r?.totalCount}
              totalPages={totalPages}
            />
          )}
        </>
      );
    } else {
      return (
        <EmptyState
          title="No video yet"
          description="New videos are coming soon."
        />
      );
    }
  } catch {
    return <NotFound />;
  }
};

export default page;

export async function generateMetadata() {
  try {
    const host = await hostname();
    const videoCoverUrl = `${host}${videoCover.src}`;

    const metadata = {
      title: `Video`,
      description:
        "Explore and manage your Sukunlife resources including PDFs, videos, and video content tailored for your needs.",
      keywords: [
        "Sukunlife",
        "resources",
        "video downloads",
        "video tutorials",
        "video guides",
        "learning materials",
        "self-improvement",
        "digital content",
        "educational resources",
        "multimedia",
      ],
      alternates: {
        canonical: `${host}/resources/video`,
      },
      openGraph: {
        title: `Video - ${websiteName}`,
        description:
          "Discover a wide range of resources at Sukunlife, from insightful PDFs to engaging videos and video content.",
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
        title: `Video - ${websiteName}`,
        description:
          "Manage your Sukunlife resources with our curated collection of PDFs, videos, and audio files!",
        images: [videoCoverUrl],
      },
    };

    metadata.keywords = [...new Set(metadata.keywords)]
      .filter((kw) => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Video - ${websiteName}`,
      description: "Manage your Sukunlife resources.",
      alternates: {
        canonical: `${host}/resources/video`,
      },
    };
  }
}
