"use server";
import { ACCESS_TOKEN } from "@/constants/names.mjs";
import { jwtVerify, decodeJwt } from "jose";
import { cookies } from "next/headers";

const getUserDataFromToken = async () => {
  const cookieStore = await cookies();
  
  let accessToken = cookieStore.get(ACCESS_TOKEN)?.value;
  if (!accessToken) return null;
  try {
    const decoded = decodeJwt(accessToken);
    if (decoded && decoded.exp) {
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTimeInSeconds) {
        return null;
      } else {
        const secret = new TextEncoder().encode(process.env.JWT_ENCRYPTION_KEY);
        const { payload } = await jwtVerify(accessToken, secret, {
          algorithms: ["HS256"], 
        });
        return payload.user;
      }
    }
    return null; 
  } catch (error) {
    console.error("Error decoding or verifying token:", error);
    return null;
  }
};

export default getUserDataFromToken;
