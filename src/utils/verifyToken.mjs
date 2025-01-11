"use server";
import { ACCESS_TOKEN } from "@/constants/names.mjs";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export const verifyToken = async (token = null) => {
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(ACCESS_TOKEN)?.value?.split("Bearer")[1]?.trim();
  }
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.JWT_ENCRYPTION_KEY);
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.exp * 1000 < Date.now()) {
      return null;
    } else {
      return payload;
    }
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return false;
  }
};
