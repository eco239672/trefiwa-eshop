"use client";

import { FREE_SHIPPING_THRESHOLD_CENTS, formatEuroFromCents } from "../../lib/checkout/config";

export function FreeShippingProgress({ cartTotal }: { cartTotal: number }) {
  const subtotalCents = Math.max(0, Math.round(cartTotal * 100));
  const remainingCents = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
  const progress = Math.min(100, (subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100);
  return <div className="mb-4 rounded-lg border border-[#E8E6DF] bg-white p-3 text-sm"><p className="font-semibold text-[#3D4035]">{remainingCents === 0 ? "Máte dopravu zdarma." : `Do dopravy zdarma vám chýba ${formatEuroFromCents(remainingCents)}.`}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8E6DF]" aria-hidden="true"><div className="h-full rounded-full bg-[#8A9A5B]" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-[#6B6E56]">Počíta sa z hodnoty tovaru pred zľavou. Konečnú cenu vždy overí server.</p></div>;
}
