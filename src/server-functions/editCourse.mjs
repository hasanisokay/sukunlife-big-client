"use server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const editCourse = async (
  data,
  modules,
  coverPhotoUrl,
  learningItems,
  courseId,
  instructorImage,
  additionalMaterials,
  courseIncludes
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);

  try {
    const res = await fetch(`${SERVER}/api/admin/course/${courseId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken?.value || ""}`,
        "X-Refresh-Token": refreshToken?.value || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        modules,
        coverPhotoUrl,
        learningItems,
        instructorImage,
        additionalMaterials,
        courseIncludes,
      }),
      credentials: "include",
    });
    const d = await res.json();
    return d;
  } catch {
    return null;
  }
};

export default editCourse;
