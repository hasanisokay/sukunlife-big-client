"use server";
import { ACCESS_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const getResources = async (
  page = 1,
  limit = 10,
  keyword = "",
  sort = "newest",
  type = "all"
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  try {
    const res = await fetch(
      `${SERVER}/api/public/resources?limit=${limit}&&page=${page}&&keyword=${keyword}&&sort=${sort}&&type=${type}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.value || ""}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        next: { revalidate: 360 },
      }
    );
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getResources;
