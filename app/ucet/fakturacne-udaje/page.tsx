"use client";

import { useState, useEffect } from "react";
import { getUserProfile, saveBillingDetails } from "../../userActions";

export default function FakturacneUdajePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Stavy pre formulár
  const [formData, setFormData] = useState({
    company: "",
    phone: "",
    street: "",
    city: "",
    zip: "",
  });

  // Načítanie existujúcich údajov pri otvorení stránky
  useEffect(() => {
    getUserProfile().then((res) => {
      if (res.success && res.user) {
        setFormData({
          company: res.user.company || "",
          phone: res.user.phone || "",
          street: res.user.street || "",
          city: res.user.city || "",
          zip: res.user.zip || "",
        });
      }
      setIsLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    const data = new FormData(e.currentTarget);
    const result = await saveBillingDetails(data);

    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else if (result.success) {
      setMessage({ text: result.message, type: "success" });
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="p-8 text-center text-[#A3A697]">Načítavam údaje...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6DF] p-8 min-h-[500px]">
      <h1 className="text-3xl font-bold text-[#2C2E26] mb-2">Fakturačné údaje</h1>
      <p className="text-[#6B6E56] mb-6">Tieto údaje sa automaticky vyplnia pri vašej ďalšej objednávke.</p>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm flex gap-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
          {message.type === "success" ? "✅" : "⚠️"} {message.text}
        </div>
      )}

      <form className="max-w-xl space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Meno / Názov firmy</label>
            <input 
              name="company"
              value={formData.company}
              onChange={handleChange}
              type="text" 
              className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
              placeholder="Napr. Jozef Mak"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Telefón</label>
            <input 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel" 
              className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
              placeholder="+421 900 000 000"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Ulica a číslo popisné</label>
          <input 
            name="street"
            value={formData.street}
            onChange={handleChange}
            type="text" 
            className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
            placeholder="Napr. Hlavná 15"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">Mesto</label>
            <input 
              name="city"
              value={formData.city}
              onChange={handleChange}
              type="text" 
              className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6B6E56] uppercase tracking-wider mb-2">PSČ</label>
            <input 
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              type="text" 
              className="w-full bg-[#F9F8F6] border border-[#E8E6DF] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8A9A5B] transition-colors text-[#3D4035]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8E6DF] mt-6">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-[#5C6B46] text-white px-6 py-3 rounded-xl hover:bg-[#4A5738] transition-colors font-bold text-sm shadow-sm disabled:opacity-70"
          >
            {isSaving ? "Ukladám..." : "Uložiť zmeny"}
          </button>
        </div>
      </form>
    </div>
  );
}