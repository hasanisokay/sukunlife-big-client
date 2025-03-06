import AudioPage from "@/components/resources/AudioPage";
import hostname from "@/constants/hostname.mjs";
import audioCover from "@/../public/images/audio.jpg";
import { websiteName } from "@/constants/names.mjs";
import NotFound from "@/components/not-found/NotFound";
import getResources from "@/utils/getResources.mjs";
import PaginationDefault from "@/components/paginations/PaginationDefault";
const audioPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 20;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const audiodata = await getResources(page, limit, keyword, sort, "audio");
    if (audiodata?.status === 200) {
      return (
        <div className="overflow-hidden">
          <AudioPage audios={audiodata?.resources} />
          <PaginationDefault p={page} totalPages={audiodata?.totalPages} />
        </div>
      );
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default audioPage;

export async function generateMetadata() {
  try {
    const host = await hostname();
    const audioCoverUrl = `${host}${audioCover.src}`;

    const metadata = {
      title: `Audio Resources`,
      description:
        "Listen to Sukunlife's curated audio resources, including podcasts and guides for personal growth.",
      keywords: [
        "Sukunlife audio",
        "podcasts",
        "audio resources",
        "self-improvement audio",
        "learning audio",
        "motivational audio",
        "digital audio",
        "audio guides",
        "sound content",
        "multimedia",
      ],
      alternates: {
        canonical: `${host}/resources/audio`,
      },
      openGraph: {
        title: `Audio Resources - ${websiteName}`,
        description:
          "Explore Sukunlife's collection of audio content, from podcasts to insightful audio guides.",
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
        title: `Audio Resources - ${websiteName}`,
        description:
          "Discover Sukunlife's audio resources for learning and inspiration!",
        images: [audioCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter((kw) => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Audio metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Audio Resources - ${websiteName}`,
      description: "Listen to Sukunlife's audio resources.",
      alternates: {
        canonical: `${host}/resources/audio`,
      },
    };
  }
}
