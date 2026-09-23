import { NextResponse } from "next/server";
import { applyVerifiedCardPayment, PaymentError } from "../../../../../lib/payments/service";
import { getCardPaymentProvider } from "../../../../../lib/payments/provider";
import { ComgateError } from "../../../../../lib/payments/comgate";

export const runtime = "nodejs";

/**
 * Comgate REST v2 sends JSON push notifications here. The callback body is
 * authenticated and then independently verified against Comgate's status API.
 */
export async function POST(request: Request) {
  const provider = getCardPaymentProvider();
  if (!provider || provider.id !== "COMGATE") return new NextResponse("Payment provider unavailable", { status: 503 });
  try {
    const event = await provider.verifyWebhook({ headers: request.headers, body: await request.text() });
    await applyVerifiedCardPayment(event);
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    // No callback body, credentials, order number, or transaction identifier is logged.
    if (error instanceof ComgateError || error instanceof PaymentError) return new NextResponse("Invalid payment notification", { status: 400 });
    return new NextResponse("Temporary payment processing failure", { status: 500 });
  }
}
