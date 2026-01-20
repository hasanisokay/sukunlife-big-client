"use server";
import { SERVER } from "@/constants/urls.mjs";

const getAllBlogPublic = async (
  page = 1,
  limit = 10,
  keyword = "",
  tags = "",
  sort = "newest",
  skip = 0
) => {

  try {
    const res = await fetch(
      `${SERVER}/api/public/blogs?limit=${limit}&&page=${page}&&keyword=${keyword}&&tags=${tags}&&sort=${sort}&&skip=${skip}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
    next:{revalidate:3600}  
    }
    );
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getAllBlogPublic;
