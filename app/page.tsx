export default function Home() {
  // Testovacie dáta - neskôr ich nahradíme naozajstnou databázou
  const products = [
    { id: 1, name: "Zelený sypaný čaj Sencha", price: "8.50 €", category: "Čaje" },
    { id: 2, name: "Sušené mango bez cukru", price: "5.20 €", category: "Sušené ovocie" },
    { id: 3, name: "BIO Mandle natur", price: "12.90 €", category: "Zdravé potraviny" },
    { id: 4, name: "Harmančekový čaj", price: "4.80 €", category: "Čaje" },
  ];

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035]">
      {/* Hlavná navigácia */}
      <header className="p-6 border-b border-[#E8E6DF] flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
        <h1 className="text-3xl font-bold tracking-widest text-[#5C6B46]">
          TREFIWA
        </h1>
        <nav className="space-x-6 text-sm font-medium uppercase tracking-wider">
          <a href="#" className="hover:text-[#8A9A5B] transition-colors">Čaje</a>
          <a href="#" className="hover:text-[#8A9A5B] transition-colors">Zdravé potraviny</a>
          <a href="#" className="hover:text-[#8A9A5B] transition-colors">Sušené ovocie</a>
          <a href="#" className="hover:text-[#8A9A5B] transition-colors font-bold text-[#5C6B46]">Košík (0)</a>
        </nav>
      </header>
      
      {/* Uvítacia sekcia */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
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
            <div key={product.id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-[#E8E6DF] group cursor-pointer">
              {/* Zástupný obrázok (placeholder) */}
              <div className="w-full h-48 bg-[#EFEFEA] rounded-md mb-4 flex items-center justify-center text-[#A3A697] group-hover:bg-[#E8E6DF] transition-colors">
                Obrázok produktu
              </div>
              
              <div className="text-xs font-semibold text-[#8A9A5B] mb-1 uppercase tracking-wide">
                {product.category}
              </div>
              <h4 className="font-medium text-lg text-[#3D4035] mb-3">
                {product.name}
              </h4>
              <div className="flex justify-between items-center mt-auto">
                <span className="font-bold text-xl text-[#2C2E26]">{product.price}</span>
                <button className="bg-[#F9F8F6] border border-[#D5D3C9] px-3 py-1.5 rounded text-sm hover:bg-[#5C6B46] hover:text-white hover:border-[#5C6B46] transition-all">
                  Do košíka
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}