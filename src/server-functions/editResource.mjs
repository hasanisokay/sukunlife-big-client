"use server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const editResource = async (resourceId, type, title, description, links) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);

  try {
    const res = await fetch(`${SERVER}/api/admin/edit-resource/${resourceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken?.value || ""}`,
        "X-Refresh-Token": refreshToken?.value || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        title,
        description,
        links,
      }),
      credentials: "include",
    });
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default editResource;
