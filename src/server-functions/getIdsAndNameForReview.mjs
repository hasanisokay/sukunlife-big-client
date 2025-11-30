"use server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const getIdsAndNameForReview = async (type='all') => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);
  try {
    const res = await fetch(
      `${SERVER}/api/admin/get-name-and-ids-for-review?type=${type}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.value || ""}`,
          "X-Refresh-Token": refreshToken?.value || "",
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};


export default getIdsAndNameForReview;