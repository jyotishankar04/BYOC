import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for session cookie
  const sessionCookie = req.cookies.get("refresh_token");

  if (!sessionCookie) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect both app pages and the onboarding page — both require auth
  matcher: ["/app/:path*", "/onboard"],
};
