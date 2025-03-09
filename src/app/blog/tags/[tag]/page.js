import BlogPage from "@/components/blogs/BlogPage";
import NotFound from "@/components/not-found/NotFound";
import { websiteName } from "@/constants/names.mjs";
import getAllBlog from "@/utils/getAllBlog.mjs";
import React from "react";
import blogCover from "@/../public/images/blog.jpg";
import hostname from "@/constants/hostname.mjs";
import capitalize from "@/utils/capitalize.mjs";
import getAllBlogTags from "@/utils/getAllBlogTags.mjs";



const singleTagPage = async ({ params, searchParams }) => {
  try {
    const p = await params;
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 3;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const tag = p?.tag;
    const skip = 0;
    if (!tag) return <NotFound />;

    const blogs = await getAllBlog(page, limit, keyword, tag, sort, skip);
    const tags = await getAllBlogTags();
    if (blogs?.status === 200) {
      return (
        <>
          <BlogPage b={blogs} tags={tags?.tags} limit={limit} page={page} selectedTag={decodeURIComponent(tag)} />
        </>
      );
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default singleTagPage;

export async function generateMetadata({ params }) {
  try {
    const host = await hostname();
    const p = await params;
    let tag = p.tag ? decodeURIComponent(p.tag) : null;
    const blogCoverUrl = `${host}${blogCover.src}`;
    const baseUrl = tag ? `${host}/blog/tags/${tag}` : `${host}/blog/tags`;

    const metadata = {
      title: tag ? `${capitalize(tag)} Blog` : `Blog Tags`,
      description: tag
        ? `Read Sukunlife blog posts tagged with ${capitalize(tag)}. Explore now!`
        : "Browse all blog tags at Sukunlife. Find topics you love!",
      keywords: [
        "sukunlife blog",
        "blog tags",
        "articles",
        "insights",
        ...(tag ? [tag, `${tag} blog`, `${tag} posts`] : []),
      ],
      alternates: {
        canonical: baseUrl,
      },
      openGraph: {
        title: tag ? `${capitalize(tag)} - ${websiteName} Blog` : `Blog Tags - ${websiteName}`,
        description: tag
          ? `Discover blog posts tagged ${capitalize(tag)} on Sukunlife. Read now!`
          : "Explore Sukunlife blog tags and find inspiring content!",
        url: baseUrl,
        siteName: websiteName,
        images: [
          {
            url: blogCoverUrl,
            width: 1200,
            height: 630,
            alt: tag ? `${capitalize(tag)} Blog Cover` : `${websiteName} Blog Tags`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: tag ? `${capitalize(tag)} - ${websiteName} Blog` : `Blog Tags - ${websiteName}`,
        description: tag
          ? `Check out ${capitalize(tag)} tagged posts on Sukunlife!`
          : "Find all blog tags on Sukunlife!",
        images: [blogCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Blog tag metadata generation failed:", error);
    const host = await hostname();
    const tag = params?.tag ? decodeURIComponent(params.tag) : null;
    const baseUrl = tag ? `${host}/blog/tags/${tag}` : `${host}/blog/tags`;
    return {
      title: tag ? `${capitalize(tag)} - ${websiteName}` : `Blog Tags - ${websiteName}`,
      description: "Explore blog tags at Sukunlife.",
      alternates: {
        canonical: baseUrl,
      },
    };
  }
}