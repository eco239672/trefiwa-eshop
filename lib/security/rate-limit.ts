import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "../db";
import { logSecurityEvent } from "./audit";

export type RateLimitOptions = {
  scope: string;
  subject: string;
  limit: number;
  windowSeconds: number;
  now?: Date;
};

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function hashRateLimitSubject(subject: string) {
  return createHash("sha256").update(subject.trim().toLowerCase()).digest("hex");
}

export function createRateLimitWindow(options: RateLimitOptions) {
  if (!Number.isInteger(options.limit) || options.limit < 1 || !Number.isInteger(options.windowSeconds) || options.windowSeconds < 1) {
    throw new Error("Invalid rate limit configuration.");
  }
  const now = options.now ?? new Date();
  const windowMs = options.windowSeconds * 1_000;
  const windowStartMs = Math.floor(now.getTime() / windowMs) * windowMs;
  const subjectHash = hashRateLimitSubject(options.subject);
  return {
    key: `${options.scope}:${subjectHash}:${windowStartMs}`,
    subjectHash,
    windowStart: new Date(windowStartMs),
    retryAfterSeconds: Math.max(1, Math.ceil((windowStartMs + windowMs - now.getTime()) / 1_000)),
  };
}

/** Database-backed fixed-window counter: shared across Vercel instances and deployments. */
export async function consumeRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const window = createRateLimitWindow(options);
  try {
    const result = await db.rateLimitWindow.upsert({
      where: { key: window.key },
      create: { key: window.key, scope: options.scope, subjectHash: window.subjectHash, windowStart: window.windowStart, count: 1 },
      update: { count: { increment: 1 } },
      select: { count: true },
    });
    const allowed = result.count <= options.limit;
    if (!allowed) logSecurityEvent("rate_limit_denied", options.scope);
    return { allowed, retryAfterSeconds: window.retryAfterSeconds };
  } catch {
    logSecurityEvent("rate_limit_unavailable", options.scope);
    // Fail closed for sensitive server actions; callers receive a generic retry response.
    return { allowed: false, retryAfterSeconds: window.retryAfterSeconds };
  }
}

export async function consumeRequestRateLimit(
  scope: string,
  fallbackSubject: string,
  limit: number,
  windowSeconds: number,
) {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = requestHeaders.get("x-real-ip")?.trim();
  // Vercel provides the forwarding headers. A fallback keeps local/server-action calls scoped.
  return consumeRateLimit({ scope, subject: forwarded || realIp || fallbackSubject, limit, windowSeconds });
}
