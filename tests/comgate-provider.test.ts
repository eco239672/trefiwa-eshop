import { afterEach, describe, expect, it, vi } from "vitest";
import { ComgateError, ComgatePaymentProvider, getComgateConfig } from "../lib/payments/comgate";
import type { PaymentCreation } from "../lib/payments/provider";
import { getPaymentMethod } from "../lib/payments/methods";
import { PAYMENT_METHODS } from "../lib/checkout/types";

const credentials = { merchantId: "merchant-123", secret: "a-long-test-secret", mode: "test" as const };
const comgateEnvironmentNames = [
  "COMGATE_MERCHANT_ID",
  "COMGATE_SECRET",
  "COMGATE_CARD_PAYMENTS_ENABLED",
  "COMGATE_TRANSACTION_MODE",
  "COMGATE_TEST_MODE_REVIEW_ENABLED",
  "COMGATE_LIVE_MODE_ENABLED",
  "NEXT_PUBLIC_COMGATE_CARD_ENABLED",
  "NEXT_PUBLIC_COMGATE_TEST_MODE_NOTICE",
  "VERCEL_ENV",
] as const;

function configureServer(mode: "test" | "live" | "" = "", overrides: Record<string, string | undefined> = {}) {
  for (const name of comgateEnvironmentNames) vi.stubEnv(name, undefined);
  vi.stubEnv("COMGATE_MERCHANT_ID", "merchant-123");
  vi.stubEnv("COMGATE_SECRET", "a-long-test-secret");
  vi.stubEnv("COMGATE_CARD_PAYMENTS_ENABLED", "true");
  vi.stubEnv("COMGATE_TRANSACTION_MODE", mode);
  for (const [name, value] of Object.entries(overrides)) vi.stubEnv(name, value);
}

afterEach(() => vi.unstubAllEnvs());

function response(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });
}

function paymentInput() {
  return {
    orderNumber: "order-123",
    amountCents: BigInt(2590),
    currency: "EUR",
    returnUrl: "https://trefiwa.sk/checkout/success/order-123?payment=paid",
    cancelUrl: "https://trefiwa.sk/checkout/success/order-123?payment=cancelled",
    pendingUrl: "https://trefiwa.sk/checkout/success/order-123?payment=pending",
    idempotencyKey: "22222222-2222-4222-8222-222222222222",
    customerEmail: "jana@example.com",
    customerPhone: "+421900123456",
    customerName: "Jana Nováková",
    billingAddress: { street: "Hlavná 1", city: "Bratislava", postalCode: "81101" },
    delivery: "HOME_DELIVERY" as const,
  };
}

