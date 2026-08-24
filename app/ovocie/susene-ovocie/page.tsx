"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getProductsBySubCategory } from "../../actions";

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
};

export default function OvociePage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ťaháme IBA produkty z kategórie "Sušené ovocie"
    getProductsBySubCategory("Sušené ovocie")
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Chyba pri načítaní sušeného ovocia:", err);
        setIsLoading(false);
      });
  }, []);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] flex flex-col">
      <div className="flex-grow">
        <section className="px-6 py-16 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-[#2C2E26]">
            Sušené ovocie
          </h2>
          <p className="text-lg md:text-xl text-[#6B6E56] leading-relaxed">
            Plná chuť slnka v každom jednom kúsku.
          </p>
        </section>

        <section className="px-6 pb-20 max-w-7xl mx-auto">
          {isLoading ? (
            <p className="text-center text-[#A3A697] py-10">
              Načítavam ovocie z databázy...
            </p>
          ) : products.length === 0 ? (
            <p className="text-center text-[#A3A697] py-10">
              V kategórii Sušené ovocie zatiaľ nie sú žiadne produkty.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link
                  href={`/produkt/${product.id}`}
                  key={product.id}
                  className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-[#E8E6DF] flex flex-col cursor-pointer group"
                >
                  <div className="w-full h-48 bg-[#EFEFEA] rounded-md mb-4 flex items-center justify-center text-[#A3A697] group-hover:bg-[#E8E6DF] transition-colors">
                    Obrázok produktu
                  </div>
                  <div className="text-xs font-semibold text-[#8A9A5B] mb-1 uppercase tracking-wide">
                    {product.category}
                  </div>
                  <h4 className="font-medium text-lg text-[#3D4035] mb-3 group-hover:text-[#5C6B46] transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#F9F8F6]">
                    <span className="font-bold text-xl text-[#2C2E26]">
                      {product.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="bg-[#F9F8F6] border border-[#D5D3C9] px-3 py-1.5 rounded text-sm font-medium hover:bg-[#5C6B46] hover:text-white hover:border-[#5C6B46] transition-all active:scale-95"
                    >
                      Do košíka
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 5 PODSEKCIÍ SUŠENÉHO OVOCIA */}
        <section className="bg-white py-20 border-t border-b border-[#E8E6DF]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8A9A5B] block mb-2">
                Energia na cesty
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-[#2C2E26]">
                Viac o našom sušenom ovocí
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
                  Podsekcia 1
                </h4>
                <p>Miesto pre váš text k prvej podsekcii sušeného ovocia...</p>
              </div>
              <div
                id="sekcia-2"
                className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32"
              >
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">
                    2
                  </span>
                  Podsekcia 2
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
                  Podsekcia 3
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
                  Podsekcia 4
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
                  Podsekcia 5
                </h4>
                <p>Miesto pre váš text k piatej podsekcii...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
