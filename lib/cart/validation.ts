export const MAX_CART_LINES = 30;
export const MAX_QUANTITY_PER_VARIANT = 25;

/**
 * ProductVariant ids in the existing catalogue predate the UUID default in
 * Prisma. Keep the accepted shape narrow, but do not incorrectly reject valid
 * legacy IDs such as `anglicky18-100g`.
 */
export const VARIANT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export type CartLine = {
  id: string;
  variantId: string;
  name: string;
  price: number | string;
  quantity: number;
  imageUrl?: string;
};

type SanitizedCart = {
  items: CartLine[];
  removedCount: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizedText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

/**
 * Treat localStorage only as an untrusted UX cache. Old product-level cart
 * entries or malformed records are removed before they can reach checkout.
 */
export function sanitizePersistedCart(value: unknown): SanitizedCart {
  if (!Array.isArray(value)) return { items: [], removedCount: value == null ? 0 : 1 };

  const itemsByVariantId = new Map<string, CartLine>();
  let removedCount = 0;

  for (const valueItem of value.slice(0, MAX_CART_LINES)) {
    if (!isRecord(valueItem)) {
      removedCount += 1;
      continue;
    }

    const variantId = normalizedText(valueItem.variantId, 128);
    const name = normalizedText(valueItem.name, 300);
    const imageUrl = normalizedText(valueItem.imageUrl, 2_000);
    const quantity = typeof valueItem.quantity === "number" ? valueItem.quantity : Number(valueItem.quantity);
    const price = typeof valueItem.price === "number" || typeof valueItem.price === "string" ? valueItem.price : 0;

    if (!VARIANT_ID_PATTERN.test(variantId) || !name || !Number.isInteger(quantity) || quantity < 1) {
      removedCount += 1;
      continue;
    }

    const existing = itemsByVariantId.get(variantId);
    const safeQuantity = Math.min(MAX_QUANTITY_PER_VARIANT, quantity);
    itemsByVariantId.set(variantId, {
      id: variantId,
      variantId,
      name,
      price,
      quantity: existing ? Math.min(MAX_QUANTITY_PER_VARIANT, existing.quantity + safeQuantity) : safeQuantity,
      ...(imageUrl ? { imageUrl } : {}),
    });
  }

  removedCount += Math.max(0, value.length - MAX_CART_LINES);
  return { items: [...itemsByVariantId.values()], removedCount };
}

export function keepExistingCartVariants(items: CartLine[], existingVariantIds: readonly string[]) {
  const existing = new Set(existingVariantIds);
  const keptItems = items.filter((item) => existing.has(item.variantId));
  return { items: keptItems, removedCount: items.length - keptItems.length };
}
