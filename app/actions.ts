"use server";

import { findCatalogProducts, getCatalogProducts } from "../lib/catalog";
import { MAX_CART_LINES, VARIANT_ID_PATTERN } from "../lib/cart/validation";
import { db } from "../lib/db";
import { consumeRequestRateLimit } from "../lib/security/rate-limit";

function toLegacyDisplay(products: Awaited<ReturnType<typeof getCatalogProducts>>) {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.priceFrom === null ? "Cena na vyžiadanie" : `od ${product.priceFrom.toFixed(2)} €`,
    category: product.category,
    imageUrl: product.imageUrl ?? undefined,
    stock: product.inStock ? 1 : 0,
    variants: product.variants,
  }));
}

export async function getAllProducts() {
  return toLegacyDisplay(await getCatalogProducts());
}

export async function getProductsBySubCategory(subCategoryName: string) {
  return toLegacyDisplay(await getCatalogProducts(subCategoryName));
}

export async function searchProducts(query: string) {
  const normalizedQuery = typeof query === "string" ? query.trim().slice(0, 100) : "";
  if (!normalizedQuery) return [];
  const rateLimit = await consumeRequestRateLimit("catalog_search", "anonymous-search", 30, 60);
  if (!rateLimit.allowed) return [];
  return toLegacyDisplay(await findCatalogProducts(normalizedQuery));
}

/** Returns only ProductVariant IDs that still exist; prices are never trusted from the cart. */
export async function validateCartVariantIds(input: unknown): Promise<{ ok: boolean; variantIds: string[] }> {
  if (!Array.isArray(input)) return { ok: false, variantIds: [] };
  const variantIds = [...new Set(input.filter((value): value is string => typeof value === "string" && VARIANT_ID_PATTERN.test(value)))];
  if (variantIds.length !== input.length || variantIds.length > MAX_CART_LINES) return { ok: false, variantIds: [] };

  const rateLimit = await consumeRequestRateLimit("cart_validate", "anonymous-cart", 60, 60);
  if (!rateLimit.allowed) return { ok: false, variantIds: [] };

  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true },
  });
  return { ok: true, variantIds: variants.map((variant) => variant.id) };
}
