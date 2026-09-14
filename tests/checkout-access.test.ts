import { describe, expect, it } from "vitest";
import { canAccessOrder } from "../lib/checkout/access";

describe("canAccessOrder", () => {
  it("denies a different logged-in user access to an order", () => {
    expect(canAccessOrder({ userId: "owner", guestAccessToken: null }, "attacker", undefined)).toBe(false);
  });

  it("allows only the owner of an account order", () => {
    expect(canAccessOrder({ userId: "owner", guestAccessToken: null }, "owner", undefined)).toBe(true);
  });

  it("requires the exact non-guessable cookie token for a guest order", () => {
    expect(canAccessOrder({ userId: null, guestAccessToken: "correct-token" }, null, undefined)).toBe(false);
    expect(canAccessOrder({ userId: null, guestAccessToken: "correct-token" }, null, "wrong-token")).toBe(false);
    expect(canAccessOrder({ userId: null, guestAccessToken: "correct-token" }, null, "correct-token")).toBe(true);
  });
});
