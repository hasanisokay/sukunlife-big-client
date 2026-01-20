"use server";


import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { cookies } from "next/headers";

const checkToken = async () => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_TOKEN);
  const refreshToken = cookieStore.get(REFRESH_TOKEN);
  if (!accessToken && !refreshToken) return null;
  if (accessToken && refreshToken) return null;
  if (!accessToken && refreshToken) {
    return refreshToken;
  }
};

export default checkToken;
