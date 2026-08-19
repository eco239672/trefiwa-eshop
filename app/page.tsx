"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllProducts } from "./actions";
import { useCart } from "./context/CartContext";

// Upravený typ podľa databázy
type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  imageUrl?: string | null;
};

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllProducts()
      .then((data: any) => {
        // TUTO SME TO OSEKALI NA 4 PRODUKTY HNEĎ PO NAČÍTANÍ
        setProducts(data.slice(0, 4));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Chyba pri načítaní produktov:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] flex flex-col">
      <div className="flex-grow">
        {/* HERO SEKCIA - responzívny text a padding */}
        <section className="px-4 sm:px-6 py-12 md:py-20 text-center max-w-4xl mx-auto mt-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-6 text-[#2C2E26]">
            Z prírody k nám ...
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-[#6B6E56] leading-relaxed px-2">
            Objavte našu ponuku prémiových sypaných čajov, zdravých potravín a
            sušeného ovocia.
          </p>
        </section>

        {/* SEKCIA NOVINKY */}
        <section className="px-4 sm:px-6 pb-24 max-w-7xl mx-auto">
          <h3 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 text-[#2C2E26] border-b border-[#E8E6DF] pb-4">
            Naše novinky
          </h3>

          {isLoading ? (
            <p className="text-center text-[#A3A697] py-10">
              Načítavam produkty z databázy...
            </p>
          ) : products.length === 0 ? (
            <p className="text-center text-[#A3A697] py-10">
              Zatiaľ tu nie sú žiadne produkty. Pridaj nejaké cez Prisma Studio!
            </p>
          ) : (
            /* RESPONZÍVNA MRIEŽKA: 1 stĺpec mobil, 2 malý tablet, 3 veľký tablet, 4 PC */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => (
                <Link
                  href={`/produkt/${product.id}`}
                  key={product.id}
                  className="bg-white rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-[#E8E6DF] flex flex-col cursor-pointer group"
                >
                  {/* FOTKA PRODUKTU */}
                  <div className="w-full h-40 md:h-48 bg-[#EFEFEA] rounded-lg mb-4 flex items-center justify-center text-[#A3A697] overflow-hidden group-hover:opacity-90 transition-opacity">
                    {product.imageUrl ? (
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${product.imageUrl})` }}
                      ></div>
                    ) : (
                      <span className="text-xs">Bez obrázka</span>
                    )}
                  </div>

                  <div className="text-[10px] md:text-xs font-bold text-[#8A9A5B] mb-1.5 uppercase tracking-wider">
                    {product.category}
                  </div>

                  <h4 className="font-medium text-base md:text-lg text-[#3D4035] mb-3 group-hover:text-[#5C6B46] transition-colors line-clamp-2">
                    {product.name}
                  </h4>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#F9F8F6]">
                    <span className="font-bold text-lg md:text-xl text-[#2C2E26]">
                      {product.price}
                    </span>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl || undefined,
                          quantity: 1,
                        });
                      }}
                      className="bg-[#F9F8F6] border border-[#D5D3C9] px-3 py-2 md:py-1.5 rounded-lg text-xs md:text-sm font-bold text-[#5C6B46] hover:bg-[#5C6B46] hover:text-white hover:border-[#5C6B46] transition-all active:scale-95"
                    >
                      Do košíka
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
