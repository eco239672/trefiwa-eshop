"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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

  // REFERENCIA NA POSUVNÍK PRE AUTOMATICKÝ POHYB
  const carouselRef = useRef<HTMLDivElement>(null);

  // Načítanie produktov
  useEffect(() => {
    getAllProducts()
      .then((data: any) => {
        setProducts(data.slice(0, 8));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Chyba pri načítaní produktov:", err);
        setIsLoading(false);
      });
  }, []);

  // AUTOMATICKÉ POSÚVANIE
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 3000); // 3000 = 3 sekundy. Pre rýchlejší posun daj napr. 2000

    return () => clearInterval(interval);
  }, [products]);

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] flex flex-col overflow-hidden">
      <div className="flex-grow">
        {/* HERO SEKCIA */}
        <section className="px-4 sm:px-6 py-12 md:py-20 text-center max-w-4xl mx-auto mt-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-6 text-[#2C2E26]">
            Z prírody k nám ...
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-[#6B6E56] leading-relaxed px-2">
            Objavte našu ponuku prémiových sypaných čajov, čajových zmesí,
            zdravých potravín a ekológie...
          </p>
        </section>

        {/* SEKCIA NOVINKY */}
        <section className="pb-24 w-full">
          <div className="px-4 md:px-8 lg:px-12">
            <h3 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 text-[#2C2E26] border-b border-[#E8E6DF] pb-4">
              Naše novinky
            </h3>
          </div>

          {isLoading ? (
            <p className="text-center text-[#A3A697] py-10">
              Načítavam produkty z databázy...
            </p>
          ) : products.length === 0 ? (
            <p className="text-center text-[#A3A697] py-10">
              Zatiaľ tu nie sú žiadne produkty. Pridaj nejaké cez Prisma Studio!
            </p>
          ) : (
            /* CAROUSEL (POSUVNÍK) PRODUKTOV - Pridané ref={carouselRef} */
            <div
              ref={carouselRef}
              className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 px-4 md:px-8 lg:px-12 snap-x snap-mandatory no-scrollbar w-full scroll-smooth"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-none w-[260px] sm:w-[280px] snap-start"
                >
                  <Link
                    href={`/produkt/${product.id}`}
                    className="bg-white rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-[#E8E6DF] flex flex-col cursor-pointer group h-full"
                  >
                    <div className="w-full h-40 md:h-48 bg-[#EFEFEA] rounded-lg mb-4 flex items-center justify-center text-[#A3A697] overflow-hidden group-hover:opacity-90 transition-opacity">
                      {product.imageUrl ? (
                        <div
                          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{
                            backgroundImage: `url(${product.imageUrl})`,
                          }}
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
                </div>
              ))}

              {/* Vzduchová medzera na konci posuvníka */}
              <div className="flex-none w-[1px] md:w-4"></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
