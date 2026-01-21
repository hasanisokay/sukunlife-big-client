import BlogPage from "@/components/blogs/BlogPage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import blogCover from "@/../public/images/blog.jpg";
import getAllCategoryFiveBlogsPublic from "@/utils/getAllCategoryFiveBlogsPublic.mjs";

const publicBlogPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 3;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const tags = s?.tags || "";
    const skip = 0;

    const blogs = await getAllCategoryFiveBlogsPublic(page, limit, keyword, tags, sort, skip);
    if (blogs?.status === 200) {
      return (
        <>
          <BlogPage b={blogs?.categories}  limit={limit} page={page} />
        </>
      );
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default publicBlogPage;




export async function generateMetadata() {
  try {
    const host = await hostname();
    const blogCoverUrl = `${host}${blogCover.src}`;

    const metadata = {
      title: `Blog Insights & Updates`,
      description:
        "Explore Sukunlife's blog for expert insights, tips, and updates. Read now!",
      keywords: [
        "sukunlife blog",
        "online blog",
        "learning insights",
        "educational articles",
        "sukunlife updates",
        "blog posts",
        "expert tips",
      ],
      alternates: {
        canonical: `${host}/blog`,
      },
      openGraph: {
        title: `Blog - ${websiteName}`,
        description:
          "Discover valuable insights and updates on Sukunlife's blog. Start reading!",
        url: `${host}/blog`,
        siteName: websiteName,
        images: [
          {
            url: blogCoverUrl,
            width: 1200, // Increased for better quality
            height: 630, // Optimized for social sharing
            alt: `${websiteName} Blog Featured Image`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Blog - ${websiteName}`,
        description:
          "Read Sukunlife's blog for tips, insights, and updates. Visit now!",
        images: [blogCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Blog metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Blog - ${websiteName}`,
      description: "Read blogs at Sukunlife.",
      alternates: {
        canonical: `${host}/blog`,
      },
    };
  }
}