import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getSession } from "../../app/authActions";
import { db } from "../db";
import { calculateShippingCents, getDeliveryMethod } from "./config";
import { calculateCouponDiscountCents, calculateOrderTotals, calculateSubtotalCents } from "./pricing";
import { getPaymentMethod } from "../payments/methods";
import { PacketaValidationError, type VerifiedPacketaPickupPoint, validatePacketaPickupPoint } from "../packeta/server";
import { PAYMENT_METHODS, type CheckoutInput } from "./types";
import { MAX_CART_LINES, MAX_QUANTITY_PER_VARIANT, VARIANT_ID_PATTERN } from "../cart/validation";

const IDEMPOTENCY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+0-9 ()-]{7,30}$/;
const COUPON_PATTERN = /^[A-Z0-9_-]{3,32}$/;
const ZERO_CENTS = BigInt(0);
const ONE_HUNDRED_CENTS = BigInt(100);

export class CheckoutError extends Error {}

type NormalizedCheckout = {
  idempotencyKey: string;
  shippingMethod: string;
  couponCode: string | null;
  pickupPointId: string | null;
  customer: CheckoutInput["customer"];
  lines: { variantId: string; quantity: number }[];
};

type CheckoutOrderResult = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  guestAccessToken: string | null;
};

function text(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string") throw new CheckoutError(`Neplatné pole: ${label}.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new CheckoutError(`Neplatné pole: ${label}.`);
  }
  return normalized;
}

function decimalToCents(value: Prisma.Decimal) {
  const [whole, fraction = ""] = value.toFixed(2).split(".");
  return BigInt(whole) * ONE_HUNDRED_CENTS + BigInt(fraction.padEnd(2, "0"));
}

function centsToDecimal(cents: bigint) {
  return new Prisma.Decimal(cents.toString()).dividedBy(100).toDecimalPlaces(2);
}

function normalizeInput(input: CheckoutInput): NormalizedCheckout {
  if (!input || typeof input !== "object") throw new CheckoutError("Neplatná objednávka.");
  if (input.paymentMethod !== PAYMENT_METHODS.BANK_TRANSFER && input.paymentMethod !== PAYMENT_METHODS.CARD) {
    throw new CheckoutError("Neplatný spôsob platby.");
  }
  if (!getPaymentMethod(input.paymentMethod).available) {
    throw new CheckoutError("Platba kartou zatiaľ nie je dostupná. Vyberte bankový prevod.");
  }

  const idempotencyKey = text(input.idempotencyKey, "idempotency key", 64);
  if (!IDEMPOTENCY_PATTERN.test(idempotencyKey)) throw new CheckoutError("Neplatný identifikátor objednávky.");

  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > MAX_CART_LINES) {
    throw new CheckoutError("Košík musí obsahovať 1 až 30 položiek.");
  }

  const mergedLines = new Map<string, number>();
  for (const line of input.items) {
    if (!line || typeof line.variantId !== "string" || !VARIANT_ID_PATTERN.test(line.variantId)) {
      throw new CheckoutError("Košík obsahuje neplatný variant produktu.");
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY_PER_VARIANT) {
      throw new CheckoutError("Množstvo musí byť celé číslo od 1 do 25.");
    }
    const totalQuantity = (mergedLines.get(line.variantId) ?? 0) + line.quantity;
    if (totalQuantity > MAX_QUANTITY_PER_VARIANT) {
      throw new CheckoutError("Množstvo jedného produktu môže byť najviac 25 kusov.");
    }
    mergedLines.set(line.variantId, totalQuantity);
  }

  const customer = {
    firstName: text(input.customer?.firstName, "meno", 100),
    lastName: text(input.customer?.lastName, "priezvisko", 100),
    email: text(input.customer?.email, "e-mail", 254).toLowerCase(),
    phone: text(input.customer?.phone, "telefón", 30),
    street: text(input.customer?.street, "ulica", 150),
    city: text(input.customer?.city, "mesto", 100),
    zip: text(input.customer?.zip, "PSČ", 20),
    country: text(input.customer?.country, "krajina", 50),
  };
  if (!EMAIL_PATTERN.test(customer.email)) throw new CheckoutError("Zadajte platný e-mail.");
  if (!PHONE_PATTERN.test(customer.phone)) throw new CheckoutError("Zadajte platné telefónne číslo.");

  const shippingMethod = text(input.shippingMethod, "spôsob dopravy", 64);
  const delivery = getDeliveryMethod(customer.country, shippingMethod);
  if (!delivery) {
    throw new CheckoutError("Zvolený spôsob dopravy nie je pre túto krajinu dostupný.");
  }
  const pickupPointId = input.pickupPoint?.id?.trim() || null;
  if (delivery.requiresPickupPoint) {
    if (customer.country !== "Slovensko" || delivery.id !== "sk_packeta" || !pickupPointId) {
      throw new CheckoutError("Výdajné miesto Packeta musí byť platná slovenská pobočka.");
    }
  } else if (pickupPointId) {
    throw new CheckoutError("Výdajné miesto nepatrí k zvolenému spôsobu dopravy.");
  }

  const couponCode = input.couponCode?.trim().toUpperCase() || null;
  if (couponCode && !COUPON_PATTERN.test(couponCode)) throw new CheckoutError("Zľavový kód má neplatný formát.");

  return {
    idempotencyKey,
    shippingMethod,
    couponCode,
    pickupPointId,
    customer,
    lines: [...mergedLines.entries()].map(([variantId, quantity]) => ({ variantId, quantity })),
  };
}

