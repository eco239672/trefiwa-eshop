"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import LoginModal from "./AuthModal";
import { getSession, logoutUser } from "../authActions";

type User = {
  id: string;
  name: string;
  email: string;
} | null;

export default function Header() {
  const { openCart, cart } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User>(null);

  // Stavy pre mobilné menu a jeho podkategórie
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileCategories, setOpenMobileCategories] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    getSession().then((userData) => {
      if (userData) {
        setUser(userData);
      }
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    window.location.href = "/";
  };

  // Pomocná funkcia na rozbaľovanie kategórií v mobilnom menu
  const toggleMobileCategory = (category: string) => {
    setOpenMobileCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <header className="w-full bg-white flex flex-col sticky top-0 z-20 shadow-md">
      {/* --- HORNÝ PRUH --- */}
      <div className="bg-[#F9F8F6] border-b border-[#E8E6DF] px-6 py-2 flex items-center text-[11px] md:text-xs text-[#6B6E56] uppercase tracking-wider font-medium">
        {/* ZMENA: justify-end namiesto justify-between pre zarovnanie doprava */}
        <div className="hidden lg:flex space-x-4 items-center w-full justify-end max-w-7xl mx-auto">
          <div className="flex items-center">
            <span>
              Zákaznícka podpora:{" "}
              <strong className="text-[#3D4035]">+421 905 572 393</strong> (8:00
              - 16:00)
            </span>
            <span className="mx-4">|</span>
            <a
              href="mailto:info@trefiwa.sk"
              className="hover:text-[#5C6B46] transition-colors duration-300"
            >
              info@trefiwa.sk
            </a>
          </div>
        </div>
      </div>

      {/* --- HLAVNÁ ČASŤ (Logo, Vyhľadávanie, Ikonky) --- */}
      {/* Grid s 3 stĺpcami zaisťuje, že stred bude VŽDY na stred */}
      <div className="px-4 md:px-8 py-4 grid grid-cols-3 items-center max-w-7xl mx-auto w-full relative">
        {/* 1. ĽAVÁ STRANA (Hamburger ikona + LOGO) */}
        <div className="flex items-center justify-start gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-[#3D4035] hover:text-[#5C6B46] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity duration-300"
          >
            <img
              src="/produkty/logo-01.png"
              alt="TREFIWA Logo"
              className="h-14 md:h-16 lg:h-20 w-auto object-contain"
            />
          </Link>
        </div>

        {/* 2. STRED (Iba nápis TREFIWA - Biele písmo s čiernym okrajom) */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-widest text-white hover:opacity-80 transition-opacity duration-300 hidden sm:block"
            style={{
              WebkitTextStroke: "1.5px black",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            TREFIWA
          </Link>
        </div>

        {/* 3. PRAVÁ STRANA (Vyhľadávanie, Užívateľ, Košík) */}
        <div className="flex items-center justify-end space-x-2 md:space-x-6 text-[#3D4035]">
          <SearchBar />

          {user ? (
            <div className="relative group p-2 md:px-3 rounded-xl hover:bg-[#F2F1EC] transition-all duration-300 cursor-pointer hidden md:block">
              <div className="flex items-center space-x-3">
                <div className="bg-[#8A9A5B] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-[#5C6B46] transition-colors">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="font-bold text-sm text-[#3D4035] group-hover:text-[#5C6B46] transition-colors">
                    {user.name}
                  </span>
                  <span className="text-xs text-[#8A9A5B] font-medium group-hover:text-[#5C6B46] transition-colors">
                    Môj účet
                  </span>
                </div>
              </div>

              <div className="absolute right-0 top-full mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="bg-white text-[#3D4035] shadow-xl rounded-xl overflow-hidden flex flex-col border border-[#E8E6DF]">
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
                    className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                  >
                    Objednávky
                  </Link>
                  <Link
                    href="/ucet/fakturacne-udaje"
                    className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                  >
                    Fakturačné údaje
                  </Link>
                  <Link
                    href="/ucet/dorucovacie-adresy"
                    className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                  >
                    Doručovacie adresy
                  </Link>
                  <Link
                    href="/ucet/nastavenia"
                    className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                  >
                    Nastavenia a bezpečnosť
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-3 text-left text-[#D84949] hover:bg-red-50 transition-colors font-bold"
                  >
                    Odhlásiť sa
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsAuthOpen(true)}
              className="items-center space-x-3 cursor-pointer p-2 md:px-3 rounded-xl hover:bg-[#F2F1EC] transition-all hidden md:flex"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-[#3D4035] hover:text-[#5C6B46]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <div className="hidden lg:flex flex-col text-left leading-tight">
                <span className="font-bold text-sm text-[#3D4035]">
                  Prihlásenie
                </span>
                <span className="text-xs text-[#8A9A5B] font-medium">
                  Registrácia
                </span>
              </div>
            </div>
          )}

          {/* KOŠÍK */}
          <div
            onClick={openCart}
            className="flex items-center space-x-3 cursor-pointer p-2 md:px-3 rounded-xl hover:bg-[#F2F1EC] transition-all group"
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

      {/* --- SPODNÉ ZELENÉ MENU PRE PC --- */}
      <div className="hidden md:block bg-[#5C6B46] text-white">
        <nav className="max-w-7xl mx-auto px-6 flex flex-wrap gap-x-8 text-sm font-semibold uppercase tracking-widest items-center justify-center">
          <div className="relative group py-4">
            <span className="hover:text-[#D5D3C9] flex items-center gap-1.5 cursor-pointer transition-colors">
              Čaje
            </span>
            <div className="absolute left-0 top-full w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="bg-white text-[#3D4035] shadow-xl rounded-b-lg flex flex-col border border-[#E8E6DF] border-t-0 font-medium tracking-wide">
                <Link
                  href="/caje/cinske-caje"
                  className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                >
                  Čínske čaje
                </Link>
                <Link
                  href="/caje/anglicke-caje"
                  className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                >
                  Anglické čaje
                </Link>
                <Link
                  href="/caje/liecivky"
                  className="px-5 py-3 hover:bg-[#F2F1EC] transition-colors"
                >
                  Liečivky
                </Link>
              </div>
            </div>
          </div>

          <div className="relative group py-4">
            <span className="hover:text-[#D5D3C9] flex items-center gap-1.5 cursor-pointer transition-colors">
              Zdravé potraviny
            </span>
            <div className="absolute left-0 top-full w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="bg-white text-[#3D4035] shadow-xl rounded-b-lg flex flex-col border border-[#E8E6DF] border-t-0 font-medium tracking-wide">
                <Link
                  href="/zdrave-potraviny/orechy-a-semienka"
                  className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                >
                  Orechy a semienka
                </Link>
                <Link
                  href="/zdrave-potraviny/sladidla"
                  className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                >
                  Med a sladidlá
                </Link>
                <Link
                  href="/zdrave-potraviny/kase"
                  className="px-5 py-3 hover:bg-[#F2F1EC] transition-colors"
                >
                  Raňajkové kaše
                </Link>
              </div>
            </div>
          </div>

          <div className="relative group py-4">
            <Link
              href="/susene-ovocie"
              className="hover:text-[#D5D3C9] flex items-center gap-1 transition-colors"
            >
              Sušené ovocie
            </Link>
          </div>

          <div className="relative group py-4">
            <span className="hover:text-[#D5D3C9] flex items-center gap-1.5 cursor-pointer transition-colors">
              Doplnkový sortiment
            </span>
            <div className="absolute left-0 top-full w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="bg-white text-[#3D4035] shadow-xl rounded-b-lg flex flex-col border border-[#E8E6DF] border-t-0 font-medium tracking-wide">
                <Link
                  href="/doplnkovy-sortiment/sitka"
                  className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                >
                  Sitká a filtre
                </Link>
                <Link
                  href="/doplnkovy-sortiment/dozy"
                  className="px-5 py-3 hover:bg-[#F2F1EC] transition-colors"
                >
                  Dózy na čaj
                </Link>
              </div>
            </div>
          </div>

          <div className="relative group py-4">
            <span className="hover:text-[#D5D3C9] flex items-center gap-1.5 cursor-pointer transition-colors">
              Zvýhodnené balíčky
            </span>
            <div className="absolute left-0 top-full w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="bg-white text-[#3D4035] shadow-xl rounded-b-lg flex flex-col border border-[#E8E6DF] border-t-0 font-medium tracking-wide">
                <Link
                  href="/zvyhodnene-balicky/darcekove"
                  className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                >
                  Darčekové sady
                </Link>
                <Link
                  href="/zvyhodnene-balicky/degustacne"
                  className="px-5 py-3 hover:bg-[#F2F1EC] transition-colors"
                >
                  Degustačné balíčky
                </Link>
              </div>
            </div>
          </div>

          <div className="relative group py-4">
            <span className="hover:text-[#D5D3C9] flex items-center gap-1.5 cursor-pointer transition-colors">
              Eko sortiment
            </span>
            <div className="absolute left-0 top-full w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="bg-white text-[#3D4035] shadow-xl rounded-b-lg flex flex-col border border-[#E8E6DF] border-t-0 font-medium tracking-wide">
                <Link
                  href="/eko-sortiment/slamky"
                  className="px-5 py-3 hover:bg-[#F2F1EC] border-b border-[#E8E6DF] transition-colors"
                >
                  Znovupoužiteľné slamky
                </Link>
                <Link
                  href="/eko-sortiment/tasky"
                  className="px-5 py-3 hover:bg-[#F2F1EC] transition-colors"
                >
                  Eko tašky
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* --- MOBILNÉ BOČNÉ MENU --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <div className="relative w-[80%] max-w-sm h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-[#E8E6DF] flex justify-between items-center bg-[#F9F8F6]">
              <span className="font-bold tracking-widest text-[#5C6B46] text-xl">
                MENU
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#3D4035] bg-[#E8E6DF] rounded-full hover:bg-[#D5D3C9] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col font-semibold text-[#3D4035]">
              {/* Čaje */}
              <div className="border-b border-[#E8E6DF] py-4">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleMobileCategory("caje")}
                >
                  <span className="hover:text-[#5C6B46]">Čaje</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform ${openMobileCategories["caje"] ? "rotate-180" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
                {openMobileCategories["caje"] && (
                  <div className="flex flex-col gap-3 mt-4 pl-4 text-sm font-medium text-[#6B6E56]">
                    <Link
                      href="/caje/cinske-caje"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Čínske čaje
                    </Link>
                    <Link
                      href="/caje/anglicke-caje"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Anglické čaje
                    </Link>
                    <Link
                      href="/caje/liecivky"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Liečivky
                    </Link>
                  </div>
                )}
              </div>

              {/* Zdravé potraviny */}
              <div className="border-b border-[#E8E6DF] py-4">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleMobileCategory("potraviny")}
                >
                  <span className="hover:text-[#5C6B46]">Zdravé potraviny</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform ${openMobileCategories["potraviny"] ? "rotate-180" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
                {openMobileCategories["potraviny"] && (
                  <div className="flex flex-col gap-3 mt-4 pl-4 text-sm font-medium text-[#6B6E56]">
                    <Link
                      href="/zdrave-potraviny/orechy-a-semienka"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Orechy a semienka
                    </Link>
                    <Link
                      href="/zdrave-potraviny/sladidla"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Med a sladidlá
                    </Link>
                    <Link
                      href="/zdrave-potraviny/kase"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Raňajkové kaše
                    </Link>
                  </div>
                )}
              </div>

              {/* Sušené ovocie */}
              <Link
                href="/susene-ovocie"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-4 border-b border-[#E8E6DF] hover:text-[#5C6B46]"
              >
                Sušené ovocie
              </Link>

              {/* Doplnkový sortiment */}
              <div className="border-b border-[#E8E6DF] py-4">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleMobileCategory("doplnky")}
                >
                  <span className="hover:text-[#5C6B46]">
                    Doplnkový sortiment
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform ${openMobileCategories["doplnky"] ? "rotate-180" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
                {openMobileCategories["doplnky"] && (
                  <div className="flex flex-col gap-3 mt-4 pl-4 text-sm font-medium text-[#6B6E56]">
                    <Link
                      href="/doplnkovy-sortiment/sitka"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sitká a filtre
                    </Link>
                    <Link
                      href="/doplnkovy-sortiment/dozy"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dózy na čaj
                    </Link>
                  </div>
                )}
              </div>

              {/* Zvýhodnené balíčky */}
              <div className="border-b border-[#E8E6DF] py-4">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleMobileCategory("balicky")}
                >
                  <span className="hover:text-[#5C6B46]">
                    Zvýhodnené balíčky
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform ${openMobileCategories["balicky"] ? "rotate-180" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
                {openMobileCategories["balicky"] && (
                  <div className="flex flex-col gap-3 mt-4 pl-4 text-sm font-medium text-[#6B6E56]">
                    <Link
                      href="/zvyhodnene-balicky/darcekove"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Darčekové sady
                    </Link>
                    <Link
                      href="/zvyhodnene-balicky/degustacne"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Degustačné balíčky
                    </Link>
                  </div>
                )}
              </div>

              {/* Eko sortiment */}
              <div className="border-b border-[#E8E6DF] py-4">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleMobileCategory("eko")}
                >
                  <span className="hover:text-[#5C6B46]">Eko sortiment</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform ${openMobileCategories["eko"] ? "rotate-180" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
                {openMobileCategories["eko"] && (
                  <div className="flex flex-col gap-3 mt-4 pl-4 text-sm font-medium text-[#6B6E56]">
                    <Link
                      href="/eko-sortiment/slamky"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Znovupoužiteľné slamky
                    </Link>
                    <Link
                      href="/eko-sortiment/tasky"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Eko tašky
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-[#5C6B46]">
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#D84949] text-white py-3 rounded-lg text-center hover:bg-red-700 transition-colors"
                  >
                    Odhlásiť sa
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#5C6B46] text-white py-3 rounded-lg text-center hover:bg-[#4A5738] transition-colors"
                  >
                    Prihlásenie / Registrácia
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}
