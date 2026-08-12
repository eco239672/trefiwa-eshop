"use client";

import { useState } from "react";
import { changePassword } from "../../userActions";

export default function NastaveniaPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 1. ULOŽÍME SI FORMULÁR DO PREMENNEJ HNEĎ NA ZAČIATKU
    const form = e.currentTarget; 
    
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    const data = new FormData(form);
    const result = await changePassword(data);

    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else if (result.success) {
      setMessage({ text: result.message, type: "success" });
      // 2. POUŽIJEME ULOŽENÚ PREMENNÚ NA RESETOVANIE
      form.reset(); 
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6DF] p-8 min-h-[500px]">
      <h1 className="text-3xl font-bold text-[#2C2E26] mb-2">Nastavenia a bezpečnosť</h1>
      <p className="text-[#6B6E56] mb-8">Spravujte svoje heslo a nastavenia vášho zákazníckeho účtu.</p>

      {message.text && (
        <div className={`p-4 rounded-xl max-w-md mb-6 text-sm flex gap-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
          {message.type === "success" ? "✅" : "⚠️"} {message.text}
        </div>
      )}

      <div className="max-w-md space-y-8">
        {/* Zmena hesla */}
        <section>
          <h2 className="text-lg font-bold text-[#2C2E26] mb-4 border-b border-[#E8E6DF] pb-2">Zmena hesla</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Súčasné heslo</label>
              <input 
                name="oldPassword"
                type="password" 
                required
                className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Nové heslo</label>
              <input 
                name="newPassword"
                type="password"
                required
                minLength={6} 
                className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-[#F9F8F6] text-[#5C6B46] border border-[#D5D3C9] px-6 py-2.5 rounded-xl hover:bg-[#5C6B46] hover:text-white hover:border-[#5C6B46] transition-all font-bold text-sm disabled:opacity-70"
            >
              {isSaving ? "Mení sa..." : "Zmeniť heslo"}
            </button>
          </form>
        </section>

        {/* Vymazanie účtu */}
        <section className="pt-6">
          <h2 className="text-lg font-bold text-[#D84949] mb-2 border-b border-[#E8E6DF] pb-2">Nebezpečná zóna</h2>
          <p className="text-sm text-[#6B6E56] mb-4 mt-2">Po zmazaní účtu budú trvalo odstránené všetky vaše údaje a história objednávok. Táto akcia je nevratná.</p>
          <button className="text-[#D84949] font-bold text-sm hover:underline">
            Natrvalo zmazať môj účet
          </button>
        </section>
      </div>
    </div>
  );
}