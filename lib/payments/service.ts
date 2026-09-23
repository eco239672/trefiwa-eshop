import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { absoluteUrl } from "../site";
import { db } from "../db";
import { canTransitionPaymentStatus, PAYMENT_STATUSES } from "../orders/status";
import { getCardPaymentProvider, type VerifiedPaymentEvent } from "./provider";

export class PaymentError extends Error {}

type StartPaymentResult =
  | { state: "REDIRECT"; redirectUrl: string }
  | { state: "PROCESSING" }
  | { state: "UNAVAILABLE" };

function decimalToCents(value: Prisma.Decimal) {
  const [whole, fraction = ""] = value.toFixed(2).split(".");
  return BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
}

function appendPaymentHint(orderNumber: string, hint: "paid" | "cancelled" | "pending") {
  const url = new URL(`/checkout/success/${encodeURIComponent(orderNumber)}`, absoluteUrl());
  url.searchParams.set("payment", hint);
  return url.toString();
}

/**
 * Claims exactly one provider creation attempt without keeping a database
 * transaction open across the remote Comgate request. A retry reuses the order,
 * never re-runs checkout, coupon use, order items, or stock decrement.
 */
export async function startCardPayment(orderNumber: string): Promise<StartPaymentResult> {
  const provider = getCardPaymentProvider();
  if (!provider) return { state: "UNAVAILABLE" };

  const order = await db.order.findUnique({ where: { orderNumber } });
  if (!order || order.paymentMethod !== "CARD" || order.paymentProvider !== provider.id) {
    throw new PaymentError("Platba pre túto objednávku nie je dostupná.");
  }
  if (order.externalPaymentId && order.paymentRedirectUrl) return { state: "REDIRECT", redirectUrl: order.paymentRedirectUrl };
  if (order.paymentStatus === PAYMENT_STATUSES.PAID) throw new PaymentError("Objednávka už bola zaplatená.");

  const attemptId = randomUUID();
  const claimed = await db.order.updateMany({
    where: {
      id: order.id,
      paymentMethod: "CARD",
      paymentProvider: provider.id,
      externalPaymentId: null,
      paymentAttemptId: null,
      paymentStatus: { in: [PAYMENT_STATUSES.AWAITING_PAYMENT, PAYMENT_STATUSES.FAILED, PAYMENT_STATUSES.CANCELLED] },
    },
    data: { paymentAttemptId: attemptId, paymentStatus: PAYMENT_STATUSES.AWAITING_PAYMENT, externalPaymentStatus: "CREATING", paymentFailureCode: null },
  });
  if (claimed.count !== 1) {
    const current = await db.order.findUnique({ where: { id: order.id } });
    if (current?.externalPaymentId && current.paymentRedirectUrl) return { state: "REDIRECT", redirectUrl: current.paymentRedirectUrl };
    return { state: "PROCESSING" };
  }

  try {
    const payment = await provider.createPayment({
      orderNumber: order.orderNumber,
      amountCents: decimalToCents(order.total),
      currency: order.currency,
      returnUrl: appendPaymentHint(order.orderNumber, "paid"),
      cancelUrl: appendPaymentHint(order.orderNumber, "cancelled"),
      pendingUrl: appendPaymentHint(order.orderNumber, "pending"),
      idempotencyKey: order.idempotencyKey,
      customerEmail: order.customerEmail ?? "",
      customerPhone: order.customerPhone ?? "",
      customerName: [order.customerFirstName, order.customerLastName].filter(Boolean).join(" "),
      billingAddress: { street: order.shippingStreet ?? "", city: order.shippingCity ?? "", postalCode: order.shippingZip ?? "" },
      delivery: order.pickupPointId ? "PICKUP" : "HOME_DELIVERY",
    });
    const persisted = await db.order.updateMany({
      where: { id: order.id, paymentAttemptId: attemptId, externalPaymentId: null },
      data: {
        externalPaymentId: payment.providerPaymentId,
        paymentRedirectUrl: payment.redirectUrl,
        paymentCreatedAt: new Date(),
        externalPaymentStatus: "PENDING",
        paymentEnvironment: provider.environment,
        paymentAttemptId: null,
      },
    });
    if (persisted.count !== 1) throw new PaymentError("Platbu nebolo možné bezpečne priradiť k objednávke.");
    return { state: "REDIRECT", redirectUrl: payment.redirectUrl };
  } catch (error) {
    await db.order.updateMany({
      where: { id: order.id, paymentAttemptId: attemptId, externalPaymentId: null },
      data: { paymentAttemptId: null, paymentStatus: PAYMENT_STATUSES.FAILED, externalPaymentStatus: "CREATE_FAILED", paymentFailureCode: "PAYMENT_CREATION_FAILED" },
    });
    if (error instanceof PaymentError) throw error;
    throw new PaymentError("Platbu kartou sa nepodarilo pripraviť. Objednávka ostala uložená; skúste platbu znova.");
  }
}

function expectedCents(order: { total: Prisma.Decimal }) {
  return decimalToCents(order.total);
}

/** Applies only a provider-verified event and is deliberately idempotent. */
export async function applyVerifiedCardPayment(event: VerifiedPaymentEvent) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { externalPaymentId: event.providerPaymentId } });
    if (!order || order.paymentProvider !== "COMGATE" || order.paymentMethod !== "CARD") {
      throw new PaymentError("Neznáma platba Comgate.");
    }
    if (
      event.orderNumber !== order.orderNumber ||
      event.amountCents !== expectedCents(order) ||
      event.currency !== order.currency ||
      event.environment !== order.paymentEnvironment
    ) {
      throw new PaymentError("Údaje platby Comgate nezodpovedajú objednávke.");
    }

    const data = { externalPaymentStatus: event.providerStatus, paymentFailureCode: event.failureCode };
    if (event.status === "PENDING") {
      await tx.order.update({ where: { id: order.id }, data });
      return { orderNumber: order.orderNumber, paymentStatus: order.paymentStatus, alreadyProcessed: false };
    }
    if (order.paymentStatus === PAYMENT_STATUSES.PAID) {
      // A late cancellation or duplicate PAID event cannot undo a verified payment.
      return { orderNumber: order.orderNumber, paymentStatus: order.paymentStatus, alreadyProcessed: true };
    }
    if (!canTransitionPaymentStatus(order.paymentStatus, event.status)) {
      throw new PaymentError("Neplatný prechod stavu platby Comgate.");
    }
    const now = new Date();
    await tx.order.update({
      where: { id: order.id },
      data: {
        ...data,
        paymentStatus: event.status,
        paidAt: event.status === PAYMENT_STATUSES.PAID ? now : null,
      },
    });
    return { orderNumber: order.orderNumber, paymentStatus: event.status, alreadyProcessed: false };
  });
}
