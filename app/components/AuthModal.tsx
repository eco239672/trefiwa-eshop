"use client";

import { useState } from "react";
import { registerUser } from "../authActions";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Pridali sme tretí stav pre zabudnuté heslo
type ViewState = "login" | "register" | "forgotPassword";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<ViewState>("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Funkcia pre úplné vyčistenie modalu pri zatvorení
  const handleClose = () => {
    setError("");
    setSuccess("");
    setView("login");
    onClose();
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    if (view === "login") {
      // TU NAPOJÍME PRIHLASOVANIE NESKÔR
      console.log("Pokus o prihlásenie...");
      setError("Prihlasovanie zatiaľ nie je plne napojené.");
      setIsLoading(false);
    } else if (view === "register") {
      // REGISTRÁCIA
      const result = await registerUser(formData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess("Registrácia bola úspešná! Teraz sa môžete prihlásiť.");
        setTimeout(() => setView("login"), 2000); 
      }
      setIsLoading(false);
    } else if (view === "forgotPassword") {
      // ZABUDNUTÉ HESLO (Zatiaľ simulácia)
      setTimeout(() => {
        setSuccess("Ak účet s týmto e-mailom existuje, poslali sme naň inštrukcie k obnove hesla.");
        setIsLoading(false);
      }, 1500);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Tmavé pozadie s rozmazaním (backdrop-blur) */}
      <div 
        className="absolute inset-0 bg-[#2C2E26]/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Samotné vyskakovacie okno - viac zaoblené a elegantnejšie */}
      <div className="bg-white w-full max-w-[440px] rounded-[24px] shadow-2xl relative z-10 animate-fade-in-up overflow-hidden border border-[#E8E6DF]">
        
        {/* Krásne Tlačidlo na zatvorenie (X) */}
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 text-[#A3A697] hover:text-[#3D4035] bg-[#F9F8F6] hover:bg-[#E8E6DF] p-2 rounded-full transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 pt-10">
          
          {/* HLAVIČKA - Mení sa podľa vybranej obrazovky */}
          {view === "forgotPassword" ? (
            <div className="mb-8 text-center">
              <div className="mx-auto bg-[#F2F1EC] text-[#8A9A5B] w-14 h-14 flex items-center justify-center rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#2C2E26]">Zabudnuté heslo</h2>
              <p className="text-sm text-[#6B6E56] mt-2 leading-relaxed">
                Zadajte svoj e-mail a my vám pošleme bezpečný odkaz na obnovenie hesla.
              </p>
            </div>
          ) : (
            // Moderný "Pill" prepínač pre Login / Registráciu
            <div className="flex gap-2 mb-8 bg-[#F9F8F6] p-1.5 rounded-xl">
              <button 
                onClick={() => { setView("login"); setError(""); setSuccess(""); }}
                className={`flex-1 text-sm font-bold py-2.5 rounded-lg transition-all duration-300 ${
                  view === "login" 
                    ? "bg-white text-[#5C6B46] shadow-sm" 
                    : "text-[#A3A697] hover:text-[#6B6E56]"
                }`}
              >
                Prihlásenie
              </button>
              <button 
                onClick={() => { setView("register"); setError(""); setSuccess(""); }}
                className={`flex-1 text-sm font-bold py-2.5 rounded-lg transition-all duration-300 ${
                  view === "register" 
                    ? "bg-white text-[#5C6B46] shadow-sm" 
                    : "text-[#A3A697] hover:text-[#6B6E56]"
                }`}
              >
                Nová registrácia
              </button>
            </div>
          )}

          {/* Vylepšené chybové a úspešné správy (s emojis) */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-start gap-2">
              <span className="text-lg leading-none">⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 border border-green-100 flex items-start gap-2">
              <span className="text-lg leading-none">✅</span> {success}
            </div>
          )}

          {/* Formulár */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pole pre meno sa ukáže iba pri registrácii */}
            {view === "register" && (
              <div>
                <label className="block text-[11px] font-bold text-[#6B6E56] uppercase tracking-wider mb-2 ml-1">Meno a priezvisko</label>
                <input 
                  name="name"
                  type="text" 
                  required 
                  className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#8A9A5B] focus:ring-2 focus:ring-[#8A9A5B]/20 transition-all text-[#3D4035] placeholder-[#A3A697]"
                  placeholder="Napr. Jozef Mak"
                />
              </div>
            )}
            
            <div>
              <label className="block text-[11px] font-bold text-[#6B6E56] uppercase tracking-wider mb-2 ml-1">E-mail</label>
              <input 
                name="email"
                type="email" 
                required 
                className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#8A9A5B] focus:ring-2 focus:ring-[#8A9A5B]/20 transition-all text-[#3D4035] placeholder-[#A3A697]"
                placeholder="vas@email.sk"
              />
            </div>
            
            {/* Pole pre heslo zmizne, ak sme v režime Zabudnuté heslo */}
            {view !== "forgotPassword" && (
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-[11px] font-bold text-[#6B6E56] uppercase tracking-wider">Heslo</label>
                  {/* Odkaz na zabudnuté heslo iba pri prihlasovaní */}
                  {view === "login" && (
                    <button 
                      type="button" 
                      onClick={() => { setView("forgotPassword"); setError(""); setSuccess(""); }}
                      className="text-[11px] font-bold text-[#8A9A5B] hover:text-[#5C6B46] transition-colors"
                    >
                      Zabudli ste heslo?
                    </button>
                  )}
                </div>
                <input 
                  name="password"
                  type="password" 
                  required 
                  minLength={6}
                  className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#8A9A5B] focus:ring-2 focus:ring-[#8A9A5B]/20 transition-all text-[#3D4035] placeholder-[#A3A697]"
                  placeholder="Minimálne 6 znakov"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#5C6B46] text-white font-bold text-sm py-4 rounded-xl hover:bg-[#4A5738] transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Spracovávam...</span>
                </>
              ) : (
                view === "login" ? "Prihlásiť sa" : view === "register" ? "Vytvoriť účet" : "Odoslať odkaz"
              )}
            </button>
          </form>

          {/* Tlačidlo späť zobrazené iba pri zabudnutom hesle */}
          {view === "forgotPassword" && (
            <button 
              onClick={() => { setView("login"); setError(""); setSuccess(""); }}
              className="w-full mt-6 text-sm font-semibold text-[#8A9A5B] hover:text-[#5C6B46] transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Späť na prihlásenie
            </button>
          )}

        </div>
      </div>
    </div>
  );
}