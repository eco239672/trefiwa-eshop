import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSigningKey } from "./lib/session";

/** Protects account routes before their server components can access data. */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("trefiwa_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/", request.url));
  try {
    await jwtVerify(token, getJwtSigningKey());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = { matcher: ["/ucet/:path*", "/admin/:path*"] };
