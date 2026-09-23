import { describe, expect, it } from "vitest";
import { isAdminRole } from "../lib/admin/access";
import { normalizeStockAdjustment } from "../lib/inventory/service";
import { canTransitionOrderStatus, canTransitionPaymentStatus, ORDER_STATUSES, PAYMENT_STATUSES } from "../lib/orders/status";
import { getCardPaymentProvider } from "../lib/payments/provider";
import { calculateShippingCents, getDeliveryMethod } from "../lib/checkout/config";

describe("LOW commerce safety rules", () => {
  it("recognizes only the database ADMIN role as privileged", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("CUSTOMER")).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });

  it("allows only safe order and payment status transitions", () => {
    expect(canTransitionOrderStatus(ORDER_STATUSES.AWAITING_PAYMENT, ORDER_STATUSES.PROCESSING)).toBe(true);
    expect(canTransitionOrderStatus(ORDER_STATUSES.SHIPPED, ORDER_STATUSES.PROCESSING)).toBe(false);
    expect(canTransitionOrderStatus(ORDER_STATUSES.DELIVERED, ORDER_STATUSES.CANCELLED)).toBe(false);
    expect(canTransitionPaymentStatus(PAYMENT_STATUSES.AWAITING_PAYMENT, PAYMENT_STATUSES.PAID)).toBe(true);
    expect(canTransitionPaymentStatus(PAYMENT_STATUSES.PAID, PAYMENT_STATUSES.AWAITING_PAYMENT)).toBe(false);
  });

  it.each([1, -1, 100_000, -100_000])("accepts a bounded non-zero stock adjustment %i", (delta) => {
    expect(normalizeStockAdjustment(delta)).toBe(delta);
  });

  it.each([0, 100_001, -100_001, 1.5, "1"])('rejects unsafe stock adjustment %s', (delta) => {
    expect(() => normalizeStockAdjustment(delta)).toThrow("Úprava skladu");
  });

  it("uses the shared free-shipping threshold boundary", () => {
    const courier = getDeliveryMethod("Slovensko", "sk_kurier");
    expect(courier).not.toBeNull();
    expect(calculateShippingCents(BigInt(3_999), courier!)).toBe(BigInt(490));
    expect(calculateShippingCents(BigInt(4_000), courier!)).toBe(BigInt(0));
  });

  it("keeps card payments disabled until a verified provider adapter exists", () => {
    expect(getCardPaymentProvider()).toBeNull();
  });
});
