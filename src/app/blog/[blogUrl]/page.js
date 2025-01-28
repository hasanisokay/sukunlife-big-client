import SingleBlogPage from "@/components/blogs/SingleBlogPage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import getSingleBlog from "@/utils/getSingleBlog.mjs";
import blogCover from "@/../public/images/blog.jpg";
const singleBlogPage = async ({ params }) => {
  try {
    const p = await params;
    const blogUrl = p.blogUrl;
    const blog = await getSingleBlog(blogUrl);
    if (blog.status === 200) {
      return <SingleBlogPage b={blog?.blog} />;
    } else return <NotFound />;
  } catch {
    return <NotFound />;
  }
};

export default singleBlogPage;

export async function generateMetadata({ params }) {
  const host = await hostname();
  const p = await params;
  const blogUrl = p.blogUrl;
  const blogCoverUrl = `${host}${blogCover.src}`;
  let metadata = {
    title: `Blog - ${websiteName}`,
    description: "বিভিন্ন বিষয়ের উপর আমাদের সর্বশেষ ব্লগ পোস্টগুলি পড়ুন।",
    keywords: ["সুকুনলাইফ ব্লগ"],
    url: blogUrl ? `${host}/blog/${blogUrl}` : `${host}/blog`,
    canonical: blogUrl ? `${host}/blog/${blogUrl}` : `${host}/blog`,
  };

  try {
    if (blogUrl) {
      const b = await getSingleBlog(blogUrl);
      let blog;
      if (b.status === 200) {
        blog = b.blog;
      }

      if (blog) {
        const blogTitle = blog?.title || "Blog Post";
        metadata.title = `${blogTitle} - ${websiteName}`;
        if (blog.seoTags > 2) {
          const keywords = blog.seoTags.split(",");
          metadata.keywords.push(...keywords);
        } else {
          const titleKeywords = blogTitle
            .split(" ")
            .filter((kw) => kw.length > 3);
          metadata.keywords.push(...titleKeywords);
          if (blog?.blogTags?.length > 0) {
            metadata.keywords.push(...blog?.blogTags);
          }
        }

        if (blog?.seoDescription > 0) {
          metadata.description = blog.seoDescription;
        } else {
          const plainText = blog?.content?.replace(/<[^>]+>/g, " ");
          metadata.description =
            plainText?.slice(0, 160) ||
            "Detailed description of the blog post.";
        }

        metadata.other = {
          "twitter:image": blog.blogCoverPhoto || blogCoverUrl ||"",
          "twitter:card": "summary_large_image",
          "twitter:title": metadata.title,
          "twitter:description": metadata.description,
          "og:title": metadata.title,
          "og:description": metadata.description,
          "og:url": `${host}/blog/${blogUrl}`,
          "og:image": blog.blogCoverPhoto || blogCoverUrl || "",
          "og:type": "article",
          "og:site_name": websiteName,
          "og:locale": "bn_BD",
        };
      }
    }
  } catch (error) {
    console.error("Error fetching blog metadata:", error);
  }

  return metadata;
}
