import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function c(req: NextRequest, name: string) {
  return req.cookies.get(name)?.value ?? null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/staff") || pathname.startsWith("/cliente")) {
    const token = c(req, "token");
    const role = c(req, "role");

    if (!token || !role) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/admin") && role !== "ADMIN") return NextResponse.redirect(new URL("/forbidden", req.url));

    if (pathname.startsWith("/staff") && !(role === "ADMIN" || role === "FUNCIONARIO" || role === "STAFF"))
      return NextResponse.redirect(new URL("/forbidden", req.url));

    if (pathname.startsWith("/cliente") && role !== "CLIENTE") return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/cliente/:path*", "/forbidden"],
};