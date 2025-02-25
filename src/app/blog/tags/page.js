import TagsPage from "@/components/blogs/tags/TagsPage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import getAllBlogTags from "@/utils/getAllBlogTags.mjs";
import blogCover from "@/../public/images/blog.jpg";
import { websiteName } from "@/constants/names.mjs";
const tagsPage = async () => {
  try {
    const tagsData = await getAllBlogTags();
    const tags = tagsData.tags;
    if (tags.length > 0) {
      return <TagsPage tags={tags} />;
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default tagsPage;

export async function generateMetadata() {
  try {
    const host = await hostname();
    const blogCoverUrl = `${host}${blogCover.src}`;
    const tagsData = await getAllBlogTags();
    const tags = tagsData?.tags || [];

    const metadata = {
      title: `Blog Tags`,
      description:
        "Explore Sukunlife blog posts by tags. Find topics you love now!",
      keywords: [
        "sukunlife blog",
        "blog tags",
        "articles",
        "insights",
        "blog categories",
        ...(tags.length > 0 ? tags : []),
      ],
      alternates: {
        canonical: `${host}/blog/tags`,
      },
      openGraph: {
        title: `Blog Tags - ${websiteName}`,
        description:
          "Browse Sukunlife blog tags and discover inspiring content!",
        url: `${host}/blog/tags`,
        siteName: websiteName,
        images: [
          {
            url: blogCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Blog Tags`,
          },
        ],
        locale: "bn_BD",
        type: "website", // Changed to "website" as it's a collection page
      },
      twitter: {
        card: "summary_large_image",
        title: `Blog Tags - ${websiteName}`,
        description:
          "Find Sukunlife blog posts by tags. Explore now!",
        images: [blogCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 15); // Slightly higher limit due to dynamic tags

    return metadata;
  } catch (error) {
    console.error("Blog tags metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Blog Tags - ${websiteName}`,
      description: "Browse blog tags at Sukunlife.",
      alternates: {
        canonical: `${host}/blog/tags`,
      },
    };
  }
}
