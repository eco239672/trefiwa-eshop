import { timingSafeEqual } from "node:crypto";
import type { CardPaymentProvider, PaymentCreation, PaymentCreationResult, PaymentEnvironment, VerifiedPaymentEvent } from "./provider";

const COMGATE_API_URL = "https://payments.comgate.cz/v2.0";
const COMGATE_TRANSACTION_ID_PATTERN = /^[A-Za-z0-9-]{6,64}$/;
const MAX_EUR_CENTS = BigInt(4_000_000);

export type ComgateTransactionMode = "test" | "live";

export type ComgateConfig = {
  merchantId: string;
  secret: string;
  mode: ComgateTransactionMode;
};

type FetchLike = typeof fetch;

export class ComgateError extends Error {}

function configuredValue(name: "COMGATE_MERCHANT_ID" | "COMGATE_SECRET") {
  return process.env[name]?.trim() || null;
}

/**
 * Payment activation and its transaction mode are entirely server-side. Comgate
 * treats a missing `test` parameter as a live payment, so this function refuses
 * every incomplete or ambiguous configuration instead of defaulting to live.
 */
export function getComgateConfig(): ComgateConfig | null {
  const merchantId = configuredValue("COMGATE_MERCHANT_ID");
  const secret = configuredValue("COMGATE_SECRET");
  if (!merchantId || !secret || process.env.COMGATE_CARD_PAYMENTS_ENABLED !== "true") return null;

  const mode = process.env.COMGATE_TRANSACTION_MODE;
  if (mode !== "test" && mode !== "live") return null;

  if (mode === "live") {
    // A client-visible flag must never be enough to enable money movement.
    if (process.env.COMGATE_LIVE_MODE_ENABLED !== "true") return null;
    // Never permit a live transaction while the public UI says it is a test.
    if (process.env.NEXT_PUBLIC_COMGATE_TEST_MODE_NOTICE === "true") return null;
  }

  if (mode === "test" && process.env.VERCEL_ENV === "production") {
    // Production-domain review is permitted only with an explicit server-side
    // acknowledgement and an equally explicit public TESTOVACÍ REŽIM notice.
    if (
      process.env.COMGATE_TEST_MODE_REVIEW_ENABLED !== "true" ||
      process.env.NEXT_PUBLIC_COMGATE_TEST_MODE_NOTICE !== "true"
    ) return null;
  }

  return { merchantId, secret, mode };
}

function isTestMode(config: ComgateConfig) {
  return config.mode === "test";
}

function paymentEnvironment(testMode: boolean): PaymentEnvironment {
  return testMode ? "TEST" : "LIVE";
}

function basicAuthorization(config: ComgateConfig) {
  return `Basic ${Buffer.from(`${config.merchantId}:${config.secret}`, "utf8").toString("base64")}`;
}

function parseCents(value: unknown, label: string) {
  if (typeof value !== "string" && typeof value !== "number") throw new ComgateError(`Comgate returned an invalid ${label}.`);
  const normalized = String(value);
  if (!/^\d+$/.test(normalized)) throw new ComgateError(`Comgate returned an invalid ${label}.`);
  return BigInt(normalized);
}

function asString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new ComgateError(`Comgate returned an invalid ${label}.`);
  return value.trim();
}

function asBoolean(value: unknown, label: string) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw new ComgateError(`Comgate returned an invalid ${label}.`);
}

function safeRedirectUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ComgateError("Comgate returned an invalid redirect URL.");
  }
  if (url.protocol !== "https:" || (url.hostname !== "comgate.cz" && !url.hostname.endsWith(".comgate.cz"))) {
    throw new ComgateError("Comgate returned an untrusted redirect URL.");
  }
  return url.toString();
}

function constantTimeEquals(left: string, right: string) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function parseCallbackBody(headers: Headers, body: string) {
  const contentType = headers.get("content-type")?.toLowerCase() ?? "";
  try {
    if (contentType.includes("application/json")) {
      const value: unknown = JSON.parse(body);
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new ComgateError("Comgate callback has an invalid body.");
      return value as Record<string, unknown>;
    }
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return Object.fromEntries(new URLSearchParams(body).entries());
    }
  } catch (error) {
    if (error instanceof ComgateError) throw error;
    throw new ComgateError("Comgate callback has an invalid body.");
  }
  throw new ComgateError("Comgate callback has an unsupported content type.");
}

export class ComgatePaymentProvider implements CardPaymentProvider {
  readonly id = "COMGATE";
  readonly environment: PaymentEnvironment;

  constructor(private readonly config: ComgateConfig, private readonly fetcher: FetchLike = fetch) {
    this.environment = paymentEnvironment(isTestMode(config));
  }

