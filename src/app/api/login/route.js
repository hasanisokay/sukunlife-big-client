import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/names.mjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const ACCESS_COOKIE_MAX_AGE = 2 * 60 * 60 * 1000;
    const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

    const body = await req.json();
    const { accessToken, refreshToken } = body;
    const cookieStore = await cookies();

     cookieStore.set({
      name: ACCESS_TOKEN,
      value: accessToken,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: ACCESS_COOKIE_MAX_AGE,
    });

    cookieStore.set({
      name: REFRESH_TOKEN,
      value: refreshToken,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: REFRESH_COOKIE_MAX_AGE,
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
