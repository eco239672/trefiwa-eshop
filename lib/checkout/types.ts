export const PAYMENT_METHODS = {
  BANK_TRANSFER: "BANK_TRANSFER",
  CARD: "CARD",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export type CartLineInput = {
  variantId: string;
  quantity: number;
};

/** The browser may submit only the provider point identifier. */
export type PickupPointInput = {
  id: string;
};

export type CheckoutInput = {
  items: CartLineInput[];
  idempotencyKey: string;
  shippingMethod: string;
  pickupPoint?: PickupPointInput;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    zip: string;
    country: string;
  };
};

export type CheckoutActionResult =
  | {
      ok: true;
      orderNumber: string;
      status: string;
      paymentStatus: string;
    }
  | { ok: false; error: string };
