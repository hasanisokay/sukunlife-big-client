"use server";
import { REVALIDATE_TIME } from "@/constants/times.mjs";
import { SERVER } from "@/constants/urls.mjs";

const getAllCategoryFiveBlogsPublic = async (
  page = 1,
  limit = 5,
  keyword = "",
  tags = "",
  sort = "newest",
  skip = 0,
) => {
  try {
    const res = await fetch(
      `${SERVER}/api/public/blogs-with-all-category-limited-to-five?limit=${limit}&&page=${page}&&keyword=${keyword}&&tags=${tags}&&sort=${sort}&&skip=${skip}`,
      {
        next: { revalidate: REVALIDATE_TIME },
      },
    );
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getAllCategoryFiveBlogsPublic;
