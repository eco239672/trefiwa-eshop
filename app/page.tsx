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
        setProducts(data);
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
        <section className="px-6 py-20 text-center max-w-4xl mx-auto mt-4">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-[#2C2E26]">
            Z prírody priamo k vám ...
          </h2>
          <p className="text-lg md:text-xl text-[#6B6E56] leading-relaxed">
            Objavte našu ponuku prémiových sypaných čajov, zdravých potravín a
            sušeného ovocia.
          </p>
        </section>

        <section className="px-6 pb-24 max-w-7xl mx-auto">
          <h3 className="text-2xl font-semibold mb-8 text-[#2C2E26] border-b border-[#E8E6DF] pb-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {/* TUTO JE ZMENA: Pridané .slice(0, 4) na obmedzenie počtu na 4 kusy */}
              {products.slice(0, 4).map((product) => (
                <Link
                  href={`/produkt/${product.id}`}
                  key={product.id}
                  className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-[#E8E6DF] flex flex-col cursor-pointer group"
                >
                  {/* FOTKA PRODUKTU */}
                  <div className="w-full h-40 bg-[#EFEFEA] rounded-md mb-4 flex items-center justify-center text-[#A3A697] overflow-hidden group-hover:opacity-90 transition-opacity">
                    {product.imageUrl ? (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${product.imageUrl})` }}
                      ></div>
                    ) : (
                      <span className="text-xs">Bez obrázka</span>
                    )}
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

                    {/* TLAČIDLO KOŠÍKA - Použijeme e.preventDefault(), aby kliknutie na tlačidlo neotvorilo stránku produktu */}
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Zabráni Linku prejsť na detail produktu priamo po kliknutí na "Do košíka"
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl || undefined,
                          quantity: 1,
                        });
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
      </div>
    </main>
  );
}
