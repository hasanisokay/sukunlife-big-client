"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import DatePicker from "@/components/ui/datepicker/Datepicker";
import { SERVER } from "@/constants/urls.mjs";
import CreatableSelect from "react-select/creatable";
import { Flip, toast, ToastContainer } from "react-toastify";
import uploadImage from "@/utils/uploadImage.mjs";
import getAllBlogTags from "@/utils/getAllBlogTags.mjs";
import generateUniqueIds from "@/utils/generateUniqueIds.mjs";
import addNewBlog from "@/server-functions/addNewBlog.mjs";
import checkBlogUrl from "@/server-functions/checkBlogUrl.mjs";

const blogSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  content: z.string().min(2, "Content must be at least 2 characters long"),
  date: z.date("Date missing"),
  blogUrl: z.string().min(1, "URL is required"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoTags: z.string().optional(),
  authorName: z.string().optional(),
  postStatus: z.enum(["public", "private"]),
  blogTags: z.array(z.string()).optional(),
  blogCoverPhoto: z.string().url("Blog Cover Photo Missing"),
});

const AdminAddBlogPage = () => {
  const [urlCheckMessage, setUrlCheckMessage] = useState("");
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [urlAvailable, setUrlAvailable] = useState(false);
  const [categories, setCategories] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      content: "",
      date: new Date(),
      blogUrl: "",
      seoTitle: "",
      seoDescription: "",
      seoTags: "",
      authorName: "",
      postStatus: "public",
      blogTags: [],
      blogCoverPhoto: "",
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

  const checkUrlAvailability = async (url) => {
    setCheckingUrl(true);
    try {
      const data = await checkBlogUrl(url);
      setUrlCheckMessage(data?.isAvailable ? "URL is available!" : "URL is already taken.");
      setUrlAvailable(data?.isAvailable);
    } catch (error) {
      setUrlCheckMessage("Failed to check URL availability. Please try again.");
    } finally {
      setCheckingUrl(false);
    }
  };

  const onSubmit = async (d) => {
    try {
      if (!urlAvailable) {
        toast.error("Blog Url must be unique.")
        return
      }
      const data = await addNewBlog(d);
      if (data?.status === 200) {
        toast.success(data.message)
        reset();
        setUrlAvailable(false);
        setUrlCheckMessage("");
        setCheckingUrl(false);
        setValue("date", new Date())
      }
      else {
        toast.error(data.message)
      }
    } catch (e) {
      console.log(e)
      toast.error("Reload the page and try again.")
    }
  };

  const uploadImageHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadImage(file);
      if (url.length > 0) {
        setValue('blogCoverPhoto', url)
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 min-h-screen w-full">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Add New Blog
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
        <div>
          <label htmlFor="blogCoverPhoto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Blog Cover Photo
          </label>
          <input onChange={uploadImageHandler} type="file" accept="image/*" name="blogCoverPhoto" id="blogCoverPhoto" />
          {errors.blogCoverPhoto && <p className="text-red-500 text-sm mt-1">{errors.blogCoverPhoto.message}</p>}
        </div>
        <div>
          <label htmlFor="blogUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Blog URL
          </label>
          <input
            type="text"
            id="blogUrl"
            {...register("blogUrl")}
            onBlur={(e) => checkUrlAvailability(e.target.value)}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="Enter blog URL"
          />
          {checkingUrl ? (
            <p className="text-blue-500 text-sm mt-1">Checking URL availability...</p>
          ) : (
            <p className={`text-gray-500 text-sm mt-1 ${urlCheckMessage === "URL is already taken." && 'text-red-500'}`}>{urlCheckMessage}</p>
          )}
          {errors.blogUrl && <p className="text-red-500 text-sm mt-1">{errors.blogUrl.message}</p>}
        </div>

        <RichTextEditor onContentChange={(content) => setValue("content", content)} uniqueKey={generateUniqueIds(1)} />
        {errors?.content && <p className="text-red-500 text-sm mt-1">{errors?.content?.message}</p>}
        <DatePicker defaultDate={new Date()} onChangeHanlder={(date) => setValue("date", date)} />
        {errors?.date && <p className="text-red-500 text-sm mt-1">{errors?.date?.message}</p>}
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
            instanceId='creatable-select-category'
            className="text-black"
            options={categories}
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
          Submit Blog
        </button>
      </form>
      <ToastContainer transition={Flip} position="top-center" />
    </div>
  );
};

export default AdminAddBlogPage;
