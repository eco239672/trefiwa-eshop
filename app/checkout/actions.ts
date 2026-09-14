"use server";

import { cookies } from "next/headers";
import { CheckoutError, createCheckoutOrder } from "../../lib/checkout/service";
import type { CheckoutActionResult, CheckoutInput } from "../../lib/checkout/types";
import { guestOrderCookieName, guestOrderCookieOptions } from "../../lib/checkout/guest-cookie";
import { consumeRequestRateLimit } from "../../lib/security/rate-limit";

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
    return { ok: true, orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus };
  } catch (error) {
    if (error instanceof CheckoutError) return { ok: false, error: error.message };
    console.error("Checkout failed", error);
    return { ok: false, error: "Objednávku sa nepodarilo vytvoriť. Skúste to znova." };
  }
}
