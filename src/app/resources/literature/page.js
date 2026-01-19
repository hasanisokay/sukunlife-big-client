import hostname from "@/constants/hostname.mjs";
import literatureCover from "@/../public/images/literature.jpg";
import { websiteName } from "@/constants/names.mjs";
import NotFound from "@/components/not-found/NotFound";
import EmptyState from "@/components/shared/EmptyState";
import Pagination2 from "@/components/paginations/Pagination2";
import LiteratureSection from "@/components/resources/LiteratureSection";
import getResourcesPublic from "@/utils/getResourcesPublic.mjs";
const page = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = Number(s?.page) || 1;
    const limit = Number(s?.limit) || 20;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const type = "literature";
    const r = await getResourcesPublic(page, limit, keyword, sort, type);

    if (r?.status === 200) {
      const totalItems = Number(r?.totalCount || 0);
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      return (
        <>
          <LiteratureSection literatureData={r?.resources} />
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
          title="No literature & guides yet"
          description="New literature & guides are coming soon."
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
    const literatureCoverUrl = `${host}${literatureCover.src}`;

    const metadata = {
      title: `Literature`,
      description:
        "Explore and manage your Sukunlife resources including PDFs, guides content tailored for your needs.",
      keywords: [
        "Sukunlife",
        "resources",
        "pdf downloads",
        "literature tutorials",
        "literature guides",
        "learning materials",
        "self-improvement",
        "digital content",
        "educational resources",
        "multimedia",
      ],
      alternates: {
        canonical: `${host}/resources/literature`,
      },
      openGraph: {
        title: `Literature - ${websiteName}`,
        description:
          "Discover a wide range of resources at Sukunlife, from insightful Guides, PDFs, Literature,  content.",
        url: `${host}/resources/literature`,
        siteName: websiteName,
        images: [
          {
            url: literatureCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Literature Resources`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Literature - ${websiteName}`,
        description:
          "Manage your Sukunlife resources with our curated collection of PDFs, gudies, literatures!",
        images: [literatureCoverUrl],
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
      title: `Literature - ${websiteName}`,
      description: "Manage your Sukunlife resources.",
      alternates: {
        canonical: `${host}/resources/literature`,
      },
    };
  }
}
