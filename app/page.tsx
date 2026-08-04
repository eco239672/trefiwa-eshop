"use client";
import Link from "next/link";
import { useState } from "react";

// Zadefinovanie toho, ako vyzerá náš produkt
type Product = {
  id: number;
  name: string;
  price: string;
  category: string;
};

export default function Home() {
  // Vytvorenie stavu pre košík (na začiatku je prázdny)
  const [cart, setCart] = useState<Product[]>([]);

  // Funkcia, ktorá sa spustí po kliknutí na "Do košíka"
  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  // Naše testovacie produkty
  const products: Product[] = [
    { id: 1, name: "Zelený sypaný čaj Sencha", price: "8.50 €", category: "Čaje" },
    { id: 2, name: "Sušené mango bez cukru", price: "5.20 €", category: "Sušené ovocie" },
    { id: 3, name: "BIO Mandle natur", price: "12.90 €", category: "Zdravé potraviny" },
    { id: 4, name: "Harmančekový čaj", price: "4.80 €", category: "Čaje" },
  ];

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035]">
      
      {/* 3-ÚROVŇOVÁ HLAVIČKA (Sticky - drží sa hore pri scrollovaní) */}
      <header className="w-full bg-white flex flex-col sticky top-0 z-20 shadow-md">
        
        {/* 1. ÚROVEŇ: Pomocné linky a základný kontakt (Tenký horný pásik) */}
        <div className="bg-[#F9F8F6] border-b border-[#E8E6DF] px-6 py-2 flex justify-between items-center text-[11px] md:text-xs text-[#6B6E56] uppercase tracking-wider font-medium">
          <div className="flex space-x-4 md:space-x-6">
            <Link href="/" className="hover:text-[#5C6B46] transition-colors">O nás</Link>
            <Link href="/" className="hover:text-[#5C6B46] transition-colors">Veľkoobchod</Link>
            <Link href="/" className="hover:text-[#5C6B46] transition-colors">Blog</Link>
            <Link href="/" className="hover:text-[#5C6B46] transition-colors">Doprava a platba</Link>
          </div>
          <div className="hidden lg:flex space-x-4 items-center">
             <span>Zákaznícka podpora: <strong className="text-[#3D4035]">+421 900 000 000</strong> (8:00 - 16:00)</span>
             <span>|</span>
             <a href="mailto:info@trefiwa.sk" className="hover:text-[#5C6B46] transition-colors">info@trefiwa.sk</a>
          </div>
        </div>

        {/* 2. ÚROVEŇ: Hlavné Logo, Ikonky a Akcie */}
        <div className="px-6 py-5 flex justify-between items-center max-w-7xl mx-auto w-full">
           
           {/* Logo */}
           <Link href="/" className="text-4xl md:text-5xl font-bold tracking-widest text-[#5C6B46] hover:opacity-90 transition-opacity">
             TREFIWA
           </Link>

           {/* Ikonky napravo */}
           <div className="flex items-center space-x-6 md:space-x-8 text-[#3D4035]">
              
              {/* Lupa / Vyhľadávanie */}
              <button className="hover:text-[#8A9A5B] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>

              {/* Používateľ / Prihlásenie */}
              <div className="flex items-center space-x-3 cursor-pointer hover:text-[#8A9A5B] transition-colors group">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                 </svg>
                 <div className="hidden md:flex flex-col text-left leading-tight">
                    <span className="font-bold text-sm">Prihlásenie</span>
                    <span className="text-xs text-[#8A9A5B] font-medium group-hover:text-[#5C6B46] transition-colors">Registrácia</span>
                 </div>
              </div>

              {/* Nákupná taška / Košík */}
              <div className="flex items-center space-x-3 cursor-pointer hover:text-[#8A9A5B] transition-colors">
                 <div className="relative">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                   </svg>
                   
                   {/* Odznak s číslom (ukáže sa iba ak je niečo v košíku) */}
                   {cart.length > 0 && (
                     <span className="absolute -top-1.5 -right-2 bg-[#5C6B46] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                       {cart.length}
                     </span>
                   )}
                 </div>
                 <span className="hidden md:block font-bold text-sm">Košík</span>
              </div>
           </div>
        </div>

        {/* 3. ÚROVEŇ: Kategórie produktov (Tmavozelený pás) */}
        <div className="bg-[#5C6B46] text-white">
           <nav className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold uppercase tracking-widest">
              <Link href="/" className="hover:text-[#D5D3C9] transition-colors">Káva</Link>
              <Link href="/" className="hover:text-[#D5D3C9] transition-colors">Čaje</Link>
              <Link href="/" className="hover:text-[#D5D3C9] transition-colors">Zdravé potraviny</Link>
              <Link href="/" className="hover:text-[#D5D3C9] transition-colors">Sušené ovocie</Link>
              <Link href="/" className="hover:text-[#D5D3C9] transition-colors">Doplnkový sortiment</Link>
              <Link href="/" className="hover:text-[#D5D3C9] transition-colors">Zvýhodnené balíčky</Link>
           </nav>
        </div>
      </header>
      
      {/* Uvítacia sekcia */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto mt-4">
        <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-[#2C2E26]">
          Príroda priamo k vám domov
        </h2>
        <p className="text-lg md:text-xl text-[#6B6E56] leading-relaxed">
          Objavte našu ponuku prémiových sypaných čajov, zdravých potravín a sušeného ovocia.
        </p>
      </section>

      {/* Sekcia produktov */}
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <h3 className="text-2xl font-semibold mb-8 text-[#2C2E26] border-b border-[#E8E6DF] pb-4">
          Naše novinky
        </h3>
        
        {/* Mriežka produktov */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link href={`/produkt/${product.id}`} key={product.id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-[#E8E6DF] flex flex-col cursor-pointer group">
              {/* Zástupný obrázok (placeholder) */}
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
                
                {/* Tlačidlo na pridanie do košíka */}
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
      </section>
    </main>
  );
}