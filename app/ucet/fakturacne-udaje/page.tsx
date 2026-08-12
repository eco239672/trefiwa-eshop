"use client";

export default function FakturacneUdajePage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6DF] p-8 min-h-[500px]">
      <h1 className="text-3xl font-bold text-[#2C2E26] mb-2">Fakturačné údaje</h1>
      <p className="text-[#6B6E56] mb-8">Tieto údaje sa automaticky vyplnia pri vašej ďalšej objednávke.</p>

      <form className="max-w-xl space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Meno / Názov firmy</label>
            <input 
              type="text" 
              className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
              placeholder="Napr. Jozef Mak"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Telefón</label>
            <input 
              type="tel" 
              className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
              placeholder="+421 900 000 000"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Ulica a číslo popisné</label>
          <input 
            type="text" 
            className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
            placeholder="Napr. Hlavná 15"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Mesto</label>
            <input 
              type="text" 
              className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">PSČ</label>
            <input 
              type="text" 
              className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8E6DF] mt-6">
          <button className="bg-[#5C6B46] text-white px-6 py-3 rounded-xl hover:bg-[#4A5738] transition-colors font-bold text-sm shadow-sm">
            Uložiť zmeny
          </button>
        </div>
      </form>
    </div>
  );
}