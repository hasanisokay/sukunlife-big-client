"use server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const updateCourseProgress = async (moduleIdx,courseId,itemIdx,newPercentage ) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);

  try {
    const res = await fetch(`${SERVER}/api/user/update-progress`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken?.value || ""}`,
        "X-Refresh-Token": refreshToken?.value || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        module: moduleIdx,
        courseId,
        item: itemIdx,
        percentage: newPercentage,
      }),
      credentials: "include",
    });
    const d = await res.json();
    return d;
  } catch {
    return null;
  }
};

export default updateCourseProgress;
