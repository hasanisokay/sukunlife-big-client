"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import DatePicker from "@/components/ui/datepicker/Datepicker";
import { SERVER } from "@/constants/urls.mjs";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { Flip, toast, ToastContainer } from "react-toastify";
import getAllBlogTags from "@/utils/getAllBlogTags.mjs";

const blogSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  content: z.string().min(10, "Content must be at least 10 characters long"),
  date: z.date("Date is required"),
  blogUrl: z.string().min(1, "URL is required"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoTags: z.string().optional(),
  authorName: z.string().optional(),
  postStatus: z.enum(["public", "private"]),
  blogTags: z.array(z.string()).optional(),
});

const EditBlog = ({ blog }) => {
  const [categories, setCategories] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title || "",
      content: blog?.content || "",
      date: blog?.date ? new Date(blog.date) : new Date(),
      blogUrl: blog?.blogUrl || "",
      seoTitle: blog?.seoTitle || "",
      seoDescription: blog?.seoDescription || "",
      seoTags: blog?.seoTags || "",
      authorName: blog?.authorName || "",
      postStatus: blog?.postStatus || "public",
      blogTags: blog?.blogTags || [],
    },
  });

  // Fetch categories from the server
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllBlogTags();
        if (data?.tags) {
          setCategories(
            data?.tags?.map((category) => ({
              value: category,
              label: category,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (d) => {
    try {
      const res = await fetch(`${SERVER}/api/admin/update-a-blog/${blog?._id}`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(d),
      });
      const data = await res.json();
      if (data.status === 200) {
        toast.success("Blog updated successfully!");
        window.location.href = '/dashboard/blogs'
      } else {
        toast.error("Failed to update blog. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 min-h-screen w-full">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Edit Blog
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Blog Title
          </label>
          <input
            type="text"
            id="title"
            {...register("title")}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="Enter blog title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <RichTextEditor
          initialContent={blog?.content}
          onContentChange={(content) => setValue("content", content)}
        />

        <DatePicker
          defaultDate={blog?.date ? new Date(blog.date) : new Date()}
          onChangeHanlder={(date) => setValue("date", date)}
        />

        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Author Name
          </label>
          <input
            type="text"
            id="authorName"
            {...register("authorName")}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="Enter author name"
          />
        </div>

        <div>
          <label htmlFor="postStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Post Status
          </label>
          <select
            id="postStatus"
            {...register("postStatus")}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div>
          <label htmlFor="blogTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags/Categories
          </label>
          <CreatableSelect
            isMulti
            instanceId="creatable-select-category"
            className="text-black"
            options={categories}
            defaultValue={blog?.blogTags.map((tag) => ({
              value: tag,
              label: tag,
            }))}
            onChange={(selectedOptions) =>
              setValue("blogTags", selectedOptions.map((option) => option.value))
            }
            placeholder="Select or create categories"
          />
        </div>

        <div>
          <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            SEO Title
          </label>
          <input
            type="text"
            id="seoTitle"
            {...register("seoTitle")}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="Enter SEO title"
          />
        </div>

        <div>
          <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            SEO Description
          </label>
          <textarea
            id="seoDescription"
            {...register("seoDescription")}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="Enter SEO description"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="seoTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            SEO Tags
          </label>
          <input
            type="text"
            id="seoTags"
            {...register("seoTags")}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="Enter SEO tags, separated by commas"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Update Blog
        </button>
      </form>
      <ToastContainer transition={Flip} />
    </div>
  );
};

export default EditBlog;
