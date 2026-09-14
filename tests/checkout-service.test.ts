import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckoutInput } from "../lib/checkout/types";

const state = vi.hoisted(() => ({
  orders: [] as Record<string, unknown>[],
  items: [] as Record<string, unknown>[],
  stock: 10,
  hasVariant: true,
  availableVariantId: "11111111-1111-4111-8111-111111111111",
  session: null as { id: string } | null,
  coupon: null as null | {
    id: string; discountValue: Prisma.Decimal; isActive: boolean; type: string; validFrom: Date | null; validUntil: Date | null;
    minimumOrderAmount: Prisma.Decimal | null; usageLimit: number | null; usageCount: number;
  },
}));

const packeta = vi.hoisted(() => ({
  validate: vi.fn(async (id: string) => ({ carrier: "Packeta" as const, id, name: "Packeta point", address: "Hlavná 1, 811 01 Bratislava", data: { country: "SK" as const, group: null } })),
}));

const variantId = "11111111-1111-4111-8111-111111111111";

function findOrder(idempotencyKey: string) {
  return state.orders.find((order) => order.idempotencyKey === idempotencyKey) ?? null;
}

const tx = {
  order: {
    findUnique: vi.fn(async ({ where }: { where: { idempotencyKey: string } }) => findOrder(where.idempotencyKey)),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const order = { ...data, orderNumber: `order-${state.orders.length + 1}` };
      state.orders.push(order);
      const nestedItems = data.items as { create: Record<string, unknown>[] };
      state.items.push(...nestedItems.create);
      return order;
    }),
  },
  productVariant: {
    findMany: vi.fn(async ({ where }: { where: { id: { in: string[] } } }) => state.hasVariant && where.id.in.includes(state.availableVariantId) ? [{
      id: state.availableVariantId,
      stock: state.stock,
      price: new Prisma.Decimal("10.50"),
      weight: "100g",
      product: { id: "product-id", name: "Testovací produkt" },
    }] : []),
    updateMany: vi.fn(async ({ where }: { where: { stock: { gte: number } } }) => {
      if (state.stock < where.stock.gte) return { count: 0 };
      state.stock -= where.stock.gte;
      return { count: 1 };
    }),
  },
  discountCode: {
    findUnique: vi.fn(async () => state.coupon),
    updateMany: vi.fn(async () => {
      if (!state.coupon) return { count: 0 };
      state.coupon.usageCount += 1;
      return { count: 1 };
    }),
  },
};

const db = vi.hoisted(() => ({
  order: { findUnique: vi.fn(async ({ where }: { where: { idempotencyKey: string } }) => findOrder(where.idempotencyKey)) },
  $transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<unknown>) => {
    const ordersBefore = [...state.orders];
    const itemsBefore = [...state.items];
    const stockBefore = state.stock;
    try {
      return await callback(tx);
    } catch (error) {
      state.orders = ordersBefore;
      state.items = itemsBefore;
      state.stock = stockBefore;
      throw error;
    }
  }),
}));

vi.mock("../lib/db", () => ({ db }));
vi.mock("../app/authActions", () => ({ getSession: vi.fn(async () => state.session) }));
vi.mock("../lib/packeta/server", () => ({
  PacketaValidationError: class PacketaValidationError extends Error {},
  validatePacketaPickupPoint: packeta.validate,
}));

const { CheckoutError, createCheckoutOrder } = await import("../lib/checkout/service");

function input(overrides: Partial<CheckoutInput> = {}): CheckoutInput {
  return {
    idempotencyKey: "22222222-2222-4222-8222-222222222222",
    items: [{ variantId, quantity: 2 }],
    shippingMethod: "sk_kurier",
    paymentMethod: "BANK_TRANSFER",
    customer: {
      firstName: "Jana", lastName: "Nováková", email: "jana@example.com", phone: "+421 900 123 456",
      street: "Hlavná 1", city: "Bratislava", zip: "811 01", country: "Slovensko",
    },
    ...overrides,
  };
}

beforeEach(() => {
  state.orders = [];
  state.items = [];
  state.stock = 10;
  state.hasVariant = true;
  state.availableVariantId = variantId;
  state.session = null;
  state.coupon = null;
  vi.clearAllMocks();
  packeta.validate.mockResolvedValue({ carrier: "Packeta", id: "123", name: "Packeta point", address: "Hlavná 1, 811 01 Bratislava", data: { country: "SK", group: null } });
});

