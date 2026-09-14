"use client";

import { useState, useEffect } from "react";
import { getAddresses, saveAddress, deleteAddress, setAddressAsDefault } from "../../userActions";

type Address = {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  phone: string | null;
  isDefault: boolean;
};

export default function DorucovacieAdresyPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stavy pre Vyskakovacie okno (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Načítanie adries zo servera
  const fetchAddresses = async () => {
    setIsLoading(true);
    const res = await getAddresses();
    if (res.success && res.addresses) {
      setAddresses(res.addresses);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    queueMicrotask(() => { void fetchAddresses(); });
  }, []);

  // Otvorenie modalu pre Pridanie / Úpravu
  const openModal = (address: Address | null = null) => {
    setEditingAddress(address);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  // Uloženie formulára vo vyskakovacom okne
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const addressId = editingAddress ? editingAddress.id : null;

    const res = await saveAddress(formData, addressId);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setIsModalOpen(false);
      fetchAddresses(); // Obnovíme zoznam adries
    }
    setIsSaving(false);
  };

  // Vymazanie
  const handleDelete = async (id: string) => {
    if (confirm("Naozaj chcete vymazať túto doručovaciu adresu?")) {
      const res = await deleteAddress(id);
      if (res.success) fetchAddresses();
    }
  };

  // Nastavenie ako predvolené
  const handleSetDefault = async (id: string) => {
    const res = await setAddressAsDefault(id);
    if (res.success) fetchAddresses();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6DF] p-8 min-h-[500px] relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C2E26] mb-2">Doručovacie adresy</h1>
          <p className="text-[#6B6E56]">Uložte si adresy domov alebo do práce pre rýchlejší nákup.</p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="bg-[#F9F8F6] text-[#5C6B46] border border-[#D5D3C9] px-4 py-2.5 rounded-xl hover:bg-[#5C6B46] hover:text-white hover:border-[#5C6B46] transition-all font-bold text-sm flex items-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Pridať novú adresu
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-[#A3A697] py-10">Načítavam adresy...</p>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-[#F9F8F6] rounded-xl border border-dashed border-[#D5D3C9]">
          <p className="text-[#6B6E56] font-medium">Zatiaľ nemáte uložené žiadne doručovacie adresy.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className={`border rounded-xl p-6 relative group transition-all ${address.isDefault ? 'border-[#8A9A5B] bg-[#F9F8F6]/50 shadow-sm' : 'border-[#E8E6DF] hover:border-[#A3A697]'}`}>
              
              {/* Tlačidlá Úpravy a Vymazania */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(address)} className="text-[#8A9A5B] hover:text-[#5C6B46] bg-white p-1 rounded-md shadow-sm border border-[#E8E6DF]" title="Upraviť">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.113l-3.4 1.132 1.132-3.4a4.5 4.5 0 011.113-1.89l3.4-3.4z" /></svg>
                </button>
                <button onClick={() => handleDelete(address.id)} className="text-[#D84949] hover:text-red-700 bg-white p-1 rounded-md shadow-sm border border-[#E8E6DF]" title="Vymazať">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
              
              {address.isDefault ? (
                <span className="bg-[#EFEFEA] text-[#6B6E56] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-3 inline-block border border-[#D5D3C9]">Predvolená</span>
              ) : (
                <button onClick={() => handleSetDefault(address.id)} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-3 inline-block text-[#A3A697] border border-[#E8E6DF] hover:bg-[#F9F8F6] transition-colors">
                  Nastaviť ako predvolenú
                </button>
              )}
              
              <h3 className="font-bold text-[#2C2E26] mb-1">{address.name}</h3>
              <p className="text-[#6B6E56] text-sm leading-relaxed">
                {address.street}<br />
                {address.zip} {address.city}<br />
                Slovensko
              </p>
              {address.phone && <p className="text-[#6B6E56] text-sm mt-3 font-medium">{address.phone}</p>}
            </div>
          ))}
        </div>
      )}

      {/* --- VYSKAKOVACIE OKNO PRE PRIDANIE / ÚPRAVU ADRESY --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2E26]/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative animate-fade-in-up border border-[#E8E6DF] p-8">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#A3A697] hover:text-[#3D4035] bg-[#F9F8F6] hover:bg-[#E8E6DF] p-2 rounded-full transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 className="text-2xl font-bold text-[#2C2E26] mb-6">
              {editingAddress ? "Úprava adresy" : "Nová adresa"}
            </h2>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">
                {errorMsg}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Názov adresy / Meno a priezvisko</label>
                <input 
                  name="name"
                  defaultValue={editingAddress?.name || ""}
                  type="text" 
                  required
                  className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors"
                  placeholder="Napr. Práca, Domov alebo Jozef Mak"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Ulica a číslo popisné</label>
                <input 
                  name="street"
                  defaultValue={editingAddress?.street || ""}
                  type="text" 
                  required
                  className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Mesto</label>
                  <input 
                    name="city"
                    defaultValue={editingAddress?.city || ""}
                    type="text" 
                    required
                    className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">PSČ</label>
                  <input 
                    name="zip"
                    defaultValue={editingAddress?.zip || ""}
                    type="text" 
                    required
                    className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Telefón (voliteľné)</label>
                <input 
                  name="phone"
                  defaultValue={editingAddress?.phone || ""}
                  type="tel" 
                  className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors"
                  placeholder="+421..."
                />
              </div>

              <div className="pt-4 border-t border-[#E8E6DF] mt-6 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl font-bold text-[#6B6E56] hover:bg-[#F9F8F6] transition-colors"
                >
                  Zrušiť
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-[#5C6B46] text-white px-6 py-3 rounded-xl hover:bg-[#4A5738] transition-colors font-bold shadow-sm disabled:opacity-70"
                >
                  {isSaving ? "Ukladám..." : "Uložiť adresu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
