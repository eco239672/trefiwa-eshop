"use client";

import { useState, useSyncExternalStore } from "react";
import { toggleWishlist } from "../commerceActions";

const GUEST_WISHLIST_KEY = "trefiwa_wishlist";
const GUEST_WISHLIST_EVENT = "trefiwa-wishlist-change";

function guestIds() {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string").slice(0, 12) : [];
  } catch {
    return [];
  }
}

function subscribeGuestWishlist(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(GUEST_WISHLIST_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(GUEST_WISHLIST_EVENT, onStoreChange);
  };
}

export function WishlistButton({ productId, authenticated, initialSaved }: { productId: string; authenticated: boolean; initialSaved: boolean }) {
  const [accountSaved, setAccountSaved] = useState(initialSaved);
  const guestSaved = useSyncExternalStore(
    subscribeGuestWishlist,
    () => guestIds().includes(productId),
    () => false,
  );
  const saved = authenticated ? accountSaved : guestSaved;
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    if (!authenticated) {
      const ids = guestIds();
      const next = ids.includes(productId) ? ids.filter((id) => id !== productId) : [productId, ...ids].slice(0, 12);
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(GUEST_WISHLIST_EVENT));
      setMessage(next.includes(productId) ? "Produkt je uložený medzi obľúbenými v tomto zariadení." : "Produkt bol odstránený z obľúbených.");
      return;
    }
    setBusy(true);
    const result = await toggleWishlist(productId);
    if (result.ok) {
      const nextSaved = result.saved === true;
      setAccountSaved(nextSaved);
      setMessage(nextSaved ? "Produkt je uložený medzi obľúbenými." : "Produkt bol odstránený z obľúbených.");
    } else {
      setMessage(result.error ?? "Obľúbené produkty sa nepodarilo upraviť.");
    }
    setBusy(false);
  };

  return <div className="mb-6"><button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} className="rounded-lg border border-[#D5D3C9] px-4 py-2 text-sm font-semibold text-[#3D4035] hover:border-[#5C6B46] disabled:opacity-60">{saved ? "♥ V obľúbených" : "♡ Pridať medzi obľúbené"}</button>{message ? <p className="mt-2 text-xs text-[#6B6E56]" role="status">{message}</p> : null}</div>;
}

export { GUEST_WISHLIST_KEY };
