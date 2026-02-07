"use server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const getAllPayments = async (
  page = 1,
  limit = 10,
  keyword = "",
  sort = "newest",
  skip = 0,
  fulfilled = "",
  startDate = "",
  endDate = "",
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);

  try {
    const res = await fetch(
      `${SERVER}/api/admin/payments?limit=${limit}&&page=${page}&&keyword=${keyword}&&sort=${sort}&&skip=${skip}&&fulfilled=${fulfilled}&&startDate=${startDate}&&endDate=${endDate}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.value || ""}`,
          "X-Refresh-Token": refreshToken?.value || "",
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getAllPayments;
