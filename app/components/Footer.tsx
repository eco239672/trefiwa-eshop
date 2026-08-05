import Link from "next/link";

export default function Footer() {
  return (
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
  );
}