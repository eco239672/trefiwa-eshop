import { afterEach, describe, expect, it, vi } from "vitest";
import { guestOrderCookieOptions } from "../lib/checkout/guest-cookie";

afterEach(() => vi.unstubAllEnvs());

describe("guest order cookie", () => {
  it("is restricted to the authorized success route and hardened in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(guestOrderCookieOptions("safe-order")).toMatchObject({
      httpOnly: true, secure: true, sameSite: "lax", path: "/checkout/success/safe-order", maxAge: 60 * 60 * 24 * 30,
    });
  });
});
