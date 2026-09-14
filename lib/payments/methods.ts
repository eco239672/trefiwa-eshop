import { PAYMENT_METHODS, type PaymentMethod } from "../checkout/types";

export type PaymentMethodDefinition = {
  id: PaymentMethod;
  provider: string | null;
  available: boolean;
};

const methods: Record<PaymentMethod, PaymentMethodDefinition> = {
  [PAYMENT_METHODS.BANK_TRANSFER]: { id: PAYMENT_METHODS.BANK_TRANSFER, provider: "BANK_TRANSFER", available: true },
  // A provider is deliberately not selected until Stripe, GoPay, or Comgate is chosen.
  [PAYMENT_METHODS.CARD]: { id: PAYMENT_METHODS.CARD, provider: null, available: false },
};

export function getPaymentMethod(method: PaymentMethod) {
  return methods[method];
}
