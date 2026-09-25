import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidSession } from "@/lib/admin-session";

// Runs for /admin routes only: sends visitors without a valid PIN session to the PIN screen.
// The session is checked again on the server in every admin page and action (see lib/admin.ts).
export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname.startsWith("/admin/login");
  const signedIn = await isValidSession(request.cookies.get(ADMIN_COOKIE)?.value);

  if (!signedIn && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  // Signed in and on the PIN screen: go to the dashboard, unless the screen is showing an error
  if (signedIn && isLogin && !request.nextUrl.searchParams.has("error")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
