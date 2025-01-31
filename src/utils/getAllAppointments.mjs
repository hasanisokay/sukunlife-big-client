"use server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const getAllAppointment = async (
  page = 1,
  limit = 10,
  filter = "upcoming",
  sort = "newest",
  keyword = "",
  skip = ""
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);

  try {
    const res = await fetch(
      `${SERVER}/api/admin/appointments?limit=${limit}&&page=${page}&&filter=${filter}&&sort=${sort}&&keyword=${keyword}&&skip=${skip}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.value || ""}`, // send access token as Bearer
          "X-Refresh-Token": refreshToken?.value || "", // send refresh token as a custom header
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getAllAppointment;
