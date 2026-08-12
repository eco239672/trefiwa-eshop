export default function DopravaAPlatbaPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-[#E8E6DF]">
        <h1 className="text-3xl md:text-5xl font-bold text-[#2C2E26] mb-8 border-b border-[#E8E6DF] pb-6">
          Doprava a platba
        </h1>
        
        <div className="space-y-8 text-lg text-[#6B6E56] leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-[#2C2E26] mb-4">Možnosti dopravy</h2>
            <ul className="list-disc pl-6 space-y-3 marker:text-[#8A9A5B]">
              <li><strong>Kuriér DPD (3,90 €):</strong> Doručenie priamo na vašu adresu zvyčajne do 24-48 hodín od expedície.</li>
              <li><strong>Packeta - Zásielkovňa (2,50 €):</strong> Doručenie na vami zvolené výdajné miesto.</li>
              <li><strong className="text-[#8A9A5B]">Doprava ZDARMA:</strong> Pri objednávke nad 40 € hradíme poštovné za vás!</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2C2E26] mb-4">Možnosti platby</h2>
            <ul className="list-disc pl-6 space-y-3 marker:text-[#8A9A5B]">
              <li><strong>Platba kartou online (Zadarmo):</strong> Bezpečná a okamžitá platba cez platobnú bránu.</li>
              <li><strong>Bankový prevod (Zadarmo):</strong> Po vytvorení objednávky vám zašleme údaje k platbe. Tovar odosielame po pripísaní sumy na náš účet.</li>
              <li><strong>Dobierka (1,00 €):</strong> Platba v hotovosti alebo kartou priamo kuriérovi pri prevzatí zásielky.</li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}