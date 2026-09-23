import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  order: null as Record<string, unknown> | null,
  provider: null as {
    id: string;
    environment: "TEST" | "LIVE";
    createPayment: ReturnType<typeof vi.fn>;
    getPaymentStatus: ReturnType<typeof vi.fn>;
    verifyWebhook: ReturnType<typeof vi.fn>;
  } | null,
}));

function currentOrder() {
  if (!state.order) throw new Error("Missing test order");
  return state.order;
}

const db = vi.hoisted(() => ({
  order: {
    findUnique: vi.fn(async () => state.order),
    updateMany: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const order = state.order;
      if (!order) return { count: 0 };
      if (where.paymentAttemptId !== undefined && where.paymentAttemptId !== order.paymentAttemptId) return { count: 0 };
      if (where.externalPaymentId === null && order.externalPaymentId !== null) return { count: 0 };
      Object.assign(order, data);
      return { count: 1 };
    }),
  },
  $transaction: vi.fn(async (callback: (tx: { order: { findUnique: () => Promise<Record<string, unknown> | null>; update: (input: { data: Record<string, unknown> }) => Promise<Record<string, unknown>> } }) => Promise<unknown>) => callback({
    order: {
      findUnique: async () => state.order,
      update: async ({ data }) => Object.assign(currentOrder(), data),
    },
  })),
}));

vi.mock("../lib/db", () => ({ db }));
vi.mock("../lib/payments/provider", () => ({ getCardPaymentProvider: () => state.provider }));

const { PaymentError, applyVerifiedCardPayment, startCardPayment } = await import("../lib/payments/service");

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-id",
    orderNumber: "order-123",
    idempotencyKey: "22222222-2222-4222-8222-222222222222",
    total: new Prisma.Decimal("25.90"),
    currency: "EUR",
    paymentMethod: "CARD",
    paymentProvider: "COMGATE",
    paymentEnvironment: "TEST",
    paymentStatus: "AWAITING_PAYMENT",
    externalPaymentId: null,
    externalPaymentStatus: null,
    paymentAttemptId: null,
    paymentRedirectUrl: null,
    paymentCreatedAt: null,
    paymentFailureCode: null,
    customerEmail: "jana@example.com",
    customerPhone: "+421900123456",
    customerFirstName: "Jana",
    customerLastName: "Nováková",
    shippingStreet: "Hlavná 1",
    shippingCity: "Bratislava",
    shippingZip: "81101",
    pickupPointId: null,
    cancelledAt: null,
    paidAt: null,
    ...overrides,
  };
}

function verified(status: "PAID" | "PENDING" | "FAILED" | "CANCELLED" = "PAID") {
  return { providerPaymentId: "AB12-CD34-EF56", orderNumber: "order-123", status, providerStatus: status, amountCents: BigInt(2590), currency: "EUR", failureCode: null, environment: "TEST" as const };
}

beforeEach(() => {
  state.order = makeOrder();
  state.provider = {
    id: "COMGATE",
    environment: "TEST",
    createPayment: vi.fn(async () => ({ providerPaymentId: "AB12-CD34-EF56", redirectUrl: "https://payments.comgate.cz/AB12-CD34-EF56" })),
    getPaymentStatus: vi.fn(),
    verifyWebhook: vi.fn(),
  };
  vi.clearAllMocks();
});

describe("card payment orchestration", () => {
  it("creates a single provider payment from the persisted Order total and stores its mapping", async () => {
    await expect(startCardPayment("order-123")).resolves.toEqual({ state: "REDIRECT", redirectUrl: "https://payments.comgate.cz/AB12-CD34-EF56" });
    expect(state.provider?.createPayment).toHaveBeenCalledWith(expect.objectContaining({ amountCents: BigInt(2590), currency: "EUR", orderNumber: "order-123" }));
    expect(currentOrder()).toMatchObject({ externalPaymentId: "AB12-CD34-EF56", externalPaymentStatus: "PENDING", paymentEnvironment: "TEST", paymentAttemptId: null });
  });

  it("does not create another provider transaction when a mapped redirect already exists", async () => {
    state.order = makeOrder({ externalPaymentId: "AB12-CD34-EF56", paymentRedirectUrl: "https://payments.comgate.cz/AB12-CD34-EF56" });
    await expect(startCardPayment("order-123")).resolves.toMatchObject({ state: "REDIRECT" });
    expect(state.provider?.createPayment).not.toHaveBeenCalled();
  });

  it("records a payment creation failure without creating another Order or changing stock", async () => {
    state.provider?.createPayment.mockRejectedValueOnce(new Error("timeout"));
    await expect(startCardPayment("order-123")).rejects.toBeInstanceOf(PaymentError);
    expect(currentOrder()).toMatchObject({ paymentStatus: "FAILED", externalPaymentId: null, paymentAttemptId: null, paymentFailureCode: "PAYMENT_CREATION_FAILED" });
  });

  it("rejects unknown transaction IDs and amount/currency/order/environment mismatches", async () => {
    state.order = null;
    await expect(applyVerifiedCardPayment(verified())).rejects.toBeInstanceOf(PaymentError);
    state.order = makeOrder({ externalPaymentId: "AB12-CD34-EF56" });
    await expect(applyVerifiedCardPayment({ ...verified(), amountCents: BigInt(1) })).rejects.toBeInstanceOf(PaymentError);
    await expect(applyVerifiedCardPayment({ ...verified(), currency: "USD" })).rejects.toBeInstanceOf(PaymentError);
    await expect(applyVerifiedCardPayment({ ...verified(), orderNumber: "another-order" })).rejects.toBeInstanceOf(PaymentError);
    await expect(applyVerifiedCardPayment({ ...verified(), environment: "LIVE" })).rejects.toBeInstanceOf(PaymentError);
  });

  it("applies a verified payment once, accepts pending, and ignores duplicate or late callbacks after PAID", async () => {
    state.order = makeOrder({ externalPaymentId: "AB12-CD34-EF56" });
    await expect(applyVerifiedCardPayment({ ...verified(), status: "PENDING" })).resolves.toMatchObject({ paymentStatus: "AWAITING_PAYMENT" });
    await expect(applyVerifiedCardPayment(verified("PAID"))).resolves.toMatchObject({ paymentStatus: "PAID", alreadyProcessed: false });
    await expect(applyVerifiedCardPayment(verified("PAID"))).resolves.toMatchObject({ paymentStatus: "PAID", alreadyProcessed: true });
    await expect(applyVerifiedCardPayment(verified("CANCELLED"))).resolves.toMatchObject({ paymentStatus: "PAID", alreadyProcessed: true });
  });

  it("does not mark an order paid merely because the browser received a redirect URL", async () => {
    await expect(startCardPayment("order-123")).resolves.toMatchObject({ state: "REDIRECT" });
    expect(currentOrder()).toMatchObject({ paymentStatus: "AWAITING_PAYMENT", paidAt: null });
  });
});
