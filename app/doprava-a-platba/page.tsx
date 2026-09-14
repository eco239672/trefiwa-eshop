import { FREE_SHIPPING_THRESHOLD_CENTS, formatEuroFromCents, getDeliveryOptions } from "../../lib/checkout/config";

export default function DopravaAPlatbaPage() {
  const slovakDelivery = getDeliveryOptions("Slovensko");
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
              {slovakDelivery.map((method) => <li key={method.id}><strong>{method.name} ({formatEuroFromCents(method.priceCents)}):</strong> {method.availableForCheckout ? `Doručenie zvyčajne za ${method.time}.` : "Dočasne nedostupné, kým nebude pripojený bezpečný výber výdajného miesta."}</li>)}
              <li><strong className="text-[#8A9A5B]">Doprava ZDARMA:</strong> Pri objednávke od {formatEuroFromCents(FREE_SHIPPING_THRESHOLD_CENTS)} hradíme poštovné za vás. Limit sa počíta z hodnoty tovaru pred zľavou.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2C2E26] mb-4">Možnosti platby</h2>
            <ul className="list-disc pl-6 space-y-3 marker:text-[#8A9A5B]">
              <li><strong>Bankový prevod (zadarmo):</strong> Platobné pokyny a referencia objednávky sa zobrazia po vytvorení objednávky. Tovar odosielame po pripísaní platby.</li>
              <li><strong>Platba kartou online:</strong> Dočasne nedostupná, kým nevyberieme a nepripojíme platobnú bránu.</li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}
