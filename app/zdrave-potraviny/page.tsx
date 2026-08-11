"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getProductsBySubCategory } from "../actions";

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
};

export default function HealthyFoodsCategory() {
  const [cart, setCart] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ťaháme IBA produkty z kategórie "Zdravé potraviny"
    getProductsBySubCategory("Zdravé potraviny")
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Chyba pri načítaní zdravých potravín:", err);
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
            Zdravé potraviny
          </h2>
          <p className="text-lg md:text-xl text-[#6B6E56] leading-relaxed">
            Využite pre svoje to to najlepšie, z toho čo príroda ponúka.
          </p>
        </section>

        <section className="px-6 pb-20 max-w-7xl mx-auto">
          {isLoading ? (
            <p className="text-center text-[#A3A697] py-10">Načítavam potraviny z databázy...</p>
          ) : products.length === 0 ? (
             <p className="text-center text-[#A3A697] py-10">V kategórii Zdravé potraviny zatiaľ nie sú žiadne produkty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link href={`/produkt/${product.id}`} key={product.id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-[#E8E6DF] flex flex-col cursor-pointer group">
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
                    <span className="font-bold text-xl text-[#2C2E26]">{product.price}</span>
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

        {/* 5 PODSEKCIÍ ZDRAVÝCH POTRAVÍN */}
        <section className="bg-white py-20 border-t border-b border-[#E8E6DF]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8A9A5B] block mb-2">Pre vaše zdravie</span>
              <h3 className="text-3xl md:text-4xl font-bold text-[#2C2E26]">Zistite viac o našich potravinách</h3>
            </div>
            <div className="space-y-12 text-[#6B6E56] leading-relaxed text-base md:text-lg">
              <div id="sekcia-1" className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32">
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">1</span>
                  Podsekcia 1
                </h4>
                <p>Miesto pre váš text k prvej podsekcii zdravých potravín...</p>
              </div>
              <div id="sekcia-2" className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32">
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">2</span>
                  Podsekcia 2
                </h4>
                <p>Miesto pre váš text k druhej podsekcii...</p>
              </div>
              <div id="sekcia-3" className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32">
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">3</span>
                  Podsekcia 3
                </h4>
                <p>Miesto pre váš text k tretej podsekcii...</p>
              </div>
              <div id="sekcia-4" className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32">
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">4</span>
                  Podsekcia 4
                </h4>
                <p>Miesto pre váš text k štvrtej podsekcii...</p>
              </div>
              <div id="sekcia-5" className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF] scroll-mt-32">
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">5</span>
                  Podsekcia 5
                </h4>
                <p>Miesto pre váš text k piatej podsekcii...</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-[#2C2E26] text-[#D5D3C9] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="text-3xl font-bold tracking-widest text-[#8A9A5B] hover:text-[#A3A697] transition-colors block mb-6">TREFIWA</Link>
            <p className="text-sm leading-relaxed text-[#A3A697]">Vaša denná dávka prírody. Ponúkame výber tých najkvalitnejších sypaných čajov a zdravých potravín pre váš vyvážený životný štýl.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Informácie</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">O nás</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Doprava a platba</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Obchodné podmienky</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Ochrana osobných údajov</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Kategórie</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/caje" className="hover:text-white transition-colors">Sypané čaje</Link></li>
              <li><Link href="/zdrave-potraviny" className="hover:text-white transition-colors">Zdravé potraviny</Link></li>
              <li><Link href="/susene-ovocie" className="hover:text-white transition-colors">Sušené ovocie</Link></li>
              <li><Link href="/doplnkovy-sortiment" className="hover:text-white transition-colors">Doplnkový sortiment</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Zostaňme v kontakte</h4>
            <p className="text-sm mb-4 text-[#A3A697]">Prihláste sa na odber noviniek a získajte zľavu 10% na prvý nákup.</p>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Váš e-mail" className="bg-[#3D4035] border border-[#5C6B46] text-white px-4 py-3 rounded-md focus:outline-none focus:border-[#8A9A5B] text-sm placeholder-[#8A9A5B]" />
              <button className="bg-[#5C6B46] text-white px-4 py-3 rounded-md hover:bg-[#4A5738] transition-colors font-medium text-sm">Odoberať novinky</button>
            </form>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#3D4035] flex flex-col md:flex-row justify-between items-center text-xs text-[#A3A697]">
          <p>&copy; 2026 TREFIWA. Všetky práva vyhradené.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors font-medium">Facebook</a>
            <a href="#" className="hover:text-white transition-colors font-medium">Instagram</a>
          </div>
        </div>
      </footer>
    </main>
  );
}