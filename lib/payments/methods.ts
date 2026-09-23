import { PAYMENT_METHODS, type PaymentMethod } from "../checkout/types";
import { getCardPaymentProvider } from "./provider";

export type PaymentMethodDefinition = {
  id: PaymentMethod;
  provider: string | null;
  available: boolean;
};

export function getPaymentMethod(method: PaymentMethod) {
  if (method === PAYMENT_METHODS.BANK_TRANSFER) {
    return { id: PAYMENT_METHODS.BANK_TRANSFER, provider: "BANK_TRANSFER", available: true };
  }
  const provider = getCardPaymentProvider();
  return { id: PAYMENT_METHODS.CARD, provider: provider?.id ?? null, available: provider !== null };
}
