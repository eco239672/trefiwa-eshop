export const FREE_SHIPPING_THRESHOLD_CENTS = 4_000;

export type DeliveryMethod = {
  id: string;
  name: string;
  priceCents: number;
  time: string;
  carrier: string;
  requiresPickupPoint: boolean;
  /** The UI can render the option; provider configuration gates final checkout. */
  availableForCheckout: boolean;
};

const deliveryOptions: Record<string, readonly DeliveryMethod[]> = {
  Slovensko: [
    { id: "sk_packeta", name: "Packeta – výdajné miesto", priceCents: 390, time: "1–2 dni", carrier: "Packeta", requiresPickupPoint: true, availableForCheckout: true },
    { id: "sk_kurier", name: "Kuriér na adresu (DPD)", priceCents: 490, time: "1–2 dni", carrier: "DPD", requiresPickupPoint: false, availableForCheckout: true },
  ],
  Česko: [
    { id: "cz_packeta", name: "Zásilkovna – výdajné miesto", priceCents: 490, time: "2–3 dni", carrier: "Zásilkovna", requiresPickupPoint: true, availableForCheckout: false },
    { id: "cz_kurier", name: "Kuriér ČR", priceCents: 650, time: "2–3 dni", carrier: "Kuriér ČR", requiresPickupPoint: false, availableForCheckout: true },
  ],
  Poľsko: [{ id: "pl_kurier", name: "Kuriér InPost", priceCents: 750, time: "2–4 dni", carrier: "InPost", requiresPickupPoint: false, availableForCheckout: true }],
  Maďarsko: [{ id: "hu_kurier", name: "Kuriér GLS", priceCents: 750, time: "2–4 dni", carrier: "GLS", requiresPickupPoint: false, availableForCheckout: true }],
  Rakúsko: [{ id: "at_kurier", name: "Kuriér Österreichische Post", priceCents: 890, time: "2–4 dni", carrier: "Österreichische Post", requiresPickupPoint: false, availableForCheckout: true }],
};

export const countries = Object.keys(deliveryOptions);

export function getDeliveryMethod(country: string, methodId: string) {
  return deliveryOptions[country]?.find((method) => method.id === methodId) ?? null;
}

export function getDeliveryOptions(country: string) {
  return deliveryOptions[country] ?? [];
}

/**
 * Free shipping uses the merchandise subtotal before discounts. This prevents a
 * coupon from retroactively removing a benefit already earned by the basket.
 */
export function calculateShippingCents(subtotalCents: bigint, method: DeliveryMethod) {
  return subtotalCents >= BigInt(FREE_SHIPPING_THRESHOLD_CENTS) ? BigInt(0) : BigInt(method.priceCents);
}

export function formatEuroFromCents(cents: number) {
  return new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(cents / 100);
}
