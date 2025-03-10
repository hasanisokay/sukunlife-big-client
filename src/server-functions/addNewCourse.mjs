"use server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const addNewCourse = async (data, modules, coverPhotoUrl, learningItems) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);

  try {
    const res = await fetch(`${SERVER}/api/admin/add-new-course`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken?.value || ""}`,
        "X-Refresh-Token": refreshToken?.value || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, modules, coverPhotoUrl, learningItems }),
      credentials: "include",
    });
    const d = await res.json();
    return d;
  } catch {
    return null;
  }
};

export default addNewCourse;
