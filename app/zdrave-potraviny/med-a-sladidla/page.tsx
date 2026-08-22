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

export default function MedASladidlaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("najpredavanejsie");

  useEffect(() => {
    // ⚠️ POZOR: Tento názov musí presne sedieť s názvom v databáze
    getProductsBySubCategory("Med a sladidlá")
      .then((data: any) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.error("Chyba pri načítaní Med a sladidlá:", err);
        setIsLoading(false);
      });
  }, []);

  // Pomocná funkcia na získanie čísla z textu (napr. "od 3.50 €" -> 3.50)
  const getPriceValue = (priceStr: string) => {
    const match = priceStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  // Zoradenie produktov podľa vybranej možnosti
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
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] flex flex-col">
      {/* HLAVNÝ OBSAH */}
      <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-16">
        
        {/* OPRAVENÝ NADPIS A POPIS */}
        <section className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-[#2C2E26]">
            Med a sladidlá
          </h2>
          <p className="text-lg md:text-xl text-[#6B6E56] leading-relaxed">
            Prírodné medy a zdravé alternatívy sladenia. Ideálne na dokonalé a zdravé dochutenie vašich obľúbených čajov, káv či raňajkových kaší.
          </p>
        </section>

        {isLoading ? (
          <p className="text-center text-[#A3A697] py-10">
            Načítavam produkty...
          </p>
        ) : products.length === 0 ? (
          
          /* OPRAVENÝ TEXT PRI PRÁZDNEJ KATEGÓRII */
          <p className="text-center text-[#A3A697] py-10">
            V kategórii Med a sladidlá zatiaľ nie sú žiadne produkty.
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

            {/* Mriežka produktov */}
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
                    className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-[#E8E6DF] flex flex-col cursor-pointer group relative"
                  >
                    {maxDiscount > 0 && (
                      <div className="absolute top-8 left-8 bg-[#D84949] text-white px-2 py-1 rounded text-xs font-bold tracking-wider shadow-md z-10">
                        -{maxDiscount} %
                      </div>
                    )}

                    <div className="w-full h-48 bg-[#EFEFEA] rounded-md mb-4 flex items-center justify-center text-[#A3A697] overflow-hidden group-hover:opacity-90 transition-opacity">
                      {product.imageUrl ? (
                        <div
                          className="w-full h-full bg-cover bg-center"
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
    </main>
  );
}