  async createPayment(input: PaymentCreation): Promise<PaymentCreationResult> {
    if (input.amountCents < BigInt(10) || input.amountCents > MAX_EUR_CENTS || input.currency !== "EUR") {
      throw new ComgateError("Comgate payment amount is outside the supported EUR range.");
    }
    const response = await this.fetcher(`${COMGATE_API_URL}/payment.json`, {
      method: "POST",
      headers: { Authorization: basicAuthorization(this.config), "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        // This must always be present: Comgate defaults a missing value to live.
        test: isTestMode(this.config),
        country: "SK",
        price: Number(input.amountCents),
        curr: input.currency,
        label: "Trefiwa",
        refId: input.orderNumber,
        name: input.orderNumber,
        // Official Comgate method group: show only card methods enabled for this merchant.
        method: "CARD_ALL",
        email: input.customerEmail,
        phone: input.customerPhone,
        fullName: input.customerName,
        billingAddrCity: input.billingAddress.city,
        billingAddrStreet: input.billingAddress.street,
        billingAddrPostalCode: input.billingAddress.postalCode,
        billingAddrCountry: "SK",
        delivery: input.delivery === "PICKUP" ? "PICKUP" : "HOME_DELIVERY",
        ...(input.delivery === "HOME_DELIVERY" ? {
          homeDeliveryCity: input.billingAddress.city,
          homeDeliveryStreet: input.billingAddress.street,
          homeDeliveryPostalCode: input.billingAddress.postalCode,
          homeDeliveryCountry: "SK",
        } : {}),
        category: "PHYSICAL_GOODS_ONLY",
        lang: "sk",
        url_paid: input.returnUrl,
        url_cancelled: input.cancelUrl,
        url_pending: input.pendingUrl,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new ComgateError("Comgate payment creation failed.");
    const result: unknown = await response.json().catch(() => null);
    if (!result || typeof result !== "object") throw new ComgateError("Comgate returned an invalid payment response.");
    const payload = result as Record<string, unknown>;
    if (payload.code !== 0) throw new ComgateError("Comgate rejected payment creation.");
    const providerPaymentId = asString(payload.transId, "transaction ID");
    if (!COMGATE_TRANSACTION_ID_PATTERN.test(providerPaymentId)) throw new ComgateError("Comgate returned an invalid transaction ID.");
    return { providerPaymentId, redirectUrl: safeRedirectUrl(asString(payload.redirect, "redirect URL")) };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<VerifiedPaymentEvent> {
    if (!COMGATE_TRANSACTION_ID_PATTERN.test(providerPaymentId)) throw new ComgateError("Comgate transaction ID is invalid.");
    const response = await this.fetcher(`${COMGATE_API_URL}/payment/transId/${encodeURIComponent(providerPaymentId)}.json`, {
      method: "GET",
      headers: { Authorization: basicAuthorization(this.config), Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new ComgateError("Comgate status verification failed.");
    const result: unknown = await response.json().catch(() => null);
    if (!result || typeof result !== "object") throw new ComgateError("Comgate returned an invalid payment status.");
    const payload = result as Record<string, unknown>;
    if (payload.code !== 0) throw new ComgateError("Comgate could not verify payment status.");
    const transactionId = asString(payload.transId, "transaction ID");
    if (transactionId !== providerPaymentId) throw new ComgateError("Comgate transaction ID does not match.");
    const status = asString(payload.status, "payment status");
    if (status !== "PAID" && status !== "PENDING" && status !== "CANCELLED" && status !== "AUTHORIZED") {
      throw new ComgateError("Comgate returned an unsupported payment status.");
    }
    const orderNumber = asString(payload.refId, "payment reference");
    return {
      providerPaymentId: transactionId,
      orderNumber,
      status: status === "AUTHORIZED" ? "PENDING" : status,
      providerStatus: status,
      amountCents: parseCents(payload.price, "payment amount"),
      currency: asString(payload.curr, "currency").toUpperCase(),
      failureCode: typeof payload.paymentErrorReason === "string" ? payload.paymentErrorReason.slice(0, 120) : null,
      environment: paymentEnvironment(asBoolean(payload.test, "test mode")),
    };
  }

  async verifyWebhook(input: { headers: Headers; body: string }): Promise<VerifiedPaymentEvent> {
    const callback = parseCallbackBody(input.headers, input.body);
    const transactionId = asString(callback.transId, "callback transaction ID");
    const merchant = asString(callback.merchant, "callback merchant");
    const secret = asString(callback.secret, "callback secret");
    // Validate the expected REST v2 callback shape but do not trust these values
    // as payment authority; getPaymentStatus below validates against Comgate.
    asBoolean(callback.test, "callback test mode");
    if (!COMGATE_TRANSACTION_ID_PATTERN.test(transactionId) || merchant !== this.config.merchantId || !constantTimeEquals(secret, this.config.secret)) {
      throw new ComgateError("Comgate callback could not be authenticated.");
    }
    // The callback itself is never the authority: Comgate requires status API verification.
    return this.getPaymentStatus(transactionId);
  }
}

export function createComgatePaymentProvider(fetcher?: FetchLike) {
  const config = getComgateConfig();
  return config ? new ComgatePaymentProvider(config, fetcher) : null;
}
