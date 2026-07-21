import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple static session check for route matching.
// Better Auth handles the actual session cookie cryptographically.
export async function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__secure-better-auth.session_token");

  const path = request.nextUrl.pathname;

  // 1. Unauthenticated users trying to hit protected pages are redirected to login.
  // /dashboard is intentionally allowed through even unauthenticated — the client
  // component handles the auth check and redirect itself (avoids DB round-trips in middleware).
  if (!sessionCookie && (path.startsWith("/admin") || path.startsWith("/employee"))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users who hit /login or /register go to /dashboard,
  // which then client-side redirects to /admin or /employee without a DB call.
  if (sessionCookie && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/employee/:path*",
    "/login",
    "/register",
  ],
};
