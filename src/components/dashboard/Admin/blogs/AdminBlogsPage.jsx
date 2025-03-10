'use client'
import BlogContent from "@/components/blogs/BlogContnet";
import Spinner from "@/components/loaders/Spinner";
import Spinner2 from "@/components/loaders/Spinner2";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import SearchBar from "@/components/search/SearchBar";
import { SERVER } from "@/constants/urls.mjs";
import deleteBlog from "@/server-functions/deleteBlog.mjs";
import getBlogContent from "@/server-functions/getBlogContent.mjs";
import formatDate from "@/utils/formatDate.mjs";
// import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Flip, toast, ToastContainer } from "react-toastify";

const AdminBlogsPage = ({ blogs }) => {
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [showContentModal, setShowContentModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fetchingBlog, setFetchingBlog] = useState(false);
    const [initialBlogs, setInitialBlogs] = useState(blogs);
    const memorizedBlogs = useMemo(() => initialBlogs, [initialBlogs]);

    useEffect(() => {
        setInitialBlogs(blogs)
    }, [blogs])
    const router = useRouter();
    const handleViewContent = async (blog) => {
        setFetchingBlog(true)
        try {
            const data = await getBlogContent(blog?.blogUrl);
            if (data?.status === 200) {
                setSelectedBlog(data?.blog);
                setShowContentModal(true)
            } else return window.location.reload();
        } catch (e) {
            console.log(e)
        } finally {
            setFetchingBlog(false);
        }
    };
    const closeModal = () => {
        setShowContentModal(false);
        setShowDeleteModal(false);
        setSelectedBlog(null);
        setFetchingBlog(false);
    }
    const handleDelete = async (blog) => {
        setSelectedBlog(blog);
        setShowDeleteModal(true)
    };

    const confirmDelete = async () => {
        setShowDeleteModal(false);
        setFetchingBlog(true)
        try {
            const data = await deleteBlog(selectedBlog?._id);
            if (data?.status === 200) {
                toast.success(data?.message);
                setInitialBlogs((prev) => prev.filter(b => b?._id !== selectedBlog?._id))
                setSelectedBlog(null);
                closeModal();
            } else {
                toast.error(data?.message)
            }
        } catch (e) {
            console.log(e)
        } finally {
            setFetchingBlog(false);
        }
    };

    return (
        <div className="p-6 w-full min-h-screen overflow-x-auto">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                Blogs
            </h1>
            <SearchBar placeholder={"Search blog"} />
            {fetchingBlog && <Spinner2 loadingText={"Please Wait..."} />}
            <div className="overflow-x-auto ">
                <table className="w-full border-collapse bg-white dark:bg-gray-700">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800">
                            <th className="p-3 text-left ">Title</th>
                            <th className="p-3 text-left">Author</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {memorizedBlogs?.map((blog) => (
                            <tr key={blog._id} className="border-t">
                                <td className="p-3  min-w-[200px]">{blog.title}</td>
                                <td className="p-3">{blog.authorName}</td>
                                <td className="p-3">{formatDate(blog.date)}</td>
                                <td className="p-3">{blog.postStatus}</td>
                                <td className="p-3 flex justify-center gap-2">
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        onClick={() => router.push(`/dashboard/blogs/edit?blogUrl=${blog?.blogUrl}`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                        onClick={() => handleViewContent(blog)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        onClick={() => handleDelete(blog)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Content Modal */}
            {showContentModal && selectedBlog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white overflow-y-auto max-h-[90vh]  dark:bg-gray-700 p-6 rounded shadow-lg w-3/4 max-w-3xl">
                        <div className="relative">
                            <button
                                className="text-red-500 absolute right-0"
                                onClick={() => setShowContentModal(false)}
                            >
                                X
                            </button>
                        </div>
                        <h2 className="text-xl font-semibold mb-4">{selectedBlog.title}</h2>

                        <BlogContent content={selectedBlog.content} />
                        <button
                            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            onClick={() => setShowContentModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Warning Modal */}
            {showDeleteModal && selectedBlog && <DeleteConfirmationModal
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                subHeading={`Title : ${selectedBlog.title}`}
                headingText={'Are you sure you want to delete this blog?'} />
            }
            <ToastContainer transition={Flip} />
        </div>
    );
};

export default AdminBlogsPage;
