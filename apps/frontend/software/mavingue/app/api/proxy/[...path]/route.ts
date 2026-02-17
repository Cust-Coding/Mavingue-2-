import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SPRING_API_BASE_URL!;

// cookies
const TOKEN_COOKIE = "access_token";

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return forward(req, ctx);
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return forward(req, ctx);
}
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return forward(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return forward(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return forward(req, ctx);
}

async function forward(req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = ctx.params.path.join("/");
  const url = new URL(req.url);
  const target = `${BASE}/${path}${url.search}`;

  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  const headers = new Headers(req.headers);
  headers.delete("host");

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.text().catch(() => undefined);

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body,
  });


  if (path.endsWith("auth/login") && upstream.ok) {
    const data = await upstream.json();
    const res = NextResponse.json(data);

    if (data?.accessToken) {
      res.cookies.set(TOKEN_COOKIE, data.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // muda p/ true em produção https
        path: "/",
      });
    }
    return res;
  }


  if (path.endsWith("auth/logout")) {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(TOKEN_COOKIE);
    return res;
  }

  const contentType = upstream.headers.get("content-type") || "";
  const raw = await upstream.text();

  return new NextResponse(raw, {
    status: upstream.status,
    headers: {
      "content-type": contentType,
    },
  });
}
