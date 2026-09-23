import { companyConfig, companyAddressLines } from "../../lib/company/config";

export default function ObchodnePodmienkyPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-[#E8E6DF]">
        <h1 className="text-3xl md:text-5xl font-bold text-[#2C2E26] mb-8 border-b border-[#E8E6DF] pb-6">
          Obchodné podmienky
        </h1>
        
        <div className="space-y-6 text-[#6B6E56] leading-relaxed">
          <p className="text-sm italic mb-8">Naposledy aktualizované: 1. Januára 2026</p>

          <section className="rounded-xl bg-[#F2F1EC] p-5 text-sm">
            <h2 className="text-xl font-bold text-[#2C2E26]">Predávajúci</h2>
            <p className="mt-2 font-semibold text-[#3D4035]">{companyConfig.legalName}</p>
            <p>{companyAddressLines().map((line) => <span key={line} className="block">{line}</span>)}</p>
            <p className="mt-2">IČO: {companyConfig.ico} · DIČ: {companyConfig.dic} · IČ DPH: {companyConfig.vatId}</p>
            <p>{companyConfig.registry}</p>
            <p className="mt-2"><a className="underline" href={`mailto:${companyConfig.email}`}>{companyConfig.email}</a> · <a className="underline" href={`tel:${companyConfig.phone.replace(/\s/g, "")}`}>{companyConfig.phone}</a></p>
          </section>
          
          <h2 className="text-xl font-bold text-[#2C2E26]">1. Úvodné ustanovenia</h2>
          <p>Tieto obchodné podmienky platia pre nákup v internetovom obchode TREFIWA. Podmienky bližšie vymedzujú a upresňujú práva a povinnosti predávajúceho a kupujúceho.</p>
          
          <h2 className="text-xl font-bold text-[#2C2E26]">2. Objednávka a uzatvorenie kúpnej zmluvy</h2>
          <p>Všetky objednávky podané prostredníctvom internetového obchodu sú záväzné. Podaním objednávky kupujúci potvrdzuje, že sa oboznámil s týmito obchodnými podmienkami a že s nimi súhlasí.</p>

          <h2 className="text-xl font-bold text-[#2C2E26]">3. Odstúpenie od zmluvy</h2>
          <p>Kupujúci má v súlade so zákonom právo odstúpiť od zmluvy do 14 dní od prevzatia tovaru bez udania dôvodu. Tovar musí byť vrátený nepoškodený a v pôvodnom obale.</p>
          
          <p className="mt-8 text-sm bg-[#F2F1EC] p-4 rounded">
            Tento dokument zatiaľ nie je kompletným znením obchodných podmienok. Pred ďalšou produkčnou aktiváciou je potrebné schválené právne znenie prevádzkovateľa.
          </p>
        </div>
      </div>
    </main>
  );
}
