import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/watchlist"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/dashboard/:path*", "/watchlist/:path*"],
};
