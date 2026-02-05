import { NextResponse } from "next/server";
import { ACCESS_TOKEN, REFRESH_TOKEN, THEME_COOKIE } from "./constants/names.mjs";

export async function middleware(request) {
  // return NextResponse.next();
  let accessToken = request.cookies.get(ACCESS_TOKEN)?.value;
  let refreshToken = request.cookies.get(REFRESH_TOKEN)?.value;

    const theme = request.cookies.get(THEME_COOKIE)?.value ?? "light";

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
  // Protect course modules/items
  if (pathName.startsWith("/courses/")) {
    const segments = pathName.split("/").filter(Boolean); 
    // ["courses", ":courseId", ":moduleId", ":itemId"]

    if (segments.length > 2 && (!accessToken && refreshToken)) {
      const loginUrl = new URL("/", request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (segments.length > 2 && (!accessToken && !refreshToken)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathName);
      return NextResponse.redirect(loginUrl);
    }
  }

    const response = NextResponse.next();

  // Pass theme to layout without cookies()
  response.headers.set("x-theme", theme);

  return response;
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
