"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import LoginModal from "./AuthModal"; // Tvoj opravený názov modalu
import { getSession, logoutUser } from "../authActions";

// Zadefinujeme typ pre nášho používateľa
type User = {
  id: string;
  name: string;
  email: string;
} | null;

export default function Header() {
  const { openCart, cart } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User>(null);

  // Po načítaní stránky zistíme, či je používateľ prihlásený
  useEffect(() => {
    getSession().then((userData) => {
      if (userData) {
        setUser(userData);
      }
    });
  }, []);

  // Funkcia na odhlásenie
  // Funkcia na odhlásenie
  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    window.location.href = "/"; // <-- TOTO JE ZMENA: Okamžite presmeruje na domov
  };

  return (
    <header className="w-full bg-white flex flex-col sticky top-0 z-20 shadow-md">
      {/* --- HORNÝ PRUH --- */}
      <div className="bg-[#F9F8F6] border-b border-[#E8E6DF] px-6 py-2 flex justify-between items-center text-[11px] md:text-xs text-[#6B6E56] uppercase tracking-wider font-medium">
        <div className="hidden lg:flex space-x-4 items-center">
          <span>
            Zákaznícka podpora:{" "}
            <strong className="text-[#3D4035]">+421 905 572 393</strong> (8:00 -
            16:00)
          </span>
          <span>|</span>
          <a
            href="mailto:info@trefiwa.sk"
            className="hover:text-[#5C6B46] transition-colors duration-300"
          >
            info@trefiwa.sk
          </a>
        </div>
      </div>

      {/* --- HLAVNÁ ČASŤ (Logo, Vyhľadávanie, Ikonky) --- */}
      <div className="pl-4 md:pl-8 py-4 flex justify-between items-center max-w-7xl mx-auto w-full relative">
        {/* Logo a Nápis */}
        <div className="flex items-center gap-4 ">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity duration-300"
          >
            <img
              src="/produkty/logo-01.png"
              alt="TREFIWA Logo"
              className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>
          <Link
            href="/"
            className="text-4xl md:text-5xl font-bold tracking-widest text-[#5C6B46] hover:opacity-80 transition-opacity duration-300 ml-4 md:ml-6"
          >
            TREFIWA
          </Link>
        </div>

        {/* Pravá strana */}
        <div className="flex items-center space-x-4 md:space-x-6 text-[#3D4035]">
          <SearchBar />

          {/* DYNAMICKÁ ČASŤ: Ak je prihlásený -> Ukáž menu. Ak nie -> Ukáž Prihlásenie */}
          {user ? (
            <div className="relative group p-2 md:px-3 rounded-xl hover:bg-[#F2F1EC] transition-all duration-300 cursor-pointer">
              <div className="flex items-center space-x-3">
                {/* Iniciálka (Prvé písmeno mena) */}
                <div className="bg-[#8A9A5B] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-[#5C6B46] transition-colors">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="font-bold text-sm text-[#3D4035] group-hover:text-[#5C6B46] transition-colors">
                    {user.name}
                  </span>
                  <span className="text-xs text-[#8A9A5B] font-medium group-hover:text-[#5C6B46] transition-colors">
                    Môj účet
                  </span>
                </div>
              </div>

              {/* ROLETOVÉ MENU POUŽÍVATEĽA */}
              <div className="absolute right-0 top-full mt-2 w-64 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                <div className="bg-white text-[#3D4035] shadow-xl rounded-xl overflow-hidden flex flex-col border border-[#E8E6DF] font-medium">
                  {/* Hlavička dropdownu s emailom pre potvrdenie */}
                  <div className="px-5 py-3 bg-[#F9F8F6] border-b border-[#E8E6DF]">
                    <span className="block text-xs text-[#A3A697]">
                      Prihlásený ako:
                    </span>
                    <span className="block text-xs font-bold text-[#5C6B46] truncate">
                      {user.email}
                    </span>
                  </div>

                  <Link
                    href="/ucet/objednavky"
                    className="px-5 py-3.5 hover:bg-[#F2F1EC] hover:text-[#5C6B46] hover:pl-6 text-sm border-b border-[#E8E6DF] transition-all duration-300"
                  >
                    Objednávky
                  </Link>
                  <Link
                    href="/ucet/fakturacne-udaje"
                    className="px-5 py-3.5 hover:bg-[#F2F1EC] hover:text-[#5C6B46] hover:pl-6 text-sm border-b border-[#E8E6DF] transition-all duration-300"
                  >
                    Fakturačné údaje
                  </Link>
                  <Link
                    href="/ucet/dorucovacie-adresy"
                    className="px-5 py-3.5 hover:bg-[#F2F1EC] hover:text-[#5C6B46] hover:pl-6 text-sm border-b border-[#E8E6DF] transition-all duration-300"
                  >
                    Doručovacie adresy
                  </Link>
                  <Link
                    href="/ucet/nastavenia"
                    className="px-5 py-3.5 hover:bg-[#F2F1EC] hover:text-[#5C6B46] hover:pl-6 text-sm border-b border-[#E8E6DF] transition-all duration-300"
                  >
                    Nastavenia a bezpečnosť
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="px-5 py-3.5 text-left text-[#D84949] hover:bg-red-50 hover:pl-6 text-sm font-bold transition-all duration-300"
                  >
                    Odhlásiť sa
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center space-x-3 cursor-pointer p-2 md:px-3 rounded-xl hover:bg-[#F2F1EC] transition-all duration-300 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-[#3D4035] group-hover:text-[#5C6B46] transition-colors"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="font-bold text-sm text-[#3D4035] group-hover:text-[#5C6B46] transition-colors">
                  Prihlásenie
                </span>
                <span className="text-xs text-[#8A9A5B] font-medium group-hover:text-[#5C6B46] transition-colors">
                  Registrácia
                </span>
              </div>
            </div>
          )}

          {/* KOŠÍK */}
          <div
            onClick={openCart}
            className="flex items-center space-x-3 cursor-pointer p-2 md:px-3 rounded-xl hover:bg-[#F2F1EC] transition-all duration-300 group"
          >
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-[#3D4035] group-hover:text-[#5C6B46] transition-colors"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#D84949] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </div>
            <span className="hidden md:block font-bold text-sm text-[#3D4035] group-hover:text-[#5C6B46] transition-colors">
              Košík
            </span>
          </div>
        </div>
      </div>

      {/* --- SPODNÉ ZELENÉ MENU (Kategórie) --- */}
      <div className="bg-[#5C6B46] text-white">
        <nav className="max-w-7xl mx-auto px-6 flex flex-wrap gap-x-8 text-sm font-semibold uppercase tracking-widest items-center">
          <div className="relative group py-4">
            <span className="hover:text-[#D5D3C9] transition-colors duration-300 flex items-center gap-1.5 cursor-pointer">
              Čaje
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3 h-3 transform transition-transform duration-300 group-hover:-rotate-180"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
            <div className="absolute left-0 top-full w-56 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
              <div className="bg-white text-[#3D4035] shadow-xl rounded-b-lg overflow-hidden flex flex-col border border-[#E8E6DF] border-t-0 font-medium tracking-wide">
                <Link
                  href="/caje/cinske-caje"
                  className="px-5 py-3.5 hover:bg-[#F2F1EC] hover:text-[#5C6B46] hover:pl-6 text-xs border-b border-[#E8E6DF] transition-all duration-300"
                >
                  Čínske čaje
                </Link>
                <Link
                  href="/caje/anglicke-caje"
                  className="px-5 py-3.5 hover:bg-[#F2F1EC] hover:text-[#5C6B46] hover:pl-6 text-xs border-b border-[#E8E6DF] transition-all duration-300"
                >
                  Anglické čaje
                </Link>
                <Link
                  href="/caje/liecivky"
                  className="px-5 py-3.5 hover:bg-[#F2F1EC] hover:text-[#5C6B46] hover:pl-6 text-xs transition-all duration-300"
                >
                  Liečivky
                </Link>
              </div>
            </div>
          </div>

          <div className="relative group py-4">
            <Link
              href="/zdrave-potraviny"
              className="hover:text-[#D5D3C9] transition-colors duration-300 flex items-center gap-1.5"
            >
              Zdravé potraviny
            </Link>
          </div>

          <div className="relative group py-4">
            <Link
              href="/susene-ovocie"
              className="hover:text-[#D5D3C9] transition-colors duration-300 flex items-center gap-1"
            >
              Sušené ovocie
            </Link>
          </div>

          <div className="relative group py-4">
            <Link
              href="/doplnkovy-sortiment"
              className="hover:text-[#D5D3C9] transition-colors duration-300 flex items-center gap-1"
            >
              Doplnkový sortiment
            </Link>
          </div>

          <div className="relative group py-4">
            <Link
              href="/zvyhodnene-balicky"
              className="hover:text-[#D5D3C9] transition-colors duration-300 flex items-center gap-1"
            >
              Zvýhodnené balíčky
            </Link>
          </div>

          <div className="relative group py-4">
            <Link
              href="/eko-sortiment"
              className="hover:text-[#D5D3C9] transition-colors duration-300 flex items-center gap-1"
            >
              Eko sortiment
            </Link>
          </div>
        </nav>
      </div>

      <LoginModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}
