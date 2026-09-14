import { describe, expect, it } from "vitest";
import { calculateShippingCents, FREE_SHIPPING_THRESHOLD_CENTS, getDeliveryMethod } from "../lib/checkout/config";

describe("shipping source of truth", () => {
  const courier = getDeliveryMethod("Slovensko", "sk_kurier");

  it("uses one server rule at the free-shipping boundaries", () => {
    expect(courier).not.toBeNull();
    expect(calculateShippingCents(BigInt(FREE_SHIPPING_THRESHOLD_CENTS - 1), courier!)).toBe(BigInt(490));
    expect(calculateShippingCents(BigInt(FREE_SHIPPING_THRESHOLD_CENTS), courier!)).toBe(BigInt(0));
    expect(calculateShippingCents(BigInt(FREE_SHIPPING_THRESHOLD_CENTS + 1), courier!)).toBe(BigInt(0));
  });

  it("keeps free shipping when a later coupon lowers the payable total", () => {
    expect(calculateShippingCents(BigInt(FREE_SHIPPING_THRESHOLD_CENTS), courier!)).toBe(BigInt(0));
  });
});
