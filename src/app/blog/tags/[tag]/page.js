import BlogPage from "@/components/blogs/BlogPage";
import NotFound from "@/components/not-found/NotFound";
import { websiteName } from "@/constants/names.mjs";
import getAllBlog from "@/utils/getAllBlog.mjs";
import React from "react";
import blogCover from "@/../public/images/blog.jpg";
import hostname from "@/constants/hostname.mjs";
import capitalize from "@/utils/capitalize.mjs";

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
    if (blogs?.status === 200) {
      return (
        <>
          <BlogPage b={blogs} limit={limit} page={page} />
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
  const host = await hostname();
  const p = await params;
  const tag = p?.tag;
  const blogCoverUrl = `${host}${blogCover.src}`;

  let metadata = {
    title: `${capitalize(tag)} - ${websiteName}`,
    description: `${capitalize(tag)} ট্যাগের পোস্টগুলি পড়ুন।`,
    keywords: ["সুকুনলাইফ ব্লগ"],
    url: tag ? `${host}/blog/tags/${tag}` : `${host}/blog/tags`,
    canonical: tag ? `${host}/blog/tags/${tag}` : `${host}/blog/tags`,
  };

  try {
    metadata.other = {
      "twitter:image": blogCoverUrl || "",
      "twitter:card": "summary_large_image",
      "twitter:title": metadata.title,
      "twitter:description": metadata.description,
      "og:title": metadata.title,
      "og:description": metadata.description,
      "og:url": `${host}/blog/tags/${tag}`,
      "og:image": blogCoverUrl || "",
      "og:type": "article",
      "og:site_name": websiteName,
      "og:locale": "bn_BD",
    };
  } catch (error) {
    console.error("Error fetching blog metadata:", error);
  }

  return metadata;
}
