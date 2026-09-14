import { describe, expect, it } from "vitest";
import { keepExistingCartVariants, sanitizePersistedCart } from "../lib/cart/validation";

const validItem = { id: "anglicky18-100g", variantId: "anglicky18-100g", name: "Black Ice Tea (100g)", price: 4.9, quantity: 2 };

describe("persisted cart sanitization", () => {
  it("keeps a cart item with a valid ProductVariant ID", () => {
    expect(sanitizePersistedCart([validItem])).toEqual({ items: [validItem], removedCount: 0 });
  });

  it("removes a stale localStorage item without a variant ID", () => {
    expect(sanitizePersistedCart([{ ...validItem, variantId: undefined }])).toEqual({ items: [], removedCount: 1 });
  });

  it("keeps valid items when database validation removes a stale variant", () => {
    const stale = { ...validItem, id: "removed-100g", variantId: "removed-100g" };
    expect(keepExistingCartVariants([validItem, stale], [validItem.variantId])).toEqual({ items: [validItem], removedCount: 1 });
  });

  it("does not treat a product ID as a validated ProductVariant ID", () => {
    const productIdItem = { ...validItem, id: "product-id", variantId: "product-id" };
    expect(keepExistingCartVariants([productIdItem], [])).toEqual({ items: [], removedCount: 1 });
  });
});
