import Link from "next/link";
import { companyConfig } from "../../lib/company/config";

export default function Footer() {
  return (
    // PRIDANÉ: rounded-t-[40px] pre krásne zaoblené horné rohy tmavej (zelenej) časti
    <footer className="bg-[#2C2E26] text-[#D5D3C9] pt-10 pb-6 mt-auto w-full rounded-t-[40px]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Značka a Popis */}
        <div>
          <Link
            href="/"
            className="text-3xl font-bold tracking-widest text-[#8A9A5B] hover:text-[#A3A697] transition-colors duration-300 block mb-4"
          >
            TREFIWA
          </Link>
          <p className="text-sm leading-relaxed text-[#A3A697]">
            Vaša denná dávka z prírody. Ponúkame výber tých kvalitných sypaných
            čajov a zdravých potravín pre váš vyvážený životný štýl.
          </p>
        </div>

        {/* Informácie */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
            Informácie
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/o-nas"
                className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
              >
                O nás
              </Link>
            </li>
            <li>
              <Link
                href="/kontakt"
                className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
              >
                Kontakt
              </Link>
            </li>
            <li>
              <Link
                href="/doprava-a-platba"
                className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
              >
                Doprava a platba
              </Link>
            </li>
            <li>
              <Link
                href="/obchodne-podmienky"
                className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
              >
                Obchodné podmienky
              </Link>
            </li>
            <li>
              <Link
                href="/ochrana-osobnych-udajov"
                className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
              >
                Ochrana osobných údajov
              </Link>
            </li>
          </ul>
        </div>

        {/* Odber noviniek */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Newsletter sa pripravuje</h4>
          <p className="text-sm mb-3 text-[#A3A697]">
            Odber spustíme až po nakonfigurovaní e-mailovej služby a bezpečného odhlásenia.
          </p>
          <address className="mt-4 not-italic text-xs leading-relaxed text-[#A3A697]">
            <strong className="block text-[#D5D3C9]">Prevádzkovateľ: {companyConfig.legalName}</strong>
            {companyConfig.address.street}<br />
            {companyConfig.address.postalCode} {companyConfig.address.city}, {companyConfig.address.country}<br />
            IČO: {companyConfig.ico} · IČ DPH: {companyConfig.vatId}<br />
            <a className="hover:text-white" href={`mailto:${companyConfig.email}`}>{companyConfig.email}</a><br />
            <a className="hover:text-white" href={`tel:${companyConfig.phone.replace(/\s/g, "")}`}>{companyConfig.phone}</a>
          </address>
          <div className="flex flex-col space-y-2" aria-disabled="true">
            <input
              type="email"
              placeholder="Odber zatiaľ nie je dostupný"
              disabled
              className="bg-[#3D4035] border border-[#5C6B46] text-white px-4 py-2.5 rounded-lg text-sm placeholder-[#8A9A5B] disabled:opacity-70"
            />
            <button
              type="button" disabled
              className="bg-[#5C6B46] text-white px-4 py-2.5 rounded-lg font-medium text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              Odber čoskoro
            </button>
          </div>
        </div>
      </div>

      {/* Spodný riadok (Copyright) */}
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-[#3D4035] flex flex-col md:flex-row justify-center items-center text-xs text-[#A3A697]">
        <p>&copy; 2026 TREFIWA. Všetky práva vyhradené.</p>
      </div>
    </footer>
  );
}
