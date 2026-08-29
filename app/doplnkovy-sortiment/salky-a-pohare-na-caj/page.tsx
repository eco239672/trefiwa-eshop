"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getProductsBySubCategory } from "../../actions";

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  imageUrl?: string | null;
  stock?: number;
  variants?: {
    id: string;
    weight: string;
    price: number;
    oldPrice?: number | null;
  }[];
};

export default function SalkyaPohareNaCajPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("najpredavanejsie");

  useEffect(() => {
    // ⚠️ Skontroluj si, či máš kategóriu v DB presne ako "Šálky a poháre na čaj"
    getProductsBySubCategory("Šálky a poháre na čaj")
      .then((data: any) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.error("Chyba pri načítaní šálok a pohárov:", err);
        setIsLoading(false);
      });
  }, []);

  const getPriceValue = (priceStr: string) => {
    const match = priceStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case "najlacnejsie":
        return getPriceValue(a.price) - getPriceValue(b.price);
      case "najdrahsie":
        return getPriceValue(b.price) - getPriceValue(a.price);
      case "abecedne":
        return a.name.localeCompare(b.name);
      case "najnovsie":
        return b.id.localeCompare(a.id);
      default:
        return 0; // "najpredavanejsie"
    }
  });

  return (
    <main className="min-h-screen bg-[#FAF4E8] text-[#3D4035] flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-16">
        {/* NADPIS A POPIS */}
        <section className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-[#2C2E26]">
            Šálky a poháre na čaj
          </h2>
          <p className="text-lg md:text-xl text-[#6B6E56] leading-relaxed">
            Význam šálky nie je v tom ako vyzerá a z čoho je vyrobená, ale v tom
            čo v sebe ukrýva. Dúšok sily, pokoja, zdravia.
          </p>
        </section>

        {isLoading ? (
          <p className="text-center text-[#A3A697] py-10">
            Načítavam produkty...
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-[#A3A697] py-10">
            V kategórii Šálky a poháre na čaj zatiaľ nie sú žiadne produkty.
          </p>
        ) : (
          <>
            {/* Zoraďovací panel */}
            <div className="flex justify-between items-center mb-8 border-b border-[#E8E6DF] pb-4">
              <span className="text-[#A3A697] text-sm hidden sm:block">
                Zobrazených {products.length} produktov
              </span>

              <div className="flex items-center gap-2 text-sm text-[#6B6E56] ml-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 text-[#8A9A5B]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25"
                  />
                </svg>
                <span>Radiť podľa:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent text-[#8A9A5B] font-bold cursor-pointer focus:outline-none appearance-none hover:text-[#5C6B46] transition-colors"
                >
                  <option value="najpredavanejsie">Najpredávanejšie</option>
                  <option value="najnovsie">Najnovšie</option>
                  <option value="najlacnejsie">Najlacnejšie</option>
                  <option value="najdrahsie">Najdrahšie</option>
                  <option value="abecedne">Abecedne (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Mriežka produktov so zľavami a neorezanými obrázkami */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {sortedProducts.map((product) => {
                const isAvailable =
                  (product.stock !== undefined ? product.stock : 1) > 0;

                let maxDiscount = 0;
                if (product.variants) {
                  product.variants.forEach((v) => {
                    if (v.oldPrice && v.oldPrice > v.price) {
                      const discount = Math.round(
                        ((v.oldPrice - v.price) / v.oldPrice) * 100,
                      );
                      if (discount > maxDiscount) maxDiscount = discount;
                    }
                  });
                }

                return (
                  <Link
                    href={`/produkt/${product.id}`}
                    key={product.id}
                    className="bg-white rounded-lg p-5 shadow-xl hover:shadow-md transition-shadow border border-[#E8E6DF] flex flex-col cursor-pointer group relative"
                  >
                    {maxDiscount > 0 && (
                      <div className="absolute top-8 left-8 bg-[#D84949] text-white px-2 py-1 rounded text-xs font-bold tracking-wider shadow-md z-10">
                        -{maxDiscount} %
                      </div>
                    )}

                    {/* VYLEPŠENÝ OBRÁZOK: h-56 a bg-contain bg-no-repeat */}
                    <div className="w-full h-56 bg-[#EFEFEA] rounded-md mb-4 flex items-center justify-center text-[#A3A697] overflow-hidden group-hover:opacity-90 transition-opacity">
                      {product.imageUrl ? (
                        <div
                          className="w-full h-full bg-contain bg-no-repeat bg-center"
                          style={{
                            backgroundImage: `url(${product.imageUrl})`,
                          }}
                        ></div>
                      ) : (
                        <span className="text-xs">Bez obrázka</span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-[#8A9A5B] mb-1 uppercase tracking-wide">
                      {product.category}
                    </div>
                    <h4 className="font-medium text-lg text-[#3D4035] mb-2 group-hover:text-[#5C6B46] transition-colors">
                      {product.name}
                    </h4>

                    {product.variants && product.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {product.variants.map((v) => (
                          <span
                            key={v.id}
                            className="text-[10px] bg-[#F2F1EC] text-[#6B6E56] px-2 py-0.5 rounded-full font-medium border border-[#E8E6DF]"
                          >
                            {v.weight}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mb-3 mt-auto">
                      {isAvailable ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          <span className="text-[11px] font-semibold text-green-700 uppercase tracking-wider">
                            Dostupný
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-red-500"></span>
                          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">
                            Vypredané
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#F9F8F6]">
                      <span className="font-bold text-xl text-[#2C2E26]">
                        {product.price}
                      </span>
                      <span className="bg-[#F9F8F6] border border-[#D5D3C9] px-4 py-1.5 rounded text-sm font-medium group-hover:bg-[#5C6B46] group-hover:text-white group-hover:border-[#5C6B46] transition-all">
                        Vybrať
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* SEO 5 PODSEKCIÍ ŠÁLOK A POHÁROV */}
      <section className="bg-white py-20 border-t border-b border-[#E8E6DF]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8A9A5B] block mb-2">
              Krása v každom dúšku
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-[#2C2E26]">
              Zistite viac o šálkach a pohároch
            </h3>
          </div>
          <div className="space-y-12 text-[#6B6E56] leading-relaxed text-base md:text-lg">
            <div
              id="sekcia-1"
              className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32"
            >
              <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                  1
                </span>
                Prečo zvoliť správnu šálku na čaj?
              </h4>
              <p>Miesto pre váš text k prvej podsekcii...</p>
            </div>
            <div
              id="sekcia-2"
              className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32"
            >
              <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                  2
                </span>
                Sklo, porcelán alebo keramika?
              </h4>
              <p>Miesto pre váš text k druhej podsekcii...</p>
            </div>
            <div
              id="sekcia-3"
              className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32"
            >
              <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                  3
                </span>
                Ako veľkosť šálky ovplyvňuje chuť
              </h4>
              <p>Miesto pre váš text k tretej podsekcii...</p>
            </div>
            <div
              id="sekcia-4"
              className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32"
            >
              <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                  4
                </span>
                Dizajn, ktorý pohladí na duši
              </h4>
              <p>Miesto pre váš text k štvrtej podsekcii...</p>
            </div>
            <div
              id="sekcia-5"
              className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32"
            >
              <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                  5
                </span>
                Ideálny darček pre milovníkov čaju
              </h4>
              <p>Miesto pre váš text k piatej podsekcii...</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
