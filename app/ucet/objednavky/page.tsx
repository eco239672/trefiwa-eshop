// app/ucet/objednavky/page.tsx
export default function ObjednavkyPage() {
  // Zatiaľ simulujeme prázdny stav (žiadne objednávky)
  const objednavky = []; 

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6DF] p-8 min-h-[500px]">
      <h1 className="text-3xl font-bold text-[#2C2E26] mb-2">Moje objednávky</h1>
      <p className="text-[#6B6E56] mb-8">Tu nájdete prehľad všetkých vašich predchádzajúcich aj aktuálnych nákupov.</p>

      {objednavky.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-[#F9F8F6] rounded-xl border border-dashed border-[#D5D3C9]">
          <div className="bg-[#EFEFEA] text-[#A3A697] w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#3D4035] mb-2">Zatiaľ nemáte žiadne objednávky</h3>
          <p className="text-[#6B6E56] max-w-md">Akonáhle si u nás niečo zakúpite, zoznam vašich objednávok a faktúr nájdete presne tu.</p>
        </div>
      ) : (
        // Tu neskôr vypíšeme reálne objednávky z databázy
        <div>Zoznam objednávok sa pripravuje...</div>
      )}
    </div>
  );
}