"use server";

import { cookies } from "next/headers";
import { after } from "next/server";
import { CheckoutError, createCheckoutOrder } from "../../lib/checkout/service";
import type { CheckoutActionResult, CheckoutInput } from "../../lib/checkout/types";
import { guestOrderCookieName, guestOrderCookieOptions } from "../../lib/checkout/guest-cookie";
import { consumeRequestRateLimit } from "../../lib/security/rate-limit";
import { dispatchOrderEmails } from "../../lib/email/service";
import { startCardPayment, PaymentError } from "../../lib/payments/service";
import { PAYMENT_METHODS } from "../../lib/checkout/types";

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutActionResult> {
  try {
    const subject = typeof input?.customer?.email === "string" ? input.customer.email : "invalid-checkout";
    const rateLimit = await consumeRequestRateLimit("checkout_create_order", subject, 5, 15 * 60);
    if (!rateLimit.allowed) return { ok: false, error: "Príliš veľa pokusov. Skúste to znova neskôr." };
    const order = await createCheckoutOrder(input);
    if (order.guestAccessToken) {
      const cookieStore = await cookies();
      cookieStore.set(guestOrderCookieName(order.orderNumber), order.guestAccessToken, guestOrderCookieOptions(order.orderNumber));
    }
    if (input.paymentMethod === PAYMENT_METHODS.CARD) {
      const payment = await startCardPayment(order.orderNumber);
      if (payment.state === "UNAVAILABLE") return { ok: false, error: "Platba kartou zatiaľ nie je dostupná." };
      if (payment.state === "PROCESSING") return { ok: false, error: "Platbu práve pripravujeme. Obnovte stránku o chvíľu a skúste to znova." };
      after(() => dispatchOrderEmails(order.orderNumber).catch(() => undefined));
      return { ok: true, orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus, paymentRedirectUrl: payment.redirectUrl };
    }
    // Email delivery is deliberately post-transaction. A provider outage must
    // never invalidate an already persisted bank-transfer order.
    after(() => dispatchOrderEmails(order.orderNumber).catch(() => undefined));
    return { ok: true, orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus };
  } catch (error) {
    if (error instanceof CheckoutError || error instanceof PaymentError) return { ok: false, error: error.message };
    console.error("Checkout failed", error);
    return { ok: false, error: "Objednávku sa nepodarilo vytvoriť. Skúste to znova." };
  }
}
