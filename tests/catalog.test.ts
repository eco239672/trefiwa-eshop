import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.hoisted(() => vi.fn());
vi.mock("../lib/db", () => ({ db: { product: { findMany } } }));

const { getCatalogProducts } = await import("../lib/catalog");

describe("server catalog loading", () => {
  beforeEach(() => {
    findMany.mockResolvedValue([{ id: "product", name: "Čaj", description: null, imageUrl: " /produkty/caj.jpg\n", subCategory: { name: "Čaje", category: { name: "Čaje" } }, variants: [{ id: "variant", weight: "100 g", price: new Prisma.Decimal("4.50"), oldPrice: null, stock: 2 }] }]);
  });

  it("loads a category on the server and serializes Decimal values safely", async () => {
    await expect(getCatalogProducts("Čaje")).resolves.toEqual([{ id: "product", name: "Čaj", description: null, imageUrl: "/produkty/caj.jpg", category: "Čaje", priceFrom: 4.5, inStock: true, variants: [{ id: "variant", weight: "100 g", price: 4.5, oldPrice: null, stock: 2 }] }]);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { subCategory: { name: "Čaje" } } }));
  });

  it("marks a product without a variant as unavailable and gives it no display price", async () => {
    findMany.mockResolvedValue([{ id: "product-without-variant", name: "Čajník", description: null, imageUrl: null, subCategory: { name: "Doplnky", category: { name: "Doplnky" } }, variants: [] }]);
    await expect(getCatalogProducts()).resolves.toEqual([{ id: "product-without-variant", name: "Čajník", description: null, imageUrl: null, category: "Doplnky", priceFrom: null, inStock: false, variants: [] }]);
  });
});
