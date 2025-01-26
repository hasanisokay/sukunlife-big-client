
import EditBlog from "@/components/dashboard/Admin/blogs/EditBlog";
import NotFound from "@/components/not-found/NotFound";
import getSingleBlog from "@/utils/getSingleBlog.mjs";

const editBlogPage = async ({ searchParams }) => {
  const blogUrl = (await searchParams)?.blogUrl;
  if (!blogUrl) {
    return <NotFound />;
  }
  let blog = await getSingleBlog(blogUrl);
  if (blog?.status !==200) return <NotFound />;
  return <EditBlog blog={blog?.blog} />
};

export default editBlogPage;
