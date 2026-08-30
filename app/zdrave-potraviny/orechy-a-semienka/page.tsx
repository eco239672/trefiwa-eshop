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

export default function OrechyPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("najpredavanejsie");

  useEffect(() => {
    // TUTO musí byť presný názov podkategórie z tvojej Prisma databázy
    getProductsBySubCategory("Orechy a semienka")
      .then((data: any) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.error("Chyba pri načítaní produktov:", err);
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
        {/* OPRAVENÉ NADPISY A TEXTY */}
        <section className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-[#2C2E26]">
            Orechy, mandle a semienka
          </h2>
          <p className="text-lg md:text-xl text-[#6B6E56] leading-relaxed">
            Každé chrumknutie je ozvenou slnkom zaliatych sadov a sily ukrytej
            hlboko v zemi. Orechy, mandle a drobučké semienka nie sú len
            obyčajnou potravou – sú drobnými pokladnicami čistej prírodnej
            energie. Keď sa maslová lahodnosť mandle spojí so zemitou hĺbkou
            orechov, vytvoria vo vašich ústach dokonalú symfóniu chutí a textúr.
          </p>
        </section>

        {isLoading ? (
          <p className="text-center text-[#A3A697] py-10">
            Načítavam produkty...
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-[#A3A697] py-10">
            V kategórii Orechy a semienka zatiaľ nie sú žiadne produkty.
          </p>
        ) : (
          <>
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

                    {/* VYLEPŠENÝ OBRÁZOK S VÝRAZNÝM 3D TIEŇOM */}
                    <div className="w-full h-56 bg-[#EFEFEA] rounded-md mb-4 flex items-center justify-center text-[#A3A697] overflow-hidden shadow-md group-hover:shadow-xl border border-[#E8E6DF] transition-all duration-300">
                      {product.imageUrl ? (
                        <div
                          className="w-full h-full bg-contain bg-no-repeat bg-center drop-shadow-xl group-hover:drop-shadow-2xl group-hover:scale-110 transition-all duration-500"
                          style={{
                            backgroundImage: `url(${product.imageUrl})`,
                          }}
                        ></div>
                      ) : (
                        <span className="text-xs font-semibold tracking-widest uppercase">
                          Bez obrázka
                        </span>
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

                    <div className="flex justify-between items-center pt-4 border-t border-[#E8E6DF]">
                      <span className="font-bold text-xl text-[#2C2E26]">
                        {product.price}
                      </span>
                      {/* BIELE TLAČIDLO VYBRAŤ */}
                      <span className="bg-white border border-[#D5D3C9] px-4 py-1.5 rounded text-sm font-medium group-hover:bg-[#5C6B46] group-hover:text-white group-hover:border-[#5C6B46] transition-all">
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

      {/* SEO 5 PODSEKCIÍ - ORECHY A SEMIENKA */}
      <section className="bg-[#FAF4E8] py-20 border-t border-[#E8E6DF]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8A9A5B] block mb-2">
              Zdravé chrumkanie
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-[#2C2E26]">
              Zistite viac o našich orechoch a semienkach
            </h3>
          </div>
          <div className="space-y-6 text-[#6B6E56] leading-relaxed text-base md:text-lg">
            {/* KARTIČKA 1 */}
            <div
              id="sekcia-1"
              className="p-8 bg-white shadow-lg shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1.5 transition-all duration-300 rounded-2xl border border-[#E8E6DF] scroll-mt-32"
            >
              <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                  1
                </span>
                Prečo zaradiť orechy do jedálnička?
              </h4>
              <p>Miesto pre váš text k prvej podsekcii...</p>
            </div>

            {/* KARTIČKA 2 */}
            <div
              id="sekcia-2"
              className="p-8 bg-white shadow-lg shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1.5 transition-all duration-300 rounded-2xl border border-[#E8E6DF] scroll-mt-32"
            >
              <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                  2
                </span>
                Surové verzus pražené
              </h4>
              <p>Miesto pre váš text k druhej podsekcii...</p>
            </div>

            {/* KARTIČKA 3 */}
            <div
              id="sekcia-3"
              className="p-8 bg-white shadow-lg shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1.5 transition-all duration-300 rounded-2xl border border-[#E8E6DF] scroll-mt-32"
            >
              <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                  3
                </span>
                Výhody semienok (chia, ľan, slnečnica)
              </h4>
              <p>Miesto pre váš text k tretej podsekcii...</p>
            </div>

            {/* KARTIČKA 4 */}
            <div
              id="sekcia-4"
              className="p-8 bg-white shadow-lg shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1.5 transition-all duration-300 rounded-2xl border border-[#E8E6DF] scroll-mt-32"
            >
              <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                  4
                </span>
                Ako ich správne skladovať
              </h4>
              <p>Miesto pre váš text k štvrtej podsekcii...</p>
            </div>

            {/* KARTIČKA 5 */}
            <div
              id="sekcia-5"
              className="p-8 bg-white shadow-lg shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1.5 transition-all duration-300 rounded-2xl border border-[#E8E6DF] scroll-mt-32"
            >
              <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                  5
                </span>
                Ideálne na varenie a pečenie
              </h4>
              <p>Miesto pre váš text k piatej podsekcii...</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
