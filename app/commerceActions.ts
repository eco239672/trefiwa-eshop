"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "./authActions";
import { db } from "../lib/db";
import { getCatalogProductsByIds } from "../lib/catalog";
import { consumeRequestRateLimit } from "../lib/security/rate-limit";

const PRODUCT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

function validProductId(value: unknown): value is string {
  return typeof value === "string" && PRODUCT_ID_PATTERN.test(value);
}

function normalizeProductIds(values: unknown) {
  if (!Array.isArray(values) || values.length > 30) return [];
  return [...new Set(values.filter(validProductId))].slice(0, 12);
}

function validRating(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

export async function getRecentlyViewedProducts(ids: unknown) {
  const rateLimit = await consumeRequestRateLimit("recently_viewed", "anonymous-recent", 60, 60);
  if (!rateLimit.allowed) return [];
  return getCatalogProductsByIds(normalizeProductIds(ids));
}

export async function toggleWishlist(productId: unknown) {
  const session = await getSession();
  if (!session) return { ok: false, error: "Prihláste sa pre uloženie obľúbených produktov." };
  if (!validProductId(productId)) return { ok: false, error: "Neplatný produkt." };
  const rateLimit = await consumeRequestRateLimit("wishlist_mutation", session.id, 60, 60);
  if (!rateLimit.allowed) return { ok: false, error: "Príliš veľa pokusov. Skúste to neskôr." };
  const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return { ok: false, error: "Produkt už nie je dostupný." };

  const existing = await db.wishlistItem.findUnique({ where: { userId_productId: { userId: session.id, productId } } });
  if (existing) {
    await db.wishlistItem.delete({ where: { userId_productId: { userId: session.id, productId } } });
    return { ok: true, saved: false };
  }
  await db.wishlistItem.create({ data: { userId: session.id, productId } });
  return { ok: true, saved: true };
}

/** Called after a login from the browser; ownership is always derived from the session. */
export async function mergeGuestWishlist(productIds: unknown) {
  const session = await getSession();
  if (!session) return { ok: false, merged: 0 };
  const ids = normalizeProductIds(productIds);
  if (!ids.length) return { ok: true, merged: 0 };
  const products = await db.product.findMany({ where: { id: { in: ids } }, select: { id: true } });
  if (!products.length) return { ok: true, merged: 0 };
  const result = await db.wishlistItem.createMany({
    data: products.map((product) => ({ userId: session.id, productId: product.id })),
    skipDuplicates: true,
  });
  return { ok: true, merged: result.count };
}

export async function submitReview(input: { productId: unknown; rating: unknown; content: unknown }) {
  const session = await getSession();
  if (!session) return { ok: false, error: "Pre pridanie recenzie sa prihláste." };
  if (!validProductId(input.productId)) return { ok: false, error: "Neplatný produkt." };
  if (!validRating(input.rating)) return { ok: false, error: "Hodnotenie musí byť od 1 do 5." };
  const content = typeof input.content === "string" ? input.content.trim() : "";
  if (content.length < 10 || content.length > 2_000) return { ok: false, error: "Text recenzie musí mať 10 až 2 000 znakov." };

  const rateLimit = await consumeRequestRateLimit("review_submit", session.id, 5, 60 * 60);
  if (!rateLimit.allowed) return { ok: false, error: "Príliš veľa pokusov. Skúste to neskôr." };
  const purchased = await db.orderItem.findFirst({ where: { productId: input.productId, order: { userId: session.id } }, select: { id: true } });
  if (!purchased) return { ok: false, error: "Recenziu môžu pridať iba zákazníci, ktorí produkt zakúpili." };

  await db.review.upsert({
    where: { userId_productId: { userId: session.id, productId: input.productId } },
    create: { userId: session.id, productId: input.productId, rating: input.rating, content, verifiedPurchase: true },
    update: { rating: input.rating, content, verifiedPurchase: true, status: "PENDING" },
  });
  revalidatePath(`/produkt/${input.productId}`);
  return { ok: true, message: "Recenzia bola odoslaná na schválenie." };
}
