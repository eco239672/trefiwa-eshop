import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import BackButton from "./BackButton";
import SearchBar from "../../components/SearchBar";
import AddToCartButton from "../../components/AddToCartButton";
const prisma = new PrismaClient();

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Ťaháme produkt priamo z databázy
  const product = await prisma.product.findUnique({
    where: { id: id },
  });

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F6] text-[#3D4035]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produkt nebol nájdený</h1>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#8A9A5B] hover:text-[#5C6B46] mb-6 transition-colors">
            &larr; Späť na ponuku
          </Link>
        </div>
      </div>
    );
  }

  // --- LOGIKA PRE CENY A SKLAD ---
  const currentPrice = Number(product.price);
  const oldPrice = (product as any).oldPrice ? Number((product as any).oldPrice) : null; 
  const stock = (product as any).stock !== undefined ? Number((product as any).stock) : 15;
  const imageUrl = (product as any).imageUrl || null;

  // Výpočet percentuálnej zľavy
  const discountPercent = oldPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] flex flex-col">


      {/* HLAVNÝ OBSAH (flex-grow zabezpečí, že footer bude vždy dole) */}
      <section className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full">
        {/* Naimportované klientske tlačidlo Späť */}
        <BackButton />

        {/* --- VRCHNÁ ČASŤ: OBRÁZOK A NÁKUPNÝ BOX --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6DF] overflow-hidden flex flex-col lg:flex-row mb-12">
          
          {/* Ľavá strana: Veľký Obrázok */}
          <div className="lg:w-3/5 bg-[#F2F1EC] min-h-[500px] flex items-center justify-center relative group">
            {imageUrl ? (
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}></div>
            ) : (
              <div className="text-center text-[#A3A697]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 mx-auto mb-4 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-lg">Fotografia produktu<br/>(Sem sa načíta obrázok z DB)</p>
              </div>
            )}
            
            {/* Zľavový štítok na obrázku (ak je zľava) */}
            {discountPercent > 0 && (
              <div className="absolute top-6 left-6 bg-[#D84949] text-white px-3 py-1.5 rounded text-sm font-bold tracking-wider shadow-md">
                -{discountPercent} %
              </div>
            )}
          </div>

          {/* Pravá strana: Detail a Košík */}
          <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-between bg-white relative">
            <div>
              {/* Kategória a Názov */}
              <div className="text-xs font-bold text-[#8A9A5B] mb-3 uppercase tracking-widest">
                Prémiové čaje
              </div>
              <h1 className="text-4xl font-bold text-[#2C2E26] mb-6 leading-tight">
                {product.name}
              </h1>

              {/* Cena (Nová vs Stará) */}
              <div className="flex items-end gap-4 mb-6">
                <span className="text-4xl font-extrabold text-[#5C6B46]">
                  {currentPrice.toFixed(2)} €
                </span>
                {oldPrice && (
                  <span className="text-xl text-[#A3A697] line-through font-medium mb-1">
                    {oldPrice.toFixed(2)} €
                  </span>
                )}
              </div>

              {/* Skladová dostupnosť */}
              <div className="flex items-center gap-2 mb-10">
                {stock > 0 ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-green-700">Skladom ({stock} ks) – Pripravené na odoslanie</span>
                  </>
                ) : (
                  <>
                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                    <span className="text-sm font-semibold text-red-600">Vypredané</span>
                  </>
                )}
              </div>
            </div>

            {/* Tlačidlo a benefity */}
            <div>
<AddToCartButton product={product} stock={stock} />

              {/* Dôveryhodné Ikonky */}
              <div className="grid grid-cols-1 gap-4 border-t border-[#E8E6DF] pt-6">
                <div className="flex items-center gap-3 text-sm text-[#6B6E56] font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#8A9A5B]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  Expresné doručenie do 24 hodín
                </div>
                <div className="flex items-center gap-3 text-sm text-[#6B6E56] font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#8A9A5B]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  100% garancia prémiovej kvality
                </div>
                <div className="flex items-center gap-3 text-sm text-[#6B6E56] font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#8A9A5B]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                  </svg>
                  Ekologické a kompostovateľné balenie
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SPODNÁ ČASŤ: DETAILNÝ POPIS --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6DF] p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-[#2C2E26] mb-6 border-b border-[#E8E6DF] pb-4">
            O produkte
          </h2>
          <div className="prose prose-lg text-[#6B6E56] max-w-none leading-relaxed">
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      </section>

      {/* PÄTA (FOOTER) - Presne ako na hlavnej stránke */}
      <footer className="bg-[#2C2E26] text-[#D5D3C9] pt-16 pb-8 mt-auto w-full">
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
              <li><Link href="/caje/cinske-caje" className="hover:text-white transition-colors">Sypané čaje</Link></li>
              <li><Link href="/zdrave-potraviny" className="hover:text-white transition-colors">Zdravé potraviny</Link></li>
              <li><Link href="/susene-ovocie" className="hover:text-white transition-colors">Sušené ovocie</Link></li>
              <li><Link href="/doplnkovy-sortiment" className="hover:text-white transition-colors">Doplnkový sortiment</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Zostaňme v kontakte</h4>
            <p className="text-sm mb-4 text-[#A3A697]">Prihláste sa na odber noviniek a získajte zľavu 10% na prvý nákup.</p>
            {/* Keďže sme v Server Componente, onSubmit pre formulár nepoužívame, aby nevyhadzovalo chybu. Môžeš to neskôr upraviť cez Server Actions */}
            <form className="flex flex-col space-y-3">
              <input type="email" placeholder="Váš e-mail" className="bg-[#3D4035] border border-[#5C6B46] text-white px-4 py-3 rounded-md focus:outline-none focus:border-[#8A9A5B] text-sm placeholder-[#8A9A5B]" />
              <button type="button" className="bg-[#5C6B46] text-white px-4 py-3 rounded-md hover:bg-[#4A5738] transition-colors font-medium text-sm">Odoberať novinky</button>
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