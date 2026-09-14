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
