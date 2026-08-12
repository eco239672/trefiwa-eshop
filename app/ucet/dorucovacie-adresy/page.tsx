export default function DorucovacieAdresyPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6DF] p-8 min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C2E26] mb-2">Doručovacie adresy</h1>
          <p className="text-[#6B6E56]">Uložte si adresy domov alebo do práce pre rýchlejší nákup.</p>
        </div>
        
        <button className="bg-[#F9F8F6] text-[#5C6B46] border border-[#D5D3C9] px-4 py-2.5 rounded-xl hover:bg-[#5C6B46] hover:text-white hover:border-[#5C6B46] transition-all font-bold text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Pridať novú adresu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ukážková uložená adresa */}
        <div className="border border-[#E8E6DF] rounded-xl p-6 relative group hover:border-[#8A9A5B] transition-colors">
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="text-[#8A9A5B] hover:text-[#5C6B46]" title="Upraviť">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.113l-3.4 1.132 1.132-3.4a4.5 4.5 0 011.113-1.89l3.4-3.4z" /></svg>
            </button>
            <button className="text-[#D84949] hover:text-red-700" title="Vymazať">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
          </div>
          
          <span className="bg-[#EFEFEA] text-[#6B6E56] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-3 inline-block">Predvolená</span>
          <h3 className="font-bold text-[#2C2E26] mb-1">Jozef Mak</h3>
          <p className="text-[#6B6E56] text-sm leading-relaxed">
            Hlavná 15<br />
            811 01 Bratislava<br />
            Slovensko
          </p>
          <p className="text-[#6B6E56] text-sm mt-3 font-medium">+421 900 000 000</p>
        </div>
      </div>
    </div>
  );
}