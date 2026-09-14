export type PriceLine = {
  quantity: number;
  unitPriceCents: bigint;
};

export type CouponDiscount = {
  type: "FIXED_AMOUNT" | "PERCENTAGE";
  valueCents: bigint;
};

const ZERO_CENTS = BigInt(0);

export function calculateSubtotalCents(lines: PriceLine[]) {
  return lines.reduce((total, line) => {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.unitPriceCents < ZERO_CENTS) {
      throw new Error("Invalid order line.");
    }
    return total + line.unitPriceCents * BigInt(line.quantity);
  }, ZERO_CENTS);
}

export function calculateCouponDiscountCents(subtotalCents: bigint, coupon: CouponDiscount) {
  if (subtotalCents < ZERO_CENTS || coupon.valueCents <= ZERO_CENTS) {
    throw new Error("Invalid coupon amount.");
  }

  if (coupon.type === "FIXED_AMOUNT") return coupon.valueCents > subtotalCents ? subtotalCents : coupon.valueCents;
  if (coupon.type === "PERCENTAGE") {
    if (coupon.valueCents > BigInt(10_000)) throw new Error("Invalid coupon percentage.");
    return (subtotalCents * coupon.valueCents) / BigInt(10_000);
  }
  throw new Error("Invalid coupon type.");
}

export function calculateOrderTotals(
  lines: PriceLine[],
  shippingCents: bigint,
  requestedDiscountCents = ZERO_CENTS,
) {
  if (shippingCents < ZERO_CENTS || requestedDiscountCents < ZERO_CENTS) {
    throw new Error("Invalid monetary amount.");
  }

  const subtotalCents = calculateSubtotalCents(lines);

  const discountCents = requestedDiscountCents > subtotalCents ? subtotalCents : requestedDiscountCents;
  return {
    subtotalCents,
    discountCents,
    shippingCents,
    totalCents: subtotalCents - discountCents + shippingCents,
  };
}
