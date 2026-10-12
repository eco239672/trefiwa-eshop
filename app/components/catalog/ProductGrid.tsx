"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "../../../lib/catalog";

function maxDiscount(product: CatalogProduct) {
  return product.variants.reduce((maximum, variant) => {
    if (!variant.oldPrice || variant.oldPrice <= variant.price) return maximum;
    return Math.max(maximum, Math.round(((variant.oldPrice - variant.price) / variant.oldPrice) * 100));
  }, 0);
}

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  if (!products.length) return <p className="py-10 text-center text-[#A3A697]">V tejto kategórii zatiaľ nie sú žiadne produkty.</p>;

  return (
    <>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const discount = maxDiscount(product);
          const localImage = product.imageUrl?.startsWith("/") ? product.imageUrl : null;
          const isSinglePieceProduct = product.variants.length === 1 && /^1\s*ks$/i.test(product.variants[0].weight.trim());
          return <Link href={`/produkt/${product.id}`} key={product.id} className="group relative flex flex-col rounded-lg border border-[#E8E6DF] bg-white p-5 shadow-xl transition-shadow hover:shadow-md">
            {discount > 0 ? <span className="absolute left-8 top-8 z-10 rounded bg-[#D84949] px-2 py-1 text-xs font-bold tracking-wider text-white shadow-md">-{discount} %</span> : null}
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-md bg-[#EFEFEA]">
              {localImage ? <Image src={localImage} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform group-hover:scale-105" /> : <span className="flex h-full items-center justify-center text-xs text-[#A3A697]">Bez obrázka</span>}
            </div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#8A9A5B]">{product.category}</p>
            <h2 className="mb-2 text-lg font-medium text-[#3D4035] transition-colors group-hover:text-[#5C6B46]">{product.name}</h2>
            {product.variants.length && !isSinglePieceProduct ? <div className="mb-3 flex flex-wrap gap-1.5">{product.variants.map((variant) => <span key={variant.id} className="rounded-full border border-[#E8E6DF] bg-[#F2F1EC] px-2 py-0.5 text-[10px] font-medium text-[#6B6E56]">{variant.weight}</span>)}</div> : null}
            <p className={`mt-auto mb-3 text-[11px] font-semibold uppercase tracking-wider ${product.inStock ? "text-green-700" : "text-red-600"}`}>{product.inStock ? "Skladom" : "Momentálne nedostupné"}</p>
            <div className="flex items-center justify-between border-t border-[#F9F8F6] pt-4"><span className="text-xl font-bold text-[#2C2E26]">{product.priceFrom === null ? "Cena na vyžiadanie" : `od ${product.priceFrom.toFixed(2)} €`}</span><span className="rounded border border-[#D5D3C9] bg-[#F9F8F6] px-4 py-1.5 text-sm font-medium transition-all group-hover:border-[#5C6B46] group-hover:bg-[#5C6B46] group-hover:text-white">Vybrať</span></div>
          </Link>;
        })}
      </div>
    </>
  );
}
