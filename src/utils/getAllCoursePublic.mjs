"use server";
import { SERVER } from "@/constants/urls.mjs";

const getAllCoursePublic = async (
  page = 1,
  limit = 10,
  keyword = "",
  tags = "",
  sort = "newest",
  skip = 0
) => {
  try {
    const res = await fetch(
      `${SERVER}/api/public/courses?limit=${limit}&&page=${page}&&keyword=${keyword}&&tags=${tags}&&sort=${sort}&&skip=${skip}`,
   
    );
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getAllCoursePublic;
