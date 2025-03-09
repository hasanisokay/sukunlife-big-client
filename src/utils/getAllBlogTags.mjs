import { SERVER } from "@/constants/urls.mjs";

const getAllBlogTags = async () => {
  try {
    const res = await fetch(`${SERVER}/api/public/all-blog-tags`, {
      credentials: "include",
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

export default getAllBlogTags;
