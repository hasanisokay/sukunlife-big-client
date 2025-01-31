
import AdminBlogsPage from "@/components/dashboard/Admin/blogs/AdminBlogsPage";
import getAllBlogAdmin from "@/utils/getAllBlogAdmin.mjs";

const adminBlogsPage = async({searchParams}) => {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 100;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const tags = s?.tags || "";
    const blogs = await getAllBlogAdmin(page,limit,keyword,tags,sort);
    return (
        <>
         <AdminBlogsPage blogs={blogs?.blogs} />   
        </>
    );
};

export default adminBlogsPage;