
import AdminBlogsPage from "@/components/dashboard/Admin/blogs/AdminBlogsPage";
import getAllBlogAdmin from "@/utils/getAllBlogAdmin.mjs";

const adminBlogsPage = async() => {
    const blogs = await getAllBlogAdmin();
    return (
        <>
         <AdminBlogsPage blogs={blogs?.blogs} />   
        </>
    );
};

export default adminBlogsPage;