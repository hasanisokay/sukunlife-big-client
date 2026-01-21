import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { invoice } = body; 

    
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
