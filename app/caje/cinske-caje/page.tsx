"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getProductsBySubcategory } from "../../actions";

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  imageUrl?: string | null;
  stock?: number; // Pridané pre sledovanie dostupnosti
};

export default function CinskeCajePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProductsBySubcategory("Čínske čaje")
      .then((data: any) => {
        console.log("Dáta z databázy pre tento čaj:", data);
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Chyba pri načítaní čínskych čajov:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] flex flex-col">
      {/* HLAVNÝ OBSAH */}
      <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-16">
        <section className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-[#2C2E26]">
            Čínske čaje
          </h2>
          <p className="text-lg md:text-xl text-[#6B6E56] leading-relaxed">
            Objavte tajomstvo a tradíciu pravých čínskych čajov, pestovaných v tých najlepších podmienkach.
          </p>
        </section>

        {isLoading ? (
          <p className="text-center text-[#A3A697] py-10">Načítavam produkty...</p>
        ) : products.length === 0 ? (
           <p className="text-center text-[#A3A697] py-10">V kategórii Čínske čaje zatiaľ nie sú žiadne produkty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              // Zistíme dostupnosť
              const isAvailable = (product.stock !== undefined ? product.stock : 1) > 0;

              return (
                <Link href={`/produkt/${product.id}`} key={product.id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-[#E8E6DF] flex flex-col cursor-pointer group">
                  
                  <div className="w-full h-48 bg-[#EFEFEA] rounded-md mb-4 flex items-center justify-center text-[#A3A697] overflow-hidden group-hover:opacity-90 transition-opacity">
                    {product.imageUrl ? (
                      // Neupravované podľa tvojej požiadavky
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl})` }}></div>
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

                  {/* NOVÉ: Indikátor dostupnosti na sklade */}
                  <div className="flex items-center gap-1.5 mb-3 mt-auto">
                    {isAvailable ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <span className="text-[11px] font-semibold text-green-700 uppercase tracking-wider">Dostupný</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">Vypredané</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-[#F9F8F6]">
                    <span className="font-bold text-xl text-[#2C2E26]">{product.price}</span>
                    
                    {/* ZMENENÉ: Tlačidlo "Vybrať". 
                        Už nepotrebuje onClick, pretože kliknutie naň aktivuje rodičovský <Link> */}
                    <span className="bg-[#F9F8F6] border border-[#D5D3C9] px-4 py-1.5 rounded text-sm font-medium group-hover:bg-[#5C6B46] group-hover:text-white group-hover:border-[#5C6B46] transition-all">
                      Vybrať
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}