import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ count: 0 }));
const db = vi.hoisted(() => ({
  rateLimitWindow: {
    upsert: vi.fn(async () => ({ count: ++state.count })),
  },
}));

vi.mock("../lib/db", () => ({ db }));

const { consumeRateLimit, createRateLimitWindow } = await import("../lib/security/rate-limit");

describe("database-backed rate limiter", () => {
  it("uses stable hashed fixed windows and denies attempts above the limit", async () => {
    const options = { scope: "test", subject: "192.0.2.5", limit: 2, windowSeconds: 60, now: new Date("2026-09-12T10:00:05Z") };
    expect(createRateLimitWindow(options).key).toBe(createRateLimitWindow(options).key);
    state.count = 0;
    await expect(consumeRateLimit(options)).resolves.toMatchObject({ allowed: true });
    await expect(consumeRateLimit(options)).resolves.toMatchObject({ allowed: true });
    await expect(consumeRateLimit(options)).resolves.toMatchObject({ allowed: false, retryAfterSeconds: 55 });
  });
});
