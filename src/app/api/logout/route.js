import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    cookies().delete(ACCESS_TOKEN);
    cookies().delete(REFRESH_TOKEN);
    return NextResponse.json({ status: 200, message: "Logout success." });
  } catch {
    return NextResponse.json({ status: 500, message: "Server Error." });
  }
};