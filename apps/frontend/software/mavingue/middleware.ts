import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE = "access_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // públicas
  if (
    pathname.startsWith("/auth") ||
    pathname === "/" ||
    pathname.startsWith("/catalogo") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // protegidas: precisa cookie
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