function fingerprint(input: NormalizedCheckout) {
  return createHash("sha256").update(JSON.stringify({
    ...input,
    lines: [...input.lines].sort((a, b) => a.variantId.localeCompare(b.variantId)),
  })).digest("hex");
}

function resultFromOrder(order: {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  guestAccessToken: string | null;
}) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    guestAccessToken: order.guestAccessToken,
  };
}

function assertExistingOrderMatches(
  order: { requestFingerprint: string; userId: string | null },
  requestFingerprint: string,
  userId: string | null,
) {
  if (order.requestFingerprint !== requestFingerprint || order.userId !== userId) {
    throw new CheckoutError("Tento identifikátor už patrí inej objednávke.");
  }
}

export async function createCheckoutOrder(input: CheckoutInput): Promise<CheckoutOrderResult> {
  const normalized = normalizeInput(input);
  const requestFingerprint = fingerprint(normalized);
  const session = await getSession();
  const userId = session?.id ?? null;

  const alreadyCreated = await db.order.findUnique({ where: { idempotencyKey: normalized.idempotencyKey } });
  if (alreadyCreated) {
    assertExistingOrderMatches(alreadyCreated, requestFingerprint, userId);
    return resultFromOrder(alreadyCreated);
  }

  let verifiedPickupPoint: VerifiedPacketaPickupPoint | null = null;
  if (normalized.pickupPointId) {
    try {
      verifiedPickupPoint = await validatePacketaPickupPoint(normalized.pickupPointId);
    } catch (error) {
      if (error instanceof PacketaValidationError) throw new CheckoutError(error.message);
      throw error;
    }
  }

  try {
    return await db.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { idempotencyKey: normalized.idempotencyKey } });
      if (existing) {
        assertExistingOrderMatches(existing, requestFingerprint, userId);
        return resultFromOrder(existing);
      }

      const variants = await tx.productVariant.findMany({
        where: { id: { in: normalized.lines.map((line) => line.variantId) } },
        include: { product: { select: { id: true, name: true } } },
      });
      if (variants.length !== normalized.lines.length) {
        throw new CheckoutError("Jeden z produktov už nie je dostupný.");
      }

      const byVariantId = new Map(variants.map((variant) => [variant.id, variant]));
      const delivery = getDeliveryMethod(normalized.customer.country, normalized.shippingMethod);
      if (!delivery) throw new CheckoutError("Neplatný spôsob dopravy.");

      const pricedLines = normalized.lines.map((line) => {
        const variant = byVariantId.get(line.variantId);
        if (!variant) throw new CheckoutError("Neplatný variant produktu.");
        const unitPriceCents = decimalToCents(variant.price);
        if (unitPriceCents < ZERO_CENTS) throw new CheckoutError("Produkt má neplatnú cenu.");
        return { line, variant, unitPriceCents };
      });

      const priceLines = pricedLines.map(({ line, unitPriceCents }) => ({ quantity: line.quantity, unitPriceCents }));
      const subtotalCents = calculateSubtotalCents(priceLines);
      let requestedDiscountCents = ZERO_CENTS;
      let couponToReserve: { id: string; usageCount: number; usageLimit: number | null } | null = null;
      if (normalized.couponCode) {
        const coupon = await tx.discountCode.findUnique({ where: { code: normalized.couponCode } });
        const now = new Date();
        if (!coupon || !coupon.isActive || (coupon.validFrom && coupon.validFrom > now) || (coupon.validUntil && coupon.validUntil < now)) {
          throw new CheckoutError("Zľavový kód nie je platný.");
        }
        if (coupon.minimumOrderAmount && subtotalCents < decimalToCents(coupon.minimumOrderAmount)) {
          throw new CheckoutError("Pre tento zľavový kód nedosahuje objednávka minimálnu hodnotu.");
        }
        if (coupon.usageLimit !== null && (coupon.usageLimit < 0 || coupon.usageCount >= coupon.usageLimit)) {
          throw new CheckoutError("Zľavový kód už bol vyčerpaný.");
        }
        if (coupon.type !== "PERCENTAGE" && coupon.type !== "FIXED_AMOUNT") {
          throw new CheckoutError("Zľavový kód má neplatné nastavenie.");
        }
        try {
          requestedDiscountCents = calculateCouponDiscountCents(subtotalCents, {
            type: coupon.type,
            valueCents: decimalToCents(coupon.discountValue),
          });
        } catch {
          throw new CheckoutError("Zľavový kód má neplatné nastavenie.");
        }
        couponToReserve = { id: coupon.id, usageCount: coupon.usageCount, usageLimit: coupon.usageLimit };
      }

      const totals = calculateOrderTotals(
        priceLines,
        calculateShippingCents(subtotalCents, delivery),
        requestedDiscountCents,
      );

      if (couponToReserve) {
        const reservation = await tx.discountCode.updateMany({
          where: couponToReserve.usageLimit === null
            ? { id: couponToReserve.id, isActive: true }
            : { id: couponToReserve.id, isActive: true, usageCount: couponToReserve.usageCount },
          data: { usageCount: { increment: 1 } },
        });
        if (reservation.count !== 1) throw new CheckoutError("Zľavový kód už bol vyčerpaný.");
      }

      const created = await tx.order.create({
        data: {
          userId,
          totalPrice: centsToDecimal(totals.totalCents),
          subtotal: centsToDecimal(totals.subtotalCents),
          discount: centsToDecimal(totals.discountCents),
          shippingPrice: centsToDecimal(totals.shippingCents),
          total: centsToDecimal(totals.totalCents),
          currency: "EUR",
          status: "AWAITING_PAYMENT",
          paymentStatus: "AWAITING_PAYMENT",
          paymentMethod: PAYMENT_METHODS.BANK_TRANSFER,
          paymentProvider: getPaymentMethod(PAYMENT_METHODS.BANK_TRANSFER).provider,
          idempotencyKey: normalized.idempotencyKey,
          requestFingerprint,
          discountCode: normalized.couponCode,
          customerEmail: normalized.customer.email,
          customerPhone: normalized.customer.phone,
          customerFirstName: normalized.customer.firstName,
          customerLastName: normalized.customer.lastName,
          shippingCountry: normalized.customer.country,
          shippingStreet: normalized.customer.street,
          shippingCity: normalized.customer.city,
          shippingZip: normalized.customer.zip,
          shippingMethod: delivery.id,
          shippingMethodName: delivery.name,
          pickupPointId: verifiedPickupPoint?.id ?? null,
          pickupPointData: verifiedPickupPoint?.data ?? Prisma.JsonNull,
          pickupPointCarrier: verifiedPickupPoint?.carrier ?? null,
          pickupPointName: verifiedPickupPoint?.name ?? null,
          pickupPointAddress: verifiedPickupPoint?.address ?? null,
          guestAccessToken: userId ? null : randomBytes(32).toString("base64url"),
          items: {
            create: pricedLines.map(({ line, variant, unitPriceCents }) => ({
              productId: variant.product.id,
              variantId: variant.id,
              productName: variant.product.name,
              variantWeight: variant.weight,
              quantity: line.quantity,
              unitPrice: centsToDecimal(unitPriceCents),
              totalPrice: centsToDecimal(unitPriceCents * BigInt(line.quantity)),
            })),
          },
        },
      });

      for (const { line, variant } of pricedLines) {
        const reservation = await tx.productVariant.updateMany({
          where: { id: variant.id, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (reservation.count !== 1) {
          throw new CheckoutError(`Produkt „${variant.product.name}" už nemá požadované množstvo na sklade.`);
        }
      }

      return resultFromOrder(created);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await db.order.findUnique({ where: { idempotencyKey: normalized.idempotencyKey } });
      if (existing) {
        assertExistingOrderMatches(existing, requestFingerprint, userId);
        return resultFromOrder(existing);
      }
    }
    throw error;
  }
}
