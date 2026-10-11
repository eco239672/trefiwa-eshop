import { db } from "./db";
import { unstable_cache } from "next/cache";

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

export type CatalogReview = {
  id: string;
  rating: number;
  content: string;
  verifiedPurchase: boolean;
  createdAt: string;
  user: { name: string };
};

const CATALOG_REVALIDATE_SECONDS = 60;

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

const getCachedCatalogProducts = unstable_cache(
  async () => {
    const products = await db.product.findMany({ include: productInclude });
    return products.map(serializeProduct);
  },
  ["catalog-products"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog-products"] },
);

export async function getCatalogProducts(subCategoryName?: string) {
  const products = await getCachedCatalogProducts();
  return subCategoryName ? products.filter((product) => product.category === subCategoryName) : products;
}

export async function getCatalogProductById(id: string) {
  const products = await getCachedCatalogProducts();
  return products.find((product) => product.id === id) ?? null;
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
export async function getRelatedCatalogProducts(productId: string, subCategoryName: string, limit = 4) {
  if (!subCategoryName || limit < 1) return [];
  const products = await getCachedCatalogProducts();
  return products
    .filter((product) => product.id !== productId && product.category === subCategoryName && product.inStock)
    .sort((left, right) => left.name.localeCompare(right.name, "sk"))
    .slice(0, Math.min(limit, 4));
}

export async function getPublishedProductReviews(productId: string): Promise<CatalogReview[]> {
  return unstable_cache(
    async () => {
      const reviews = await db.review.findMany({
        where: { productId, status: "PUBLISHED" },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        content: review.content,
        verifiedPurchase: review.verifiedPurchase,
        createdAt: review.createdAt.toISOString(),
        user: review.user,
      }));
    },
    ["product-reviews", productId],
    { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [`product-reviews:${productId}`] },
  )();
}
