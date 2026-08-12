export default function OchranaOsobnychUdajovPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-[#E8E6DF]">
        <h1 className="text-3xl md:text-5xl font-bold text-[#2C2E26] mb-8 border-b border-[#E8E6DF] pb-6">
          Ochrana osobných údajov
        </h1>
        
        <div className="space-y-6 text-[#6B6E56] leading-relaxed">
          <p>Ochrana vášho súkromia je pre nás dôležitá. V tomto dokumente nájdete informácie o tom, aké osobné údaje spracovávame, prečo tak robíme a aké sú vaše práva v súvislosti s GDPR.</p>
          
          <h2 className="text-xl font-bold text-[#2C2E26]">Aké údaje zbierame?</h2>
          <p>Pri vytváraní objednávky od vás požadujeme iba údaje nevyhnutné pre jej úspešné vybavenie (meno, priezvisko, dodacia adresa, e-mail a telefónne číslo).</p>

          <h2 className="text-xl font-bold text-[#2C2E26]">Ako údaje chránime?</h2>
          <p>Všetky dáta sú uložené na zabezpečených serveroch a pri prenose sú šifrované pomocou SSL certifikátu. Vaše údaje neposkytujeme žiadnym tretím stranám okrem prepravných spoločností za účelom doručenia tovaru.</p>

          <h2 className="text-xl font-bold text-[#2C2E26]">Vaše práva</h2>
          <p>Máte právo kedykoľvek požiadať o výpis vašich osobných údajov, ich úpravu alebo úplné vymazanie z našej databázy kontaktovaním našej zákazníckej podpory.</p>

          <p className="mt-8 text-sm bg-[#F2F1EC] p-4 rounded">
            (Toto je iba ukážkový text. Pred spustením e-shopu sem vložte oficiálne znenie zásad ochrany osobných údajov - GDPR.)
          </p>
        </div>
      </div>
    </main>
  );
}