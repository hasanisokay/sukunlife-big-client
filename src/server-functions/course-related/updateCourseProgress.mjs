"use server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

export const updateCourseProgress = async (courseId, data) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);
  try {
    const response = await fetch(
      `${SERVER}/api/user/update-progress/${courseId}`,
      {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${accessToken?.value || ""}`,
          "X-Refresh-Token": refreshToken?.value || "",
          "Content-Type": "application/json",
        },

        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update progress");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating course progress:", error);
    throw error;
  }
};

export const markItemComplete = async (courseId, itemId, moduleId) => {
  return await updateCourseProgress(courseId, {
    action: "mark-complete",
    itemId,
    moduleId,
  });
};

export const updateVideoTime = async (courseId, itemId, videoData) => {
  return await updateCourseProgress(courseId, {
    action: "update-video-time",
    itemId,
    data: videoData,
  });
};

export const submitQuizResult = async (courseId, itemId, quizData) => {
  return await updateCourseProgress(courseId, {
    action: "quiz-result",
    itemId,
    data: quizData,
  });
};

export const setCurrentItem = async (courseId, itemId) => {
  return await updateCourseProgress(courseId, {
    action: "set-current-item",
    itemId,
  });
};
