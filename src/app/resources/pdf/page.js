import PdfPage from "@/components/resources/PdfPage";
import hostname from "@/constants/hostname.mjs";
import pdfCover from "@/../public/images/pdf.jpg";
import { websiteName } from "@/constants/names.mjs";
import PaginationDefault from "@/components/paginations/PaginationDefault";
import NotFound from "@/components/not-found/NotFound";
import getResources from "@/utils/getResources.mjs";


const pdfPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 20;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const pdfData = await getResources(page, limit, keyword, sort, "pdf");
    if (pdfData?.status === 200) {
      return (
        <div className="overflow-hidden">
          <PdfPage pdfs={pdfData?.resources} />
          <PaginationDefault p={page} totalPages={pdfData?.totalPages} />
        </div>
      );
    } else if (pdfData?.status === 404) {
      <p className="text-center mt-10">No pdf found.</p>;
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default pdfPage;

export async function generateMetadata() {
  try {
    const host = await hostname();
    const pdfCoverUrl = `${host}${pdfCover.src}`;

    const metadata = {
      title: `PDF Resources`,
      description:
        "Download Sukunlife's comprehensive PDF resources and guides for your personal journey.",
      keywords: [
        "Sukunlife PDFs",
        "PDF downloads",
        "PDF resources",
        "educational PDFs",
        "self-improvement PDFs",
        "digital guides",
        "PDF documents",
        "learning PDFs",
        "resource PDFs",
        "multimedia",
      ],
      alternates: {
        canonical: `${host}/resources/pdf`,
      },
      openGraph: {
        title: `PDF Resources - ${websiteName}`,
        description:
          "Access Sukunlife's collection of PDF guides and downloadable resources.",
        url: `${host}/resources/pdf`,
        siteName: websiteName,
        images: [
          {
            url: pdfCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} PDF Resources`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `PDF Resources - ${websiteName}`,
        description:
          "Get Sukunlife's PDF resources for knowledge and inspiration!",
        images: [pdfCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter((kw) => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("PDF metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `PDF Resources - ${websiteName}`,
      description: "Download Sukunlife's PDF resources.",
      alternates: {
        canonical: `${host}/resources/pdf`,
      },
    };
  }
}
