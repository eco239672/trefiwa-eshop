"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewedProducts } from "../commerceActions";
import type { CatalogProduct } from "../../lib/catalog";
import { ProductGrid } from "./catalog/ProductGrid";

const RECENTLY_VIEWED_KEY = "trefiwa_recently_viewed";

export function RecentlyViewedProducts({ productId }: { productId: string }) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      const previous = Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
      const ids = [productId, ...previous.filter((id) => id !== productId)].slice(0, 8);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
      const otherIds = ids.filter((id) => id !== productId);
      if (!otherIds.length) return;
      void getRecentlyViewedProducts(otherIds).then((items) => {
        if (cancelled) return;
        setProducts(items);
        // Prune deleted/stale product IDs while keeping the current product.
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([productId, ...items.map((item) => item.id)].slice(0, 8)));
      });
    } catch {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    }
    return () => { cancelled = true; };
  }, [productId]);

  if (!products.length) return null;
  return <section className="mt-12"><h2 className="mb-5 border-b border-[#E8E6DF] pb-3 text-2xl font-bold text-[#2C2E26]">Naposledy zobrazené</h2><ProductGrid products={products} /></section>;
}
