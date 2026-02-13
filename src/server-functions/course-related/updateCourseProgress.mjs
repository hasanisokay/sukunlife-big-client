"use server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

export const updateCourseProgress = async (
  courseId,
  moduleId,
  itemId,
  data,
  action,
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);

  try {
    const response = await fetch(
      `${SERVER}/api/user/update-progress/${courseId}/${moduleId}/${itemId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken?.value || ""}`,
          "X-Refresh-Token": refreshToken?.value || "",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action,
          data,
        }),
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

export const updateVideoTime = async (
  courseId,
  moduleId,
  itemId,
  videoData,
) => {
  return await updateCourseProgress(courseId, {
    action: "update-video-time",
    itemId,
    data: videoData,
  });
};

export const submitQuizResult = async (
  courseId,
  moduleId,
  itemId,
  quizData,
) => {
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

// File token helper
export const getFileToken = async (courseId, filename) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);

  try {
    const response = await fetch(`${SERVER}/api/user/course/file/token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken?.value || ""}`,
        "X-Refresh-Token": refreshToken?.value || "",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ courseId, filename }),
    });

    if (!response.ok) {
      throw new Error("Failed to get file token");
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error getting file token:", error);
    return null;
  }
};
export const getStreamData = async (courseId, filename) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);

  try {
    const response = await fetch(
      `${SERVER}/api/user/course/stream-url/${courseId}/${filename}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken?.value || ""}`,
          "X-Refresh-Token": refreshToken?.value || "",
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to get stream data.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting stream data:", error);
    return null;
  }
};
export const getPublicStreamData = async (courseId, filename) => {
  try {
    const response = await fetch(
      `${SERVER}/api/public/course/stream-url/${courseId}/${filename}`,
    );
    if (!response.ok) {
      throw new Error("Failed to get stream data.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting stream data:", error);
    return null;
  }
};
