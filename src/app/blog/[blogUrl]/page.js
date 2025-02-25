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
    if (blog?.status === 200) {
      return <SingleBlogPage b={blog?.blog} />;
    } else return <NotFound />;
  } catch {
    return <NotFound />;
  }
};

export default singleBlogPage;

export async function generateMetadata({ params }) {
  try {
    const host = await hostname();
    const p = await params;
    const blogUrl = p.blogUrl;
    const blogCoverUrl = `${host}${blogCover.src}`;
    const baseUrl = blogUrl ? `${host}/blog/${blogUrl}` : `${host}/blog`;

    const metadata = {
      title: `Blog`,
      description: "Read our latest blog posts on various topics at Sukunlife.",
      keywords: ["sukunlife blog", "blog posts", "insights", "articles"],
      alternates: {
        canonical: baseUrl,
      },
      openGraph: {
        title: `Blog - ${websiteName}`,
        description: "Explore Sukunlife's latest blog posts. Read now!",
        url: baseUrl,
        siteName: websiteName,
        images: [
          {
            url: blogCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Blog Image`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Blog - ${websiteName}`,
        description: "Check out Sukunlife's latest blog posts!",
        images: [blogCoverUrl],
      },
    };

    if (blogUrl) {
      const b = await getSingleBlog(blogUrl);
      const blog = b?.status === 200 ? b.blog : null;

      if (blog) {
        const blogTitle = blog.title || "Blog Post";
        metadata.title = `${blogTitle}`;
        metadata.description =
          blog.seoDescription ||
          blog.content
            ?.replace(/<[^>]+>/g, " ")
            .slice(0, 160)
            .trim() ||
          "Read this insightful blog post from Sukunlife.";

        const titleKeywords = blogTitle
          .split(" ")
          .filter((kw) => kw.length > 3);
        metadata.keywords.push(...titleKeywords);
        if (blog.seoTags?.length > 0) {
          const seoKeywords = blog.seoTags.split(",").map((tag) => tag.trim());
          metadata.keywords.push(...seoKeywords);
        }
        if (blog.blogTags?.length > 0) {
          metadata.keywords.push(...blog.blogTags);
        }
        metadata.keywords = [...new Set(metadata.keywords)]
          .filter((kw) => kw && kw.length > 2)
          .slice(0, 10);
        
          metadata.openGraph = {
          title: `${blogTitle} - ${websiteName}`,
          description: metadata.description,
          url: baseUrl,
          siteName: websiteName,
          images: [
            {
              url: blog.blogCoverPhoto || blogCoverUrl,
              width: 1200,
              height: 630,
              alt: `${blogTitle} Cover Image`,
            },
          ],
          locale: "bn_BD",
          type: "article",
        };

        metadata.twitter = {
          card: "summary_large_image",
          title: `${blogTitle} - ${websiteName}`,
          description: metadata.description,
          images: [blog.blogCoverPhoto || blogCoverUrl],
        };
      }
    }

    return metadata;
  } catch (error) {
    console.error("Blog post metadata generation failed:", error);
    const host = await hostname();
    const baseUrl = params?.blogUrl
      ? `${host}/blog/${params.blogUrl}`
      : `${host}/blog`;
    return {
      title: `Blog - ${websiteName}`,
      description: "Explore blog posts at Sukunlife.",
      alternates: {
        canonical: baseUrl,
      },
    };
  }
}
