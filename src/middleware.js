import { NextResponse } from "next/server";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants/names.mjs";

export async function middleware(request) {
  // return NextResponse.next();
  let accessToken = request.cookies.get(ACCESS_TOKEN)?.value;
  let refreshToken = request.cookies.get(REFRESH_TOKEN)?.value;

  const pathName = request.nextUrl.pathname;
  if (
    accessToken &&
    (pathName === "/login" ||
      pathName === "/signup" ||
      pathName === "/identity")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!accessToken && refreshToken && pathName.includes("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!accessToken && !refreshToken && pathName.includes("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathName);
    return NextResponse.redirect(loginUrl);
  }

  // if (pathName.includes("/api") && token) {
  //   const payload = await verifyToken(token);
  //   if (!payload) {
  //     await logOut();
  //     const loginUrl = new URL("/login", request.url);
  //     loginUrl.searchParams.set("redirectTo", pathName);
  //     return NextResponse.redirect(loginUrl);
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
  ],
};
