import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { VARIANT_ID_PATTERN } from "../cart/validation";

export class InventoryError extends Error {}

export function normalizeStockAdjustment(input: unknown): number {
  if (typeof input !== "number" || !Number.isInteger(input) || input === 0 || input < -100_000 || input > 100_000) {
    throw new InventoryError("Úprava skladu musí byť celé nenulové číslo v povolenom rozsahu.");
  }
  return input;
}

export async function adjustVariantStock(
  variantId: string,
  deltaInput: unknown,
  adminUserId: string,
  reason?: string,
) {
  if (!VARIANT_ID_PATTERN.test(variantId)) throw new InventoryError("Neplatný variant produktu.");
  const delta = normalizeStockAdjustment(deltaInput);
  const normalizedReason = reason?.trim().slice(0, 250) || null;

  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const updated = await tx.productVariant.updateMany({
      where: delta < 0 ? { id: variantId, stock: { gte: Math.abs(delta) } } : { id: variantId },
      data: { stock: { increment: delta } },
    });
    if (updated.count !== 1) throw new InventoryError("Variant neexistuje alebo by sklad klesol pod nulu.");

    // The update holds the row lock until this transaction finishes, so the
    // following read and audit record describe the same adjustment.
    const variant = await tx.productVariant.findUnique({ where: { id: variantId }, select: { stock: true, productId: true } });
    if (!variant) throw new InventoryError("Variant neexistuje.");
    const adjustment = await tx.stockAdjustment.create({
      data: {
        variantId,
        adminUserId,
        delta,
        previousStock: variant.stock - delta,
        newStock: variant.stock,
        reason: normalizedReason,
      },
    });
    return { stock: variant.stock, productId: variant.productId, adjustment };
  });
}
