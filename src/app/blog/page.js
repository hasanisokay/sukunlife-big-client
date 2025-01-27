import BlogPage from "@/components/blogs/BlogPage";
import NotFound from "@/components/not-found/NotFound";
import getAllBlog from "@/utils/getAllBlog.mjs";

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
