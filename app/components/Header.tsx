import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="w-full bg-white flex flex-col sticky top-0 z-20 shadow-md">
      <div className="bg-[#F9F8F6] border-b border-[#E8E6DF] px-6 py-2 flex justify-between items-center text-[11px] md:text-xs text-[#6B6E56] uppercase tracking-wider font-medium">
        <div className="hidden lg:flex space-x-4 items-center">
          <span>Zákaznícka podpora: <strong className="text-[#3D4035]">+421 900 000 000</strong> (8:00 - 16:00)</span>
          <span>|</span>
          <a href="mailto:info@trefiwa.sk" className="hover:text-[#5C6B46] transition-colors">info@trefiwa.sk</a>
        </div>
      </div>

      <div className="px-6 py-5 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="text-4xl md:text-5xl font-bold tracking-widest text-[#5C6B46] hover:opacity-90 transition-opacity">
          TREFIWA
        </Link>

        <div className="flex items-center space-x-6 md:space-x-8 text-[#3D4035]">
          
          {/* Naša nová Lupa */}
          <SearchBar />

          <div className="flex items-center space-x-3 cursor-pointer hover:text-[#8A9A5B] transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="font-bold text-sm">Prihlásenie</span>
              <span className="text-xs text-[#8A9A5B] font-medium group-hover:text-[#5C6B46] transition-colors">Registrácia</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 cursor-pointer hover:text-[#8A9A5B] transition-colors">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {/* Poznámka: Počítadlo košíka som zatiaľ skryl, pridáme ho späť, keď prepojíme košík na celú stránku (tzv. Global State) */}
            </div>
            <span className="hidden md:block font-bold text-sm">Košík</span>
          </div>
        </div>
      </div>

      <div className="bg-[#5C6B46] text-white">
        <nav className="max-w-7xl mx-auto px-6 flex flex-wrap gap-x-8 text-sm font-semibold uppercase tracking-widest items-center">
          
          <div className="relative group py-4">
            <span className="text-[#D5D3C9] flex items-center gap-1 border-b-2 border-[#D5D3C9] pb-[14px] cursor-pointer">
              Čaje
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
            <div className="absolute left-0 top-full w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white text-[#3D4035] shadow-lg rounded-b-md overflow-hidden flex flex-col border border-[#E8E6DF] border-t-0 font-medium tracking-wide">
                <Link href="/caje/cinske-caje" className="px-5 py-3 hover:bg-[#F9F8F6] hover:text-[#5C6B46] text-xs border-b border-[#E8E6DF] transition-colors">Čínske čaje</Link>
                <Link href="/caje/zelene-caje" className="px-5 py-3 hover:bg-[#F9F8F6] hover:text-[#5C6B46] text-xs border-b border-[#E8E6DF] transition-colors">Zelené čaje</Link>
                <Link href="/caje/cierne-caje" className="px-5 py-3 hover:bg-[#F9F8F6] hover:text-[#5C6B46] text-xs border-b border-[#E8E6DF] transition-colors">Čierne čaje</Link>
                <Link href="/caje/ovocne-caje" className="px-5 py-3 hover:bg-[#F9F8F6] hover:text-[#5C6B46] text-xs border-b border-[#E8E6DF] transition-colors">Ovocné čaje</Link>
                <Link href="/caje/bylinne-zmesi" className="px-5 py-3 hover:bg-[#F9F8F6] hover:text-[#5C6B46] text-xs transition-colors">Bylinné zmesi</Link>
              </div>
            </div>
          </div>

          <div className="relative group py-4">
            <Link href="/zdrave-potraviny" className="hover:text-[#D5D3C9] transition-colors flex items-center gap-1">
              Zdravé potraviny
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </Link>
          </div>

          <div className="relative group py-4">
            <Link href="/susene-ovocie" className="hover:text-[#D5D3C9] transition-colors flex items-center gap-1">
              Sušené ovocie
            </Link>
          </div>

          <div className="relative group py-4">
            <Link href="/doplnkovy-sortiment" className="hover:text-[#D5D3C9] transition-colors flex items-center gap-1">
              Doplnkový sortiment
            </Link>
          </div>

          <div className="relative group py-4">
            <Link href="/zvyhodnene-balicky" className="hover:text-[#D5D3C9] transition-colors flex items-center gap-1">
              Zvýhodnené balíčky
            </Link>
          </div>

        </nav>
      </div>
    </header>
  );
}