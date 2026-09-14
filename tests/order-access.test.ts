import { describe, expect, it } from "vitest";
import { canViewAccountOrder } from "../lib/orders/access";

describe("account order authorization", () => {
  it("rejects an IDOR attempt and guest orders in an account route", () => {
    expect(canViewAccountOrder("owner", "attacker")).toBe(false);
    expect(canViewAccountOrder(null, "owner")).toBe(false);
  });

  it("allows only the authenticated order owner", () => {
    expect(canViewAccountOrder("owner", "owner")).toBe(true);
  });
});
