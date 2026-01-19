import hostname from "@/constants/hostname.mjs";
import audioCover from "@/../public/images/audio.jpg";
import { websiteName } from "@/constants/names.mjs";
import NotFound from "@/components/not-found/NotFound";
import EmptyState from "@/components/shared/EmptyState";
import Pagination2 from "@/components/paginations/Pagination2";
import getResourcesPublic from "@/utils/getResourcesPublic.mjs";
import AudioAccordion from "@/components/dashboard/Admin/resources/AudioAccordian";
const page = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = Number(s?.page) || 1;
    const limit = Number(s?.limit) || 30;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const type = "audio";
    const r = await getResourcesPublic(page, limit, keyword, sort, type);
    if (r?.status === 200) {
      const totalItems = Number(r?.totalCount || 0);
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      return (
        <>
          <AudioAccordion audioList={r?.resources} />
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
          title="No audio yet"
          description="New audios are coming soon."
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
    const audioCoverUrl = `${host}${audioCover.src}`;

    const metadata = {
      title: `Audio`,
      description:
        "Explore and manage your Sukunlife resources including PDFs, videos, and audio content tailored for your needs.",
      keywords: [
        "Sukunlife",
        "resources",
        "audio downloads",
        "audio tutorials",
        "audio guides",
        "learning materials",
        "self-improvement",
        "digital content",
        "educational resources",
        "multimedia",
      ],
      alternates: {
        canonical: `${host}/resources/audio`,
      },
      openGraph: {
        title: `Audio - ${websiteName}`,
        description:
          "Discover a wide range of resources at Sukunlife, from insightful PDFs to engaging videos and audio content.",
        url: `${host}/resources/audio`,
        siteName: websiteName,
        images: [
          {
            url: audioCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Audio Resources`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Audio - ${websiteName}`,
        description:
          "Manage your Sukunlife resources with our curated collection of PDFs, videos, and audio files!",
        images: [audioCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter((kw) => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Resources - ${websiteName}`,
      description: "Manage your Sukunlife resources.",
      alternates: {
        canonical: `${host}/resources/audio`,
      },
    };
  }
}
