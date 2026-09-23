"use server";

import { revalidatePath } from "next/cache";
import { db } from "../../lib/db";
import { AdminAuthorizationError, requireAdmin } from "../../lib/admin/access";
import { adjustVariantStock, InventoryError } from "../../lib/inventory/service";
import { orderStatusUpdate, paymentStatusUpdate } from "../../lib/orders/status";
import { consumeRequestRateLimit } from "../../lib/security/rate-limit";

export type AdminActionResult = { ok: true; message: string } | { ok: false; error: string };

function formText(formData: FormData, key: string, limit = 128) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

async function adminMutation() {
  const admin = await requireAdmin();
  const rateLimit = await consumeRequestRateLimit("admin_mutation", admin.id, 60, 60);
  if (!rateLimit.allowed) throw new Error("Príliš veľa správcovských požiadaviek. Skúste to neskôr.");
  return admin;
}

function adminFailure(error: unknown): AdminActionResult {
  if (error instanceof AdminAuthorizationError) return { ok: false, error: "Nemáte oprávnenie správcu." };
  if (error instanceof InventoryError || error instanceof Error) return { ok: false, error: error.message };
  return { ok: false, error: "Správcovskú operáciu sa nepodarilo vykonať." };
}

export async function updateOrderStatusAction(formData: FormData): Promise<AdminActionResult> {
  try {
    await adminMutation();
    const orderNumber = formText(formData, "orderNumber");
    const nextStatus = formText(formData, "status", 32);
    const order = await db.order.findUnique({ where: { orderNumber }, select: { status: true } });
    if (!order) return { ok: false, error: "Objednávka neexistuje." };
    const update = orderStatusUpdate(order.status, nextStatus);
    await db.order.update({ where: { orderNumber }, data: update });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderNumber}`);
    revalidatePath(`/ucet/objednavky/${orderNumber}`);
    return { ok: true, message: "Stav objednávky bol aktualizovaný." };
  } catch (error) {
    return adminFailure(error);
  }
}

export async function updatePaymentStatusAction(formData: FormData): Promise<AdminActionResult> {
  try {
    await adminMutation();
    const orderNumber = formText(formData, "orderNumber");
    const nextStatus = formText(formData, "paymentStatus", 32);
    const order = await db.order.findUnique({ where: { orderNumber }, select: { paymentStatus: true } });
    if (!order) return { ok: false, error: "Objednávka neexistuje." };
    const update = paymentStatusUpdate(order.paymentStatus, nextStatus);
    await db.order.update({ where: { orderNumber }, data: update });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderNumber}`);
    revalidatePath(`/ucet/objednavky/${orderNumber}`);
    return { ok: true, message: "Stav platby bol aktualizovaný." };
  } catch (error) {
    return adminFailure(error);
  }
}

export async function adjustStockAction(formData: FormData): Promise<AdminActionResult> {
  try {
    const admin = await adminMutation();
    const variantId = formText(formData, "variantId");
    const rawDelta = formText(formData, "delta", 12);
    if (!/^-?\d+$/.test(rawDelta)) return { ok: false, error: "Úprava skladu musí byť celé číslo." };
    const result = await adjustVariantStock(variantId, Number(rawDelta), admin.id, formText(formData, "reason", 250));
    revalidatePath("/admin/inventory");
    revalidatePath(`/produkt/${result.productId}`);
    return { ok: true, message: `Sklad bol upravený. Aktuálny stav: ${result.stock}.` };
  } catch (error) {
    return adminFailure(error);
  }
}

export async function moderateReviewAction(formData: FormData): Promise<AdminActionResult> {
  try {
    await adminMutation();
    const reviewId = formText(formData, "reviewId");
    const status = formText(formData, "status", 16);
    if (status !== "PUBLISHED" && status !== "REJECTED") return { ok: false, error: "Neplatný stav recenzie." };
    const review = await db.review.findUnique({ where: { id: reviewId }, select: { productId: true } });
    if (!review) return { ok: false, error: "Recenzia neexistuje." };
    await db.review.update({ where: { id: reviewId }, data: { status } });
    revalidatePath("/admin/reviews");
    revalidatePath(`/produkt/${review.productId}`);
    return { ok: true, message: "Recenzia bola moderovaná." };
  } catch (error) {
    return adminFailure(error);
  }
}
