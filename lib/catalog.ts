import { db } from "./db";

export type CatalogVariant = {
  id: string;
  weight: string;
  price: number;
  oldPrice: number | null;
  stock: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  priceFrom: number | null;
  inStock: boolean;
  variants: CatalogVariant[];
};

function serializeProduct(product: {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  subCategory: { name: string; category: { name: string } } | null;
  variants: Array<{ id: string; weight: string; price: { toString(): string }; oldPrice: { toString(): string } | null; stock: number }>;
}): CatalogProduct {
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    weight: variant.weight,
    price: Number(variant.price),
    oldPrice: variant.oldPrice ? Number(variant.oldPrice) : null,
    stock: variant.stock,
  }));
  const prices = variants.map((variant) => variant.price).filter(Number.isFinite);
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl?.trim() || null,
    category: product.subCategory?.name ?? "Nezaradené",
    priceFrom: prices.length ? Math.min(...prices) : null,
    inStock: variants.some((variant) => variant.stock > 0),
    variants,
  };
}

const productInclude = {
  subCategory: { include: { category: true } },
  variants: { orderBy: { price: "asc" as const } },
};

export async function getCatalogProducts(subCategoryName?: string) {
  const products = await db.product.findMany({
    where: subCategoryName ? { subCategory: { name: subCategoryName } } : undefined,
    include: productInclude,
  });
  return products.map(serializeProduct);
}

export async function findCatalogProducts(query: string) {
  const normalized = query.trim().slice(0, 100);
  if (!normalized) return [];
  const products = await db.product.findMany({
    where: { name: { contains: normalized, mode: "insensitive" } },
    include: productInclude,
    take: 5,
  });
  return products.map(serializeProduct);
}

/** Returns only existing requested products, in the caller's original order. */
export async function getCatalogProductsByIds(ids: string[]) {
  const uniqueIds = [...new Set(ids)].slice(0, 12);
  if (!uniqueIds.length) return [];
  const products = await db.product.findMany({ where: { id: { in: uniqueIds } }, include: productInclude });
  const byId = new Map(products.map((product) => [product.id, serializeProduct(product)]));
  return uniqueIds.flatMap((id) => {
    const product = byId.get(id);
    return product ? [product] : [];
  });
}

/** Deterministic cross-sell: same subcategory, a purchasable variant, never self. */
export async function getRelatedCatalogProducts(productId: string, subCategoryId: string | null, limit = 4) {
  if (!subCategoryId || limit < 1) return [];
  const products = await db.product.findMany({
    where: {
      id: { not: productId },
      subCategoryId,
      variants: { some: { stock: { gt: 0 } } },
    },
    include: productInclude,
    orderBy: { name: "asc" },
    take: Math.min(limit, 4),
  });
  return products.map(serializeProduct);
}