describe("Comgate REST v2 adapter", () => {
  it("is fail-closed without merchant configuration", () => {
    for (const name of comgateEnvironmentNames) vi.stubEnv(name, undefined);
    expect(getComgateConfig()).toBeNull();
  });

  it("rejects a client-visible card flag or missing transaction mode without a complete server configuration", () => {
    configureServer("", { NEXT_PUBLIC_COMGATE_CARD_ENABLED: "true" });
    expect(getComgateConfig()).toBeNull();
    expect(getPaymentMethod(PAYMENT_METHODS.CARD)).toMatchObject({ available: false, provider: null });
  });

  it("allows test transactions only with an explicit server-side test mode", async () => {
    configureServer("test");
    expect(getComgateConfig()).toMatchObject({ mode: "test" });
    const fetcher = vi.fn(async () => response({ code: 0, transId: "AB12-CD34-EF56", redirect: "https://payments.comgate.cz/client/instructions/index?id=AB12-CD34-EF56" }));
    const provider = new ComgatePaymentProvider(credentials, fetcher as typeof fetch);
    await provider.createPayment(paymentInput());
    const [, init] = (fetcher.mock.calls as unknown as [string, RequestInit][])[0];
    expect(JSON.parse(String(init.body))).toMatchObject({ test: true, price: 2590, curr: "EUR", method: "CARD_ALL" });
  });

  it("allows a live transaction only after a separate explicit live acknowledgement", async () => {
    configureServer("live");
    expect(getComgateConfig()).toBeNull();
    configureServer("live", { COMGATE_LIVE_MODE_ENABLED: "true" });
    expect(getComgateConfig()).toMatchObject({ mode: "live" });
    const fetcher = vi.fn(async () => response({ code: 0, transId: "AB12-CD34-EF56", redirect: "https://payments.comgate.cz/client/instructions/index?id=AB12-CD34-EF56" }));
    const provider = new ComgatePaymentProvider({ ...credentials, mode: "live" }, fetcher as typeof fetch);
    await provider.createPayment(paymentInput());
    const [, init] = (fetcher.mock.calls as unknown as [string, RequestInit][])[0];
    expect(JSON.parse(String(init.body))).toMatchObject({ test: false });
  });

  it("requires an explicit production review acknowledgement and public test notice for a test gateway", () => {
    configureServer("test", { VERCEL_ENV: "production" });
    expect(getComgateConfig()).toBeNull();
    configureServer("test", {
      VERCEL_ENV: "production",
      COMGATE_TEST_MODE_REVIEW_ENABLED: "true",
      NEXT_PUBLIC_COMGATE_TEST_MODE_NOTICE: "true",
    });
    expect(getComgateConfig()).toMatchObject({ mode: "test" });
  });

  it("maps only authoritative integer cents into the official payment creation request", async () => {
    const fetcher = vi.fn(async () => response({ code: 0, transId: "AB12-CD34-EF56", redirect: "https://payments.comgate.cz/client/instructions/index?id=AB12-CD34-EF56" }));
    const provider = new ComgatePaymentProvider(credentials, fetcher as typeof fetch);
    await expect(provider.createPayment(paymentInput())).resolves.toEqual({ providerPaymentId: "AB12-CD34-EF56", redirectUrl: "https://payments.comgate.cz/client/instructions/index?id=AB12-CD34-EF56" });
    const [, init] = (fetcher.mock.calls as unknown as [string, RequestInit][])[0];
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toMatchObject({ test: true, price: 2590, curr: "EUR", country: "SK", refId: "order-123", method: "CARD_ALL", lang: "sk" });
  });

  it("does not allow checkout input to override server-selected test mode", async () => {
    const fetcher = vi.fn(async () => response({ code: 0, transId: "AB12-CD34-EF56", redirect: "https://payments.comgate.cz/client/instructions/index?id=AB12-CD34-EF56" }));
    const provider = new ComgatePaymentProvider(credentials, fetcher as typeof fetch);
    await provider.createPayment({ ...paymentInput(), test: false } as PaymentCreation & { test: false });
    const [, init] = (fetcher.mock.calls as unknown as [string, RequestInit][])[0];
    expect(JSON.parse(String(init.body))).toMatchObject({ test: true, price: 2590 });
  });

  it("rejects malformed provider responses and untrusted redirect URLs", async () => {
    const malformed = new ComgatePaymentProvider(credentials, vi.fn(async () => response({ code: 0, transId: "AB12-CD34-EF56", redirect: "https://example.test/redirect" })) as typeof fetch);
    await expect(malformed.createPayment(paymentInput())).rejects.toBeInstanceOf(ComgateError);
    const failure = new ComgatePaymentProvider(credentials, vi.fn(async () => response({ code: 1309, message: "invalid amount" })) as typeof fetch);
    await expect(failure.createPayment(paymentInput())).rejects.toBeInstanceOf(ComgateError);
  });

  it("uses Comgate status API as the authority after an authenticated callback", async () => {
    const fetcher = vi.fn(async () => response({ code: 0, transId: "AB12-CD34-EF56", refId: "order-123", test: false, price: "2590", curr: "EUR", status: "PAID" }));
    const provider = new ComgatePaymentProvider({ ...credentials, mode: "live" }, fetcher as typeof fetch);
    const event = await provider.verifyWebhook({
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify({ merchant: credentials.merchantId, secret: credentials.secret, transId: "AB12-CD34-EF56", test: "false", price: "1", curr: "USD", status: "PAID" }),
    });
    expect(event).toMatchObject({ orderNumber: "order-123", amountCents: BigInt(2590), currency: "EUR", status: "PAID", environment: "LIVE" });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it.each([
    { merchant: "wrong", secret: credentials.secret, transId: "AB12-CD34-EF56", test: "false" },
    { merchant: credentials.merchantId, secret: "wrong", transId: "AB12-CD34-EF56", test: "false" },
    { merchant: credentials.merchantId, secret: credentials.secret, transId: "not/a/transaction", test: "false" },
  ])("rejects unauthenticated or malformed callbacks before status lookup", async (callback) => {
    const fetcher = vi.fn();
    const provider = new ComgatePaymentProvider({ ...credentials, mode: "live" }, fetcher as typeof fetch);
    await expect(provider.verifyWebhook({ headers: new Headers({ "content-type": "application/json" }), body: JSON.stringify(callback) })).rejects.toBeInstanceOf(ComgateError);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejects invalid amount, currency, and unknown status returned by Comgate", async () => {
    const cases = [
      { code: 0, transId: "AB12-CD34-EF56", refId: "order-123", test: false, price: "-1", curr: "EUR", status: "PAID" },
      { code: 0, transId: "AB12-CD34-EF56", refId: "order-123", test: false, price: "2590", curr: "", status: "PAID" },
      { code: 0, transId: "AB12-CD34-EF56", refId: "order-123", test: false, price: "2590", curr: "EUR", status: "MAGIC" },
    ];
    for (const value of cases) {
      const provider = new ComgatePaymentProvider({ ...credentials, mode: "live" }, vi.fn(async () => response(value)) as typeof fetch);
      await expect(provider.getPaymentStatus("AB12-CD34-EF56")).rejects.toBeInstanceOf(ComgateError);
    }
  });
});
