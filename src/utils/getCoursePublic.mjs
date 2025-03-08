"use server";
import { SERVER } from "@/constants/urls.mjs";

const getCoursePublic = async (courseId) => {
  try {
    const res = await fetch(`${SERVER}/api/public/course/${courseId}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getCoursePublic;
