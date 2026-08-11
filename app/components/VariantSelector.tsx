"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";

type Variant = {
  id: string;
  weight: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
};

type ProductProps = {
  id: string;
  name: string;
  imageUrl?: string | null;
  category: string;
  variants: Variant[];
};

export default function VariantSelector({ product }: { product: ProductProps }) {
  const { addToCart } = useCart();

  // Ako predvolený vyberieme hneď prvý variant v zozname (napr. 50g)
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    product.variants[0] || { id: "", weight: "", price: 0, stock: 0 }
  );

  if (!product.variants || product.variants.length === 0) {
    return <p className="text-red-500 font-medium">Tento produkt zatiaľ nemá nastavené gramáže.</p>;
  }

  const isAvailable = selectedVariant.stock > 0;

  return (
    <div>
      {/* 1. VÝBER GRAMÁŽE (Tlačidlá 50g, 100g...) */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6E56] mb-3">
          Vyberte si balenie:
        </label>
        <div className="flex flex-wrap gap-3">
          {product.variants.map((variant) => {
            const isSelected = selectedVariant.id === variant.id;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all border ${
                  isSelected
                    ? "bg-[#5C6B46] text-white border-[#5C6B46] shadow-md scale-105"
                    : "bg-[#F9F8F6] text-[#3D4035] border-[#D5D3C9] hover:border-[#5C6B46]"
                }`}
              >
                {variant.weight}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DYNAMICKÁ CENA (Mení sa podľa vybranej gramáže) */}
      <div className="flex items-end gap-4 mb-6">
        <span className="text-4xl font-extrabold text-[#5C6B46]">
          {selectedVariant.price.toFixed(2)} €
        </span>
        {selectedVariant.oldPrice && (
          <span className="text-xl text-[#A3A697] line-through font-medium mb-1">
            {selectedVariant.oldPrice.toFixed(2)} €
          </span>
        )}
      </div>

      {/* 3. SKLADOVÁ DOSTUPNOSŤ */}
      <div className="flex items-center gap-2 mb-8">
        {isAvailable ? (
          <>
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm font-semibold text-green-700">Dostupný</span>
          </>
        ) : (
          <>
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            <span className="text-sm font-semibold text-red-600">Vypredané pre toto balenie</span>
          </>
        )}
      </div>

      {/* 4. TLAČIDLO VLOŽIŤ DO KOŠÍKA */}
      <button
        disabled={!isAvailable}
        onClick={() => {
          // Do košíka pošleme produkt AJ s informáciou o konkrétnom balení
          addToCart({
            id: `${product.id}-${selectedVariant.id}`, // Unikátne ID pre košík (aby nemiešalo 50g a 100g)
            productId: product.id,
            name: `${product.name} (${selectedVariant.weight})`, // Napr. "Earl Grey (100g)"
            price: selectedVariant.price,
            imageUrl: product.imageUrl,
            weight: selectedVariant.weight,
          });
        }}
        className={`w-full py-4 rounded-md font-bold text-lg tracking-wide transition-all shadow-md active:scale-[0.98] mb-8 ${
          isAvailable
            ? "bg-[#5C6B46] text-white hover:bg-[#4A5738] hover:shadow-lg"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isAvailable ? `Vložiť do košíka (${selectedVariant.weight})` : "Momentálne nedostupné"}
      </button>
    </div>
  );
}