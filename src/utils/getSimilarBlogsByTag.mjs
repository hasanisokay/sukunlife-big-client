"use server";
import { ACCESS_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const getSimilarBlogsByTag = async (
  page = 1,
  limit = 5,
  skippingBlogUrl,
  keyword = "",
  tags = "",
  sort = "newest",
  skip = 0
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  try {
    const res = await fetch(
      `${SERVER}/api/public/similar-blogs-by-tags?limit=${limit}&&skippingBlogUrl=${skippingBlogUrl}&&page=${page}&&keyword=${keyword}&&tags=${tags.join(", ")}&&sort=${sort}&&skip=${skip}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.value || ""}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getSimilarBlogsByTag;
