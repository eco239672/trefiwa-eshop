import { companyConfig, companyAddressLines } from "../../lib/company/config";

export const metadata = {
  title: "Kontakt",
  description: "Kontaktné a identifikačné údaje prevádzkovateľa e-shopu Trefiwa.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] px-6 py-12 text-[#3D4035]">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#E8E6DF] bg-white p-8 shadow-sm md:p-12">
        <h1 className="border-b border-[#E8E6DF] pb-6 text-3xl font-bold text-[#2C2E26] md:text-5xl">Kontakt</h1>
        <section className="mt-8 space-y-3 leading-relaxed text-[#6B6E56]">
          <h2 className="text-xl font-bold text-[#2C2E26]">Prevádzkovateľ e-shopu</h2>
          <p className="font-semibold text-[#3D4035]">{companyConfig.legalName}</p>
          <address className="not-italic">{companyAddressLines().map((line) => <span key={line} className="block">{line}</span>)}</address>
          <p>IČO: {companyConfig.ico}<br />DIČ: {companyConfig.dic}<br />IČ DPH: {companyConfig.vatId}</p>
          <p>{companyConfig.registry}</p>
        </section>
        <section className="mt-8 space-y-2 leading-relaxed text-[#6B6E56]">
          <h2 className="text-xl font-bold text-[#2C2E26]">Zákaznícka podpora</h2>
          <p><a className="font-semibold text-[#5C6B46] underline" href={`mailto:${companyConfig.email}`}>{companyConfig.email}</a></p>
          <p><a className="font-semibold text-[#5C6B46] underline" href={`tel:${companyConfig.phone.replace(/\s/g, "")}`}>{companyConfig.phone}</a> (8:00 – 16:00)</p>
        </section>
      </div>
    </main>
  );
}
