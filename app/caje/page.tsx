"use client";
import Link from "next/link";
import { useState } from "react";

type Product = {
  id: number;
  name: string;
  price: string;
  category: string;
};

export default function TeasCategory() {
  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const products: Product[] = [
    { id: 1, name: "Zelený sypaný čaj Sencha", price: "8.50 €", category: "Čaje" },
    { id: 2, name: "Čierny čaj Earl Grey Imperial", price: "7.90 €", category: "Čaje" },
    { id: 3, name: "Jasmínový čaj Dračie perly", price: "11.50 €", category: "Čaje" },
    { id: 4, name: "Bylinná zmes Pokojný spánok", price: "6.20 €", category: "Čaje" },
    { id: 5, name: "Oolong čaj Milk Premium", price: "9.80 €", category: "Čaje" },
    { id: 6, name: "Matcha BIO Grade A", price: "14.90 €", category: "Čaje" },
  ];

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] flex flex-col">
      
      {/* 3-ÚROVŇOVÁ HLAVIČKA */}
      <header className="w-full bg-white flex flex-col sticky top-0 z-20 shadow-md">
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

        <div className="px-6 py-5 flex justify-between items-center max-w-7xl mx-auto w-full">
           <Link href="/" className="text-4xl md:text-5xl font-bold tracking-widest text-[#5C6B46] hover:opacity-90 transition-opacity">
             TREFIWA
           </Link>

           <div className="flex items-center space-x-6 md:space-x-8 text-[#3D4035]">
              <button className="hover:text-[#8A9A5B] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
              <div className="flex items-center space-x-3 cursor-pointer hover:text-[#8A9A5B] transition-colors group">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                 </svg>
                 <div className="hidden md:flex flex-col text-left leading-tight">
                    <span className="font-bold text-sm">Prihlásenie</span>
                    <span className="text-xs text-[#8A9A5B] font-medium group-hover:text-[#5C6B46] transition-colors">Registrácia</span>
                 </div>
              </div>
              <div className="flex items-center space-x-3 cursor-pointer hover:text-[#8A9A5B] transition-colors">
                 <div className="relative">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                   </svg>
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

        <div className="bg-[#5C6B46] text-white">
           <nav className="max-w-7xl mx-auto px-6 flex flex-wrap gap-x-8 text-sm font-semibold uppercase tracking-widest items-center">
              
              {/* DROPDOWN MENU PRE ČAJE */}
              <div className="relative group py-4">
                <Link href="/caje" className="text-[#D5D3C9] flex items-center gap-1 border-b-2 border-[#D5D3C9] pb-[14px]">
                  Čaje
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </Link>
                
                <div className="absolute left-0 top-full w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white text-[#3D4035] shadow-lg rounded-b-md overflow-hidden flex flex-col border border-[#E8E6DF] border-t-0 font-medium tracking-wide">
                    <Link href="/caje" className="px-5 py-3 hover:bg-[#F9F8F6] hover:text-[#5C6B46] text-xs border-b border-[#E8E6DF] transition-colors">Všetky čaje</Link>
                    <Link href="/caje" className="px-5 py-3 hover:bg-[#F9F8F6] hover:text-[#5C6B46] text-xs border-b border-[#E8E6DF] transition-colors">Zelené čaje</Link>
                    <Link href="/caje" className="px-5 py-3 hover:bg-[#F9F8F6] hover:text-[#5C6B46] text-xs border-b border-[#E8E6DF] transition-colors">Čierne čaje</Link>
                    <Link href="/caje" className="px-5 py-3 hover:bg-[#F9F8F6] hover:text-[#5C6B46] text-xs border-b border-[#E8E6DF] transition-colors">Ovocné čaje</Link>
                    <Link href="/caje" className="px-5 py-3 hover:bg-[#F9F8F6] hover:text-[#5C6B46] text-xs transition-colors">Bylinné zmesi</Link>
                  </div>
                </div>
              </div>

              <Link href="/" className="py-4 hover:text-[#D5D3C9] transition-colors">Zdravé potraviny</Link>
              <Link href="/" className="py-4 hover:text-[#D5D3C9] transition-colors">Sušené ovocie</Link>
              <Link href="/" className="py-4 hover:text-[#D5D3C9] transition-colors">Doplnkový sortiment</Link>
              <Link href="/" className="py-4 hover:text-[#D5D3C9] transition-colors">Zvýhodnené balíčky</Link>
           </nav>
        </div>
      </header>
      
      <div className="flex-grow">
        <section className="px-6 py-16 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-[#2C2E26]">
            Prémiové sypané čaje
          </h2>
          <p className="text-lg md:text-xl text-[#6B6E56] leading-relaxed">
            Vyberte si z našej ponuky starostlivo vybraných čajov z celého sveta.
          </p>
        </section>

        <section className="px-6 pb-20 max-w-7xl mx-auto">
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
        </section>

        <section className="bg-white py-20 border-t border-b border-[#E8E6DF]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8A9A5B] block mb-2">Tradícia a kvalita</span>
              <h3 className="text-3xl md:text-4xl font-bold text-[#2C2E26]">Svet čajov TREFIWA</h3>
            </div>

            <div className="space-y-12 text-[#6B6E56] leading-relaxed text-base md:text-lg">
              <div className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF]">
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">1</span>
                  Pôvod a starostlivý výber z najlepších záhrad
                </h4>
                <p>Všetky naše čaje pochádzajú zo starostlivo vybraných rodinných plantáží v Ázii a Európe, kde pestovanie prebieha v súlade s prírodnými cyklami. Dbáme na to, aby čajové lístky boli zberané v správnom čase, kedy obsahujú najvyššiu koncentráciu esenciálnych olejov a arómy. Vďaka priamym kontaktom s pestovateľmi garantujeme čerstvosť a dohľadateľnosť každého jedného balenia.</p>
              </div>

              <div className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF]">
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">2</span>
                  Tradičné spracovanie bez umelých prísad
                </h4>
                <p>Spracovanie čajových lístkov prebieha tradičnými metódami, ktoré rešpektujú prirodzené vlastnosti rastliny. Či už ide o jemne parovanú japonskú Senchu alebo poctivo fermentované čierne čaje, pri tvorbe našich zmesí nepoužívame žiadne syntetické arómy, farbivá ani konzervanty. Čistá a autentická chuť je pre nás vždy na prvom mieste.</p>
              </div>

              <div className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF]">
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">3</span>
                  Bohatstvo antioxidantov a zdravotné benefity
                </h4>
                <p>Kvalitný sypaný čaj je prirodzeným zdrojom polyfenolov, katechínov a dôležitých minerálov, ktoré podporujú obranyschopnosť organizmu, znižujú stres a napomáhajú správnemu tráveniu. Pravidelné pitie zmesí ako zelený čaj či Matcha napomáha regenerácii tela, stimuluje myseľ a dodáva dlhotrvajúcu energiu bez nežiaducich výkyvov.</p>
              </div>

              <div className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF]">
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">4</span>
                  Rituál správnej prípravy pre dokonalý zážitok
                </h4>
                <p>Priprava sypaného čaju je malým meditačným rituálom v zrýchlenom svete. Pre dosiahnutie plnej chuti odporúčame sledovať správnu teplotu vody a čas lúhovania – napríklad zelené čaje si vyžadujú chladnejšiu vodu (okolo 70 – 80 °C), zatiaľ čo bylinné zmesi potrebujú vriacu vodu a dlhší čas lúhovania, aby uvoľnili svoje liečivé silice.</p>
              </div>

              <div className="p-6 bg-[#F9F8F6] rounded-xl border border-[#E8E6DF]">
                <h4 className="text-xl font-semibold text-[#3D4035] mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#5C6B46] text-white text-sm flex items-center justify-center font-bold">5</span>
                  Udržateľné balenie a ochrana čerstvosti
                </h4>
                <p>Aby si naše čaje zachovali svoju pôvodnú arómu a chuťový profil po dlhú dobu, balíme ich do špeciálnych trojvrstvových znovuuzatvárateľných vrecúšok. Tieto obaly chránia čaj pred svetlom, vlhkosťou a vzduchom, a zároveň sú navrhnuté s ohľadom na životné prostredie a jednoduchú recykláciu.</p>
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
              <li><Link href="/" className="hover:text-white transition-colors">Zdravé potraviny</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Sušené ovocie</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Doplnkový sortiment</Link></li>
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
  )             
}