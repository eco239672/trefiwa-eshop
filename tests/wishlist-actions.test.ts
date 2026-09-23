import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  session: { id: "owner-a" } as { id: string } | null,
  saved: false,
  lastDeleteWhere: null as unknown,
  lastCreateData: null as unknown,
}));

const db = vi.hoisted(() => ({
  product: { findUnique: vi.fn(async () => ({ id: "product-1" })), findMany: vi.fn(async () => []) },
  wishlistItem: {
    findUnique: vi.fn(async () => state.saved ? { userId: "owner-a", productId: "product-1" } : null),
    delete: vi.fn(async ({ where }) => { state.lastDeleteWhere = where; state.saved = false; }),
    create: vi.fn(async ({ data }) => { state.lastCreateData = data; state.saved = true; }),
    createMany: vi.fn(async () => ({ count: 0 })),
  },
  orderItem: { findFirst: vi.fn(async () => ({ id: "item" })) },
  review: { upsert: vi.fn(async () => ({})) },
}));

vi.mock("../app/authActions", () => ({ getSession: vi.fn(async () => state.session) }));
vi.mock("../lib/db", () => ({ db }));
vi.mock("../lib/catalog", () => ({ getCatalogProductsByIds: vi.fn(async () => []) }));
vi.mock("../lib/security/rate-limit", () => ({ consumeRequestRateLimit: vi.fn(async () => ({ allowed: true })) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { toggleWishlist } = await import("../app/commerceActions");

describe("wishlist ownership", () => {
  beforeEach(() => {
    state.session = { id: "owner-a" };
    state.saved = false;
    state.lastDeleteWhere = null;
    state.lastCreateData = null;
    vi.clearAllMocks();
  });

  it("writes a wishlist record only for the session owner", async () => {
    await expect(toggleWishlist("product-1")).resolves.toEqual({ ok: true, saved: true });
    expect(state.lastCreateData).toEqual({ userId: "owner-a", productId: "product-1" });
  });

  it("removes only the session owner's composite wishlist key", async () => {
    state.saved = true;
    await expect(toggleWishlist("product-1")).resolves.toEqual({ ok: true, saved: false });
    expect(state.lastDeleteWhere).toEqual({ userId_productId: { userId: "owner-a", productId: "product-1" } });
  });

  it("rejects anonymous mutation attempts", async () => {
    state.session = null;
    await expect(toggleWishlist("product-1")).resolves.toMatchObject({ ok: false });
    expect(db.wishlistItem.create).not.toHaveBeenCalled();
  });
});
