"use server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const getAllCourse = async (  page = 1,
    limit = 10,
    keyword = "",
    tags = "",
    sort = "newest",
    skip = 0) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);

  try {
    const res = await fetch(
      `${SERVER}/api/admin/courses?limit=${limit}&&page=${page}&&keyword=${keyword}&&tags=${tags}&&sort=${sort}&&skip=${skip}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.value || ""}`, 
          "X-Refresh-Token": refreshToken?.value || "", 
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

export default getAllCourse;
