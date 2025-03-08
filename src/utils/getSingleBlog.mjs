"use server";
import { ACCESS_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const getSingleBlog = async (blogUrl) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  try {
    const res = await fetch(`${SERVER}/api/public/blog/${blogUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken?.value || ""}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getSingleBlog;
