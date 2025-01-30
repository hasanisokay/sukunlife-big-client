import BlogPage from "@/components/blogs/BlogPage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import getAllBlog from "@/utils/getAllBlog.mjs";
import blogCover from "@/../public/images/blog.jpg";

const publicBlogPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 3;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const tags = s?.tags || "";
    const skip = 0;

    const blogs = await getAllBlog(page, limit, keyword, tags, sort, skip);
    if (blogs.status === 200) {
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

export default publicBlogPage;



export async function generateMetadata() {
  const host = await hostname();
  const blogCoverUrl = `${host}${blogCover.src}`;

  const metadata = {
    title: `Blog - ${websiteName}`,
    description: "Access sukunlife blogs.",
    keywords: ["blog"],
    url: `${host}/blog`,
    canonical: `${host}/blog`,
    openGraph: {
      title: `Login - ${websiteName}`,
      description: "Access sukunlife blogs.",
      url: `${host}/blog`,
      images: [
        {
          url: blogCoverUrl,
          width: 800,
          height: 600,
          alt: 'Blog Cover Image',
        },
      ],
      siteName: websiteName,
      locale: 'bn_BD',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Login - ${websiteName}`,
      description: "Access sukunlife blogs.",
      images: [blogCoverUrl],
    },
  };
  return metadata;
}