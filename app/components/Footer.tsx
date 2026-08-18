import Link from "next/link";

export default function Footer() {
  return (
    // Zmenšený padding (pt-16 -> pt-8, pb-8 -> pb-4)
    <footer className="bg-[#2C2E26] text-[#D5D3C9] pt-10 pb-6 mt-auto w-full">
      {/* Zmenšená medzera medzi stĺpcami (gap-12 -> gap-6) */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Značka a Popis */}
        <div>
          <Link
            href="/"
            // Zmenšený margin dole (mb-6 -> mb-4)
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
          {/* Zhustené riadky (space-y-3 -> space-y-2) */}
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

        {/* Kategórie */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
            Kategórie
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/caje/cinske-caje"
                className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
              >
                Sypané čaje
              </Link>
            </li>
            <li>
              <Link
                href="/zdrave-potraviny"
                className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
              >
                Zdravé potraviny
              </Link>
            </li>
            <li>
              <Link
                href="/susene-ovocie"
                className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
              >
                Sušené ovocie
              </Link>
            </li>
            <li>
              <Link
                href="/doplnkovy-sortiment"
                className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
              >
                Doplnkový sortiment
              </Link>
            </li>
          </ul>
        </div>

        {/* Odber noviniek */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
            Zostaňme v kontakte
          </h4>
          <p className="text-sm mb-3 text-[#A3A697]">
            Prihláste sa na odber noviniek a získajte zľavu 10% na prvý nákup.
          </p>
          <form className="flex flex-col space-y-2 group">
            <input
              type="email"
              placeholder="Váš e-mail"
              // Trosku nižšie input pole (py-3 -> py-2.5)
              className="bg-[#3D4035] border border-[#5C6B46] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#8A9A5B] focus:ring-1 focus:ring-[#8A9A5B] transition-all duration-300 text-sm placeholder-[#8A9A5B]"
            />
            <button
              type="button"
              className="bg-[#5C6B46] text-white px-4 py-2.5 rounded-lg hover:bg-[#6c7d52] hover:shadow-lg transition-all duration-300 font-medium text-sm active:scale-[0.98]"
            >
              Odoberať novinky
            </button>
          </form>
        </div>
      </div>

      {/* Spodný riadok (Copyright) */}
      {/* Menšie odsadenie od zhora (mt-16 -> mt-10, pt-8 -> pt-6) */}
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-[#3D4035] flex flex-col md:flex-row justify-center items-center text-xs text-[#A3A697]">
        <p>&copy; 2026 TREFIWA. Všetky práva vyhradené.</p>
      </div>
    </footer>
  );
}
