'use server'
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const getAllVoucher = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);
  try {
    const res = await fetch(`${SERVER}/api/admin/vouchers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken?.value || ""}`, 
        "X-Refresh-Token": refreshToken?.value || "", 
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default getAllVoucher;
