import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function urlFor(parts: string[]) {
  return `${BACKEND}/${parts.join("/")}`;
}

async function handler(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const url = urlFor(path);

  const headers = new Headers();
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  // JWT do cookie -> Authorization Bearer
  const token = req.cookies.get("token")?.value;
  if (token) headers.set("authorization", `Bearer ${token}`);

  const method = req.method.toUpperCase();
  const init: RequestInit = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    const body = await req.arrayBuffer();
    if (body.byteLength) init.body = body;
  }

  const upstream = await fetch(url, init);

  const outHeaders = new Headers();
  const uct = upstream.headers.get("content-type");
  if (uct) outHeaders.set("content-type", uct);
  outHeaders.set("cache-control", "no-store");

  const data = await upstream.arrayBuffer();
  return new NextResponse(data, { status: upstream.status, headers: outHeaders });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;