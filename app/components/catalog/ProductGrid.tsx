"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatalogProduct } from "../../../lib/catalog";

type SortOption = "featured" | "newest" | "lowest" | "highest" | "name";

function maxDiscount(product: CatalogProduct) {
  return product.variants.reduce((maximum, variant) => {
    if (!variant.oldPrice || variant.oldPrice <= variant.price) return maximum;
    return Math.max(maximum, Math.round(((variant.oldPrice - variant.price) / variant.oldPrice) * 100));
  }, 0);
}

function sortedProducts(products: CatalogProduct[], sort: SortOption) {
  return [...products].sort((left, right) => {
    if (sort === "lowest") return (left.priceFrom ?? Infinity) - (right.priceFrom ?? Infinity);
    if (sort === "highest") return (right.priceFrom ?? -Infinity) - (left.priceFrom ?? -Infinity);
    if (sort === "name") return left.name.localeCompare(right.name, "sk");
    // The current schema has no publish date. Preserve the DB order until that
    // field exists instead of falsely presenting UUID order as newest.
    return 0;
  });
}

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  const [sort, setSort] = useState<SortOption>("featured");
  const visibleProducts = useMemo(() => sortedProducts(products, sort), [products, sort]);

  if (!products.length) return <p className="py-10 text-center text-[#A3A697]">V tejto kategórii zatiaľ nie sú žiadne produkty.</p>;

  return (
    <>
      <div className="mb-8 flex items-center justify-between border-b border-[#E8E6DF] pb-4">
        <span className="hidden text-sm text-[#A3A697] sm:block">Zobrazených {products.length} produktov</span>
        <label className="ml-auto flex items-center gap-2 text-sm text-[#6B6E56]">
          <span>Radiť podľa:</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="cursor-pointer bg-transparent font-bold text-[#8A9A5B] focus:outline-none">
            <option value="featured">Odporúčané</option>
            <option value="newest" disabled>Najnovšie (pripravujeme)</option>
            <option value="lowest">Najlacnejšie</option>
            <option value="highest">Najdrahšie</option>
            <option value="name">Abecedne (A–Z)</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleProducts.map((product) => {
          const discount = maxDiscount(product);
          const localImage = product.imageUrl?.startsWith("/") ? product.imageUrl : null;
          return <Link href={`/produkt/${product.id}`} key={product.id} className="group relative flex flex-col rounded-lg border border-[#E8E6DF] bg-white p-5 shadow-xl transition-shadow hover:shadow-md">
            {discount > 0 ? <span className="absolute left-8 top-8 z-10 rounded bg-[#D84949] px-2 py-1 text-xs font-bold tracking-wider text-white shadow-md">-{discount} %</span> : null}
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-md bg-[#EFEFEA]">
              {localImage ? <Image src={localImage} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform group-hover:scale-105" /> : <span className="flex h-full items-center justify-center text-xs text-[#A3A697]">Bez obrázka</span>}
            </div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#8A9A5B]">{product.category}</p>
            <h2 className="mb-2 text-lg font-medium text-[#3D4035] transition-colors group-hover:text-[#5C6B46]">{product.name}</h2>
            {product.variants.length ? <div className="mb-3 flex flex-wrap gap-1.5">{product.variants.map((variant) => <span key={variant.id} className="rounded-full border border-[#E8E6DF] bg-[#F2F1EC] px-2 py-0.5 text-[10px] font-medium text-[#6B6E56]">{variant.weight}</span>)}</div> : null}
            <p className={`mt-auto mb-3 text-[11px] font-semibold uppercase tracking-wider ${product.inStock ? "text-green-700" : "text-red-600"}`}>{product.inStock ? "Dostupný" : "Vypredané"}</p>
            <div className="flex items-center justify-between border-t border-[#F9F8F6] pt-4"><span className="text-xl font-bold text-[#2C2E26]">{product.priceFrom === null ? "Cena na vyžiadanie" : `od ${product.priceFrom.toFixed(2)} €`}</span><span className="rounded border border-[#D5D3C9] bg-[#F9F8F6] px-4 py-1.5 text-sm font-medium transition-all group-hover:border-[#5C6B46] group-hover:bg-[#5C6B46] group-hover:text-white">Vybrať</span></div>
          </Link>;
        })}
      </div>
    </>
  );
}
