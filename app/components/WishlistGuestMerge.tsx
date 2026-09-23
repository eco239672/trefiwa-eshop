"use client";

import { useEffect } from "react";
import { mergeGuestWishlist } from "../commerceActions";
import { GUEST_WISHLIST_KEY } from "./WishlistButton";

export function WishlistGuestMerge({ authenticated }: { authenticated: boolean }) {
  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
      const ids = Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string").slice(0, 12) : [];
      if (!ids.length) return;
      void mergeGuestWishlist(ids).then((result) => {
        if (!cancelled && result.ok) localStorage.removeItem(GUEST_WISHLIST_KEY);
      });
    } catch {
      localStorage.removeItem(GUEST_WISHLIST_KEY);
    }
    return () => { cancelled = true; };
  }, [authenticated]);
  return null;
}
