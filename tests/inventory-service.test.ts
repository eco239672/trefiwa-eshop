import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ stock: 3, adjustments: [] as Record<string, unknown>[] }));
const tx = vi.hoisted(() => ({
  productVariant: {
    updateMany: vi.fn(async ({ where, data }: { where: { stock?: { gte?: number } }; data: { stock: { increment: number } } }) => {
      const minimum = where.stock?.gte ?? 0;
      if (state.stock < minimum) return { count: 0 };
      state.stock += data.stock.increment;
      return { count: 1 };
    }),
    findUnique: vi.fn(async () => ({ stock: state.stock, productId: "product-1" })),
  },
  stockAdjustment: { create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => { state.adjustments.push(data); return data; }) },
}));
vi.mock("../lib/db", () => ({ db: { $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)) } }));

const { adjustVariantStock, InventoryError } = await import("../lib/inventory/service");

describe("stock adjustment transaction", () => {
  beforeEach(() => { state.stock = 3; state.adjustments = []; vi.clearAllMocks(); });

  it("updates stock and writes its immutable adjustment snapshot together", async () => {
    await expect(adjustVariantStock("legacy-100g", -2, "admin-1", "inventory count")).resolves.toMatchObject({ stock: 1, productId: "product-1" });
    expect(state.adjustments).toEqual([expect.objectContaining({ variantId: "legacy-100g", adminUserId: "admin-1", delta: -2, previousStock: 3, newStock: 1 })]);
  });

  it("rejects a decrement that would make stock negative without an audit write", async () => {
    await expect(adjustVariantStock("legacy-100g", -4, "admin-1")).rejects.toBeInstanceOf(InventoryError);
    expect(state.stock).toBe(3);
    expect(state.adjustments).toEqual([]);
  });
});
