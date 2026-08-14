"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "../authActions";
import { getUserProfile } from "../userActions";
import { useEffect, useState } from "react";

export default function UcetLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [points, setPoints] = useState<number | null>(null);

  // Po načítaní layoutu si stiahneme profil, aby sme zistili stav bodov
  useEffect(() => {
    getUserProfile().then((res) => {
      if (res.success && res.user) {
        setPoints(res.user.points);
      }
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  const isActive = (path: string) => pathname === path;

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035] flex flex-col py-10 px-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8">
        
        {/* --- BOČNÉ MENU --- */}
        <aside className="w-full md:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6DF] p-6 sticky top-32">
            
            {/* Vylepšená hlavička s bodmi */}
            <div className="flex justify-between items-center mb-6 border-b border-[#E8E6DF] pb-4">
              <h2 className="text-xl font-bold text-[#2C2E26]">
                Môj účet
              </h2>
              {points !== null && (
                <div 
                  className="bg-[#F2F1EC] text-[#5C6B46] px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 border border-[#D5D3C9] shadow-sm cursor-help"
                  title={`${points} vernostných bodov = zľava ${(points / 100).toFixed(2)} €`}
                >
                  <span>{points}</span>
                  <span className="text-base leading-none">🍃</span>
                </div>
              )}
            </div>
            
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/ucet/objednavky" 
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/ucet/objednavky') ? 'bg-[#F2F1EC] text-[#5C6B46]' : 'text-[#6B6E56] hover:bg-[#F9F8F6] hover:text-[#5C6B46]'}`}
              >
                Objednávky
              </Link>
              <Link 
                href="/ucet/fakturacne-udaje" 
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/ucet/fakturacne-udaje') ? 'bg-[#F2F1EC] text-[#5C6B46]' : 'text-[#6B6E56] hover:bg-[#F9F8F6] hover:text-[#5C6B46]'}`}
              >
                Fakturačné údaje
              </Link>
              <Link 
                href="/ucet/dorucovacie-adresy" 
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/ucet/dorucovacie-adresy') ? 'bg-[#F2F1EC] text-[#5C6B46]' : 'text-[#6B6E56] hover:bg-[#F9F8F6] hover:text-[#5C6B46]'}`}
              >
                Doručovacie adresy
              </Link>
              <Link 
                href="/ucet/nastavenia" 
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/ucet/nastavenia') ? 'bg-[#F2F1EC] text-[#5C6B46]' : 'text-[#6B6E56] hover:bg-[#F9F8F6] hover:text-[#5C6B46]'}`}
              >
                Nastavenia a bezpečnosť
              </Link>
              
              <div className="pt-4 mt-4 border-t border-[#E8E6DF]">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl font-bold text-[#D84949] hover:bg-red-50 transition-colors"
                >
                  Odhlásiť sa
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* --- HLAVNÝ OBSAH --- */}
        <div className="w-full md:w-3/4">
          {children}
        </div>

      </div>
    </main>
  );
}