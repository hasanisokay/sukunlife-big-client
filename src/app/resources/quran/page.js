import hostname from "@/constants/hostname.mjs";
import quranCover from "@/../public/images/quran.jpg";
import { websiteName } from "@/constants/names.mjs";
import NotFound from "@/components/not-found/NotFound";
import EmptyState from "@/components/shared/EmptyState";
import Pagination2 from "@/components/paginations/Pagination2";
import QuranResources from "@/components/resources/QuranResources";
import getResourcesPublic from "@/utils/getResourcesPublic.mjs";
const page = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = Number(s?.page) || 1;
    const limit = Number(s?.limit) || 20;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const type = "quran";
    const r = await getResourcesPublic(page, limit, keyword, sort, type);
    if (r?.status === 200) {
      const totalItems = Number(r?.totalCount || 0);
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      return (
        <>
          <QuranResources quranList={r?.resources} />
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
          title="No resource yet"
          description="New resources are coming soon."
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
    const quranCoverUrl = `${host}${quranCover.src}`;

    const metadata = {
      title: `Quran`,
      description:
        "Explore and manage your Sukunlife resources including Quran contents tailored for your needs.",
      keywords: [
        "Sukunlife",
        "resources",
        "quran downloads",
        "quran tutorials",
        "quran guides",
        "learning materials",
        "self-improvement",
        "digital content",
        "educational resources",
        "multimedia",
      ],
      alternates: {
        canonical: `${host}/resources/quran`,
      },
      openGraph: {
        title: `Quran - ${websiteName}`,
        description:
          "Discover a wide range of resources at Sukunlife, from insightful quranic content.",
        url: `${host}/resources/quran`,
        siteName: websiteName,
        images: [
          {
            url: quranCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Quran Resources`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Quran - ${websiteName}`,
        description:
          "Manage your Sukunlife resources with our curated collection of PDFs, quran files!",
        images: [quranCoverUrl],
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
        canonical: `${host}/resources/quran`,
      },
    };
  }
}
