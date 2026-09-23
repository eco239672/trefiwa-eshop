export type PaymentEnvironment = "TEST" | "LIVE";

export type PaymentCreation = {
  orderNumber: string;
  amountCents: bigint;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
  pendingUrl: string;
  idempotencyKey: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  billingAddress: { street: string; city: string; postalCode: string };
  delivery: "HOME_DELIVERY" | "PICKUP";
};

export type PaymentCreationResult = {
  providerPaymentId: string;
  redirectUrl: string;
};

export type VerifiedPaymentEvent = {
  providerPaymentId: string;
  orderNumber: string;
  status: "PAID" | "PENDING" | "FAILED" | "CANCELLED" | "REFUNDED";
  providerStatus: string;
  amountCents: bigint;
  currency: string;
  failureCode: string | null;
  /** Derived from Comgate's independently verified status response. */
  environment: PaymentEnvironment;
};

/**
 * A future card provider (for example Comgate) must create payments and verify
 * a signed webhook server-side. Browser redirects are deliberately insufficient.
 */
export interface CardPaymentProvider {
  readonly id: string;
  /** Server-configured and persisted with the provider transaction. */
  readonly environment: PaymentEnvironment;
  createPayment(input: PaymentCreation): Promise<PaymentCreationResult>;
  getPaymentStatus(providerPaymentId: string): Promise<VerifiedPaymentEvent>;
  verifyWebhook(input: { headers: Headers; body: string }): Promise<VerifiedPaymentEvent>;
}

/** No provider is selected or instantiated until verified merchant credentials exist. */
export function getCardPaymentProvider(): CardPaymentProvider | null {
  return createComgatePaymentProvider();
}
import { createComgatePaymentProvider } from "./comgate";