describe("createCheckoutOrder", () => {
  it("uses server-side database prices and creates Order plus OrderItems atomically", async () => {
    const manipulated = { ...input(), price: 0, total: 0 } as CheckoutInput;
    const result = await createCheckoutOrder(manipulated);

    expect(result.orderNumber).toBe("order-1");
    expect(state.orders).toHaveLength(1);
    expect(state.items).toHaveLength(1);
    expect(state.orders[0]).toMatchObject({ subtotal: new Prisma.Decimal("21"), shippingPrice: new Prisma.Decimal("4.9"), total: new Prisma.Decimal("25.9") });
    expect(state.items[0]).toMatchObject({ variantId, quantity: 2, unitPrice: new Prisma.Decimal("10.5"), totalPrice: new Prisma.Decimal("21") });
  });

  it.each([0, -1, 26])("rejects invalid quantity %i before writing an order", async (quantity) => {
    await expect(createCheckoutOrder(input({ items: [{ variantId, quantity }] }))).rejects.toBeInstanceOf(CheckoutError);
    expect(state.orders).toHaveLength(0);
  });

  it("rejects a non-existent variant", async () => {
    state.hasVariant = false;
    await expect(createCheckoutOrder(input())).rejects.toThrow("už nie je dostupný");
    expect(state.orders).toHaveLength(0);
  });

  it("accepts an existing legacy text ProductVariant ID", async () => {
    state.availableVariantId = "anglicky18-100g";
    await expect(createCheckoutOrder(input({ items: [{ variantId: state.availableVariantId, quantity: 1 }] }))).resolves.toMatchObject({ orderNumber: "order-1" });
    expect(state.items[0]).toMatchObject({ variantId: "anglicky18-100g" });
  });

  it("rejects a product ID sent in place of a variant ID", async () => {
    await expect(createCheckoutOrder(input({ items: [{ variantId: "product-id", quantity: 1 }] }))).rejects.toThrow("už nie je dostupný");
    expect(state.orders).toHaveLength(0);
  });

  it("returns the original result for the same idempotency key without creating a duplicate", async () => {
    const first = await createCheckoutOrder(input());
    const second = await createCheckoutOrder(input());
    expect(second).toEqual(first);
    expect(state.orders).toHaveLength(1);
    expect(state.items).toHaveLength(1);
  });

  it("rolls back Order and OrderItems if stock reservation fails", async () => {
    state.stock = 1;
    await expect(createCheckoutOrder(input())).rejects.toThrow("nemá požadované množstvo");
    expect(state.orders).toHaveLength(0);
    expect(state.items).toHaveLength(0);
    expect(state.stock).toBe(1);
  });

  it("rejects invalid, expired, disabled and minimum-subtotal coupons", async () => {
    await expect(createCheckoutOrder(input({ couponCode: "SAVE10" }))).rejects.toThrow("nie je platný");
    const baseCoupon = {
      id: "coupon", discountValue: new Prisma.Decimal("10"), isActive: true, type: "PERCENTAGE", validFrom: null,
      validUntil: null, minimumOrderAmount: null, usageLimit: null, usageCount: 0,
    };
    state.coupon = { ...baseCoupon, validUntil: new Date("2000-01-01") };
    await expect(createCheckoutOrder(input({ couponCode: "SAVE10" }))).rejects.toThrow("nie je platný");
    state.coupon = { ...baseCoupon, isActive: false };
    await expect(createCheckoutOrder(input({ couponCode: "SAVE10" }))).rejects.toThrow("nie je platný");
    state.coupon = { ...baseCoupon, minimumOrderAmount: new Prisma.Decimal("30") };
    await expect(createCheckoutOrder(input({ couponCode: "SAVE10" }))).rejects.toThrow("minimálnu hodnotu");
  });

  it("reserves an eligible coupon and calculates its server-side percentage discount", async () => {
    state.coupon = {
      id: "coupon", discountValue: new Prisma.Decimal("10"), isActive: true, type: "PERCENTAGE", validFrom: null,
      validUntil: null, minimumOrderAmount: new Prisma.Decimal("20"), usageLimit: 1, usageCount: 0,
    };
    await createCheckoutOrder(input({ couponCode: "SAVE10" }));
    expect(state.coupon.usageCount).toBe(1);
    expect(state.orders[0]).toMatchObject({ discount: new Prisma.Decimal("2.1"), total: new Prisma.Decimal("23.8") });
  });

  it("rejects pickup shipping without a provider-verified pickup point", async () => {
    await expect(createCheckoutOrder(input({ shippingMethod: "sk_packeta" }))).rejects.toThrow("Výdajné miesto");
  });

  it("stores only the provider-verified Packeta snapshot", async () => {
    await createCheckoutOrder(input({ shippingMethod: "sk_packeta", pickupPoint: { id: "123" } }));
    expect(packeta.validate).toHaveBeenCalledWith("123");
    expect(state.orders[0]).toMatchObject({
      pickupPointId: "123",
      pickupPointCarrier: "Packeta",
      pickupPointName: "Packeta point",
      pickupPointAddress: "Hlavná 1, 811 01 Bratislava",
    });
  });

  it("keeps coupon pricing and idempotency intact for bank transfer through Packeta", async () => {
    state.coupon = { id: "coupon", discountValue: new Prisma.Decimal("10"), isActive: true, type: "PERCENTAGE", validFrom: null, validUntil: null, minimumOrderAmount: null, usageLimit: 1, usageCount: 0 };
    const packetaInput = input({ shippingMethod: "sk_packeta", pickupPoint: { id: "123" }, couponCode: "SAVE10" });
    const first = await createCheckoutOrder(packetaInput);
    const second = await createCheckoutOrder(packetaInput);
    expect(second).toEqual(first);
    expect(state.orders).toHaveLength(1);
    expect(state.orders[0]).toMatchObject({ shippingPrice: new Prisma.Decimal("3.9"), discount: new Prisma.Decimal("2.1"), total: new Prisma.Decimal("22.8") });
    expect(packeta.validate).toHaveBeenCalledTimes(1);
  });

  it("applies free shipping on the server from the pre-discount subtotal", async () => {
    await createCheckoutOrder(input({ items: [{ variantId, quantity: 4 }] }));
    expect(state.orders[0]).toMatchObject({ subtotal: new Prisma.Decimal("42"), shippingPrice: new Prisma.Decimal("0"), total: new Prisma.Decimal("42") });
  });
});
