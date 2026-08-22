"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getProductsBySubCategory } from "../../actions";
import { useCart } from "../../context/CartContext";

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  imageUrl?: string;
};

export default function DozyPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Globálny košík
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    // ⚠️ Over si, či to máš v Prisma Studio s mäkčeňmi alebo bez.
    // Ak to máš v DB uložené ako "Doplnkový sortiment", prepíš to tu!
    getProductsBySubCategory("Dózy na čaj")
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Chyba pri načítaní doplnkového sortimentu:", err);
        setIsLoading(false);
      });
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    openCart();
  };

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] flex flex-col pb-20">
      <section className="px-6 py-16 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-[#2C2E26]">
          Dózy na čaj
        </h2>
        <p className="text-lg md:text-xl text-[#6B6E56] leading-relaxed">
          Všetko potrebné pre dokonalú prípravu vášho obľúbeného čaju.
        </p>
      </section>

      <section className="px-6 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <p className="text-center text-[#A3A697] py-10">
            Načítavam produkty z databázy...
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-[#A3A697] py-10">
            V kategórii Doplnkový sortiment zatiaľ nie sú žiadne produkty.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link
                href={`/produkt/${product.id}`}
                key={product.id}
                className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-[#E8E6DF] flex flex-col cursor-pointer group"
              >
                {/* Správne zobrazenie obrázka */}
                <div className="w-full h-48 bg-[#EFEFEA] rounded-md mb-4 flex items-center justify-center text-[#A3A697] group-hover:bg-[#E8E6DF] transition-colors overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest font-bold">
                      Bez fotky
                    </span>
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
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
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
    </main>
  );
}
