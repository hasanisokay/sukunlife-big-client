import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const ACCESS_COOKIE_MAX_AGE = 2 * 60 * 60; // 2 hours in seconds
    const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

    const body = await req.json();
    const { accessToken, refreshToken } = body;
    const cookieStore = await cookies();

    cookieStore.set({
      name: ACCESS_TOKEN,
      value: accessToken,
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: ACCESS_COOKIE_MAX_AGE,
      path: "/",
    });

    cookieStore.set({
      name: REFRESH_TOKEN,
      value: refreshToken,
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: "/",
    });
    return NextResponse.json({
      status: 200,
      message: "Validated",
    });
  } catch {
    return NextResponse.json({
      status: 500,
      error: "Server Error",
      message: "Server side error. Contact support.",
    });
  }
};
