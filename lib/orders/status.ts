export const ORDER_STATUSES = {
  PENDING: "PENDING",
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

const orderTransitions: Record<string, readonly string[]> = {
  [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.AWAITING_PAYMENT, ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.AWAITING_PAYMENT]: [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PROCESSING]: [ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.DELIVERED],
  [ORDER_STATUSES.DELIVERED]: [],
  [ORDER_STATUSES.CANCELLED]: [],
};

const paymentTransitions: Record<string, readonly string[]> = {
  [PAYMENT_STATUSES.PENDING]: [PAYMENT_STATUSES.AWAITING_PAYMENT, PAYMENT_STATUSES.PAID, PAYMENT_STATUSES.FAILED, PAYMENT_STATUSES.CANCELLED],
  [PAYMENT_STATUSES.AWAITING_PAYMENT]: [PAYMENT_STATUSES.PAID, PAYMENT_STATUSES.FAILED, PAYMENT_STATUSES.CANCELLED],
  [PAYMENT_STATUSES.PAID]: [PAYMENT_STATUSES.REFUNDED],
  // A later provider-verified PAID notification is allowed after a transient
  // failure/cancellation state. Untrusted browser input never reaches this code.
  [PAYMENT_STATUSES.FAILED]: [PAYMENT_STATUSES.AWAITING_PAYMENT, PAYMENT_STATUSES.CANCELLED, PAYMENT_STATUSES.PAID],
  [PAYMENT_STATUSES.CANCELLED]: [PAYMENT_STATUSES.PAID],
  [PAYMENT_STATUSES.REFUNDED]: [],
};

export function canTransitionOrderStatus(current: string, next: string) {
  return current === next || orderTransitions[current]?.includes(next) === true;
}

export function canTransitionPaymentStatus(current: string, next: string) {
  return current === next || paymentTransitions[current]?.includes(next) === true;
}

export function orderStatusUpdate(current: string, next: string) {
  if (!canTransitionOrderStatus(current, next)) throw new Error("Neplatný prechod stavu objednávky.");
  return {
    status: next,
    cancelledAt: next === ORDER_STATUSES.CANCELLED ? new Date() : undefined,
  };
}

export function paymentStatusUpdate(current: string, next: string) {
  if (!canTransitionPaymentStatus(current, next)) throw new Error("Neplatný prechod stavu platby.");
  return {
    paymentStatus: next,
    paidAt: next === PAYMENT_STATUSES.PAID ? new Date() : undefined,
  };
}
