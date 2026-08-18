"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession } from "../authActions";

// Definícia typov
type User = { id: string; name: string; email: string; points?: number } | null;

const COUNTRIES = ["Slovensko", "Česko", "Poľsko", "Maďarsko", "Rakúsko"];

const DELIVERY_OPTIONS: Record<
  string,
  { id: string; name: string; price: number; time: string }[]
> = {
  Slovensko: [
    {
      id: "sk_packeta",
      name: "Packeta - Výdajné miesto",
      price: 3.9,
      time: "1-2 dni",
    },
    {
      id: "sk_kurier",
      name: "Kuriér na adresu (DPD)",
      price: 4.9,
      time: "1-2 dni",
    },
  ],
  Česko: [
    { id: "cz_packeta", name: "Zásilkovna", price: 4.9, time: "2-3 dni" },
    { id: "cz_kurier", name: "Kuriér ČR", price: 6.5, time: "2-3 dni" },
  ],
  Poľsko: [
    { id: "pl_kurier", name: "Kuriér InPost", price: 7.5, time: "2-4 dni" },
  ],
  Maďarsko: [
    { id: "hu_kurier", name: "Kuriér GLS", price: 7.5, time: "2-4 dni" },
  ],
  Rakúsko: [
    {
      id: "at_kurier",
      name: "Kuriér Österreichische Post",
      price: 8.9,
      time: "2-4 dni",
    },
  ],
};

// ZATIAĽ STATICKÉ (MOCK) ADRESY (Neskôr toto napojíme na databázu)
const MOCK_SAVED_ADDRESSES = [
  {
    id: 1,
    label: "Domov (Bratislava)",
    firstName: "Simon",
    lastName: "Sedlár",
    address: "Obchodná 10",
    city: "Bratislava",
    country: "Slovensko",
    phone: "+421905572393",
  },
  {
    id: 2,
    label: "Univerzita (Olomouc)",
    firstName: "Simon",
    lastName: "Sedlár",
    address: "Křížkovského 8",
    city: "Olomouc",
    country: "Česko",
    phone: "+421905572393",
  },
];

export default function CheckoutPage() {
  const { cart, cartTotal, updateQuantity } = useCart();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User>(null);

  // Formulár a stavy doručenia/platby
  const [selectedCountry, setSelectedCountry] = useState("Slovensko");
  const [selectedDelivery, setSelectedDelivery] = useState(
    DELIVERY_OPTIONS["Slovensko"][0].id,
  );
  const [selectedPayment, setSelectedPayment] = useState("card");

  // Zľavy a body
  const [pointsUsed, setPointsUsed] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // Hodnoty pre formulár
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    email: "",
    phone: "",
  });

  // Hydratácia a načítanie usera
  // Hydratácia a načítanie usera
  useEffect(() => {
    setMounted(true);
    getSession().then((userData: any) => {
      if (userData) {
        // Teraz to potiahne skutočné body (userData.points).
        // Ak používateľ ešte žiadne body v DB nemá (alebo je tam null), dostane 0 bodov.
        const userPoints = userData.points || 0;

        setUser({ ...userData, points: userPoints });
        setFormData((prev) => ({ ...prev, email: userData.email }));
      }
    });
  }, []);

  // Keď zmeníme štát, automaticky vyberieme prvú možnosť doručenia pre daný štát
  useEffect(() => {
    if (DELIVERY_OPTIONS[selectedCountry]) {
      setSelectedDelivery(DELIVERY_OPTIONS[selectedCountry][0].id);
    }
  }, [selectedCountry]);

  if (!mounted) return null;

  // --- VÝPOČTY ---
  const currentDeliveryOption = DELIVERY_OPTIONS[selectedCountry]?.find(
    (d) => d.id === selectedDelivery,
  );
  const shippingCost = currentDeliveryOption?.price || 0;

  const pointsDiscount = pointsUsed / 100;
  const couponDiscount = isCouponApplied ? 5.0 : 0;

  const finalTotal = Math.max(
    0,
    cartTotal + shippingCost - pointsDiscount - couponDiscount,
  );

  // Funkcia na aplikovanie uloženej adresy do formulára
  const applySavedAddress = (addr: any) => {
    setFormData({
      firstName: addr.firstName,
      lastName: addr.lastName,
      address: addr.address,
      city: addr.city,
      email: user?.email || "",
      phone: addr.phone,
    });
    setSelectedCountry(addr.country); // Zmení aj štát, čím sa prepočítajú aj spôsoby doručenia!
  };

  return (
    <main className="min-h-screen bg-[#F9F8F6] py-12 text-[#3D4035]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold text-[#2C2E26] mb-8">
          Bezpečná pokladňa
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-[#E8E6DF] text-center">
            <h2 className="text-xl font-bold mb-4">Váš košík je prázdny</h2>
            <Link
              href="/"
              className="inline-block bg-[#5C6B46] text-white px-8 py-3 rounded-md font-bold uppercase hover:bg-[#4A5738] transition-colors"
            >
              Späť do obchodu
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ĽAVÝ STĹPEC - FORMULÁRE */}
            <div className="flex-1 space-y-6">
              {/* 1. Doručovacie údaje */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8E6DF]">
                {/* HLAVIČKA S TLAČIDLOM PRE ULOŽENÉ ADRESY */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-bold text-[#2C2E26]">
                    Doručovacie údaje
                  </h2>

                  {user && MOCK_SAVED_ADDRESSES.length > 0 && (
                    <div className="relative group">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-sm text-[#5C6B46] bg-[#F2F1EC] px-4 py-2 rounded-lg font-bold hover:bg-[#E8E6DF] transition-colors border border-[#5C6B46]/20"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                        Moje adresy
                      </button>

                      {/* Vyskakovacie menu uložených adries */}
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E8E6DF] shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                        <div className="p-3 bg-[#F9F8F6] border-b border-[#E8E6DF] text-xs font-bold text-[#8A9A5B] uppercase tracking-wider">
                          Vyberte adresu
                        </div>
                        {MOCK_SAVED_ADDRESSES.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => applySavedAddress(addr)}
                            className="p-4 hover:bg-[#F2F1EC] cursor-pointer border-b border-[#E8E6DF] last:border-0 transition-colors"
                          >
                            <p className="font-bold text-[#3D4035] mb-1">
                              {addr.label}
                            </p>
                            <p className="text-[#8A9A5B] text-xs leading-relaxed">
                              {addr.firstName} {addr.lastName}
                              <br />
                              {addr.address}, {addr.city}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* FORMULÁR */}
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8A9A5B] uppercase mb-1">
                        Meno
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full border border-[#E8E6DF] p-3 rounded-lg focus:outline-none focus:border-[#5C6B46] bg-white transition-colors"
                        placeholder="Vaše meno"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8A9A5B] uppercase mb-1">
                        Priezvisko
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full border border-[#E8E6DF] p-3 rounded-lg focus:outline-none focus:border-[#5C6B46] bg-white transition-colors"
                        placeholder="Vaše priezvisko"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8A9A5B] uppercase mb-1">
                      Ulica a číslo popisné
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full border border-[#E8E6DF] p-3 rounded-lg focus:outline-none focus:border-[#5C6B46] bg-white transition-colors"
                      placeholder="Ulica 123"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8A9A5B] uppercase mb-1">
                        Mesto
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full border border-[#E8E6DF] p-3 rounded-lg focus:outline-none focus:border-[#5C6B46] bg-white transition-colors"
                        placeholder="Napr. Bratislava"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8A9A5B] uppercase mb-1">
                        Krajina
                      </label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full border border-[#E8E6DF] p-3 rounded-lg focus:outline-none focus:border-[#5C6B46] bg-white transition-colors"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8A9A5B] uppercase mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full border border-[#E8E6DF] p-3 rounded-lg focus:outline-none focus:border-[#5C6B46] bg-white transition-colors"
                        placeholder="vas@email.sk"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8A9A5B] uppercase mb-1">
                        Telefón
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full border border-[#E8E6DF] p-3 rounded-lg focus:outline-none focus:border-[#5C6B46] bg-white transition-colors"
                        placeholder="+421 900 000 000"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* 2. Spôsob doručenia */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8E6DF]">
                <h2 className="text-xl font-bold text-[#2C2E26] mb-4">
                  Spôsob doručenia
                </h2>
                <div className="space-y-3">
                  {DELIVERY_OPTIONS[selectedCountry]?.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedDelivery(method.id)}
                      className={`group flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedDelivery === method.id
                          ? "border-[#5C6B46] bg-[#F2F1EC]"
                          : "border-[#E8E6DF] hover:border-[#8A9A5B]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedDelivery === method.id ? "border-[#5C6B46]" : "border-[#A3A697] group-hover:border-[#8A9A5B]"}`}
                        >
                          {selectedDelivery === method.id && (
                            <div className="w-2.5 h-2.5 bg-[#5C6B46] rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#3D4035]">
                            {method.name}
                          </p>
                          <p className="text-xs text-[#8A9A5B]">
                            {method.time}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#3D4035]">
                        {method.price.toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Spôsob platby */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8E6DF]">
                <h2 className="text-xl font-bold text-[#2C2E26] mb-4">
                  Spôsob platby
                </h2>
                <div className="space-y-3">
                  {/* PLATBA KARTOU */}
                  <div
                    onClick={() => setSelectedPayment("card")}
                    className={`group flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedPayment === "card"
                        ? "border-[#5C6B46] bg-[#F2F1EC]"
                        : "border-[#E8E6DF] hover:border-[#8A9A5B]"
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPayment === "card" ? "border-[#5C6B46]" : "border-[#A3A697] group-hover:border-[#8A9A5B]"}`}
                      >
                        {selectedPayment === "card" && (
                          <div className="w-2.5 h-2.5 bg-[#5C6B46] rounded-full"></div>
                        )}
                      </div>

                      <div
                        className={`p-2 rounded-lg transition-all duration-300 transform group-hover:scale-110 ${selectedPayment === "card" ? "bg-[#5C6B46]/10 text-[#5C6B46]" : "bg-[#F9F8F6] text-[#A3A697]"}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-7 h-7"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="font-bold text-[#3D4035]">
                          Platba kartou online
                        </p>
                        <p className="text-xs text-[#8A9A5B]">
                          Rýchla a bezpečná platba
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BANKOVÝ PREVOD */}
                  <div
                    onClick={() => setSelectedPayment("bank")}
                    className={`group flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedPayment === "bank"
                        ? "border-[#5C6B46] bg-[#F2F1EC]"
                        : "border-[#E8E6DF] hover:border-[#8A9A5B]"
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPayment === "bank" ? "border-[#5C6B46]" : "border-[#A3A697] group-hover:border-[#8A9A5B]"}`}
                      >
                        {selectedPayment === "bank" && (
                          <div className="w-2.5 h-2.5 bg-[#5C6B46] rounded-full"></div>
                        )}
                      </div>

                      <div
                        className={`p-2 rounded-lg transition-all duration-300 transform group-hover:scale-110 ${selectedPayment === "bank" ? "bg-[#5C6B46]/10 text-[#5C6B46]" : "bg-[#F9F8F6] text-[#A3A697]"}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-7 h-7"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="font-bold text-[#3D4035]">
                          Bankový prevod
                        </p>
                        <p className="text-xs text-[#8A9A5B]">
                          Spracovanie po prijatí platby
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PRAVÝ STĹPEC - ZHRNUTIE */}
            <div className="w-full lg:w-[450px]">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8E6DF] lg:sticky lg:top-24">
                <h2 className="text-xl font-bold text-[#2C2E26] mb-6">
                  Zhrnutie objednávky
                </h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-[#E8E6DF] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => {
                    const price =
                      typeof item.price === "number"
                        ? item.price
                        : parseFloat(item.price || "0");
                    return (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div
                          className="w-14 h-14 bg-[#EFEFEA] rounded-md flex-shrink-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.imageUrl})` }}
                        ></div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#3D4035] leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[#8A9A5B] text-xs font-bold mt-0.5">
                            {price.toFixed(2)} €
                          </p>
                        </div>
                        <div className="flex items-center border border-[#E8E6DF] rounded-md bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 py-0.5 text-[#6B6E56] hover:bg-[#F9F8F6] font-bold"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 py-0.5 text-[#6B6E56] hover:bg-[#F9F8F6] font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-[#8A9A5B] uppercase tracking-wider mb-2">
                    Zľavový kód
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Zadajte kód"
                      className="flex-1 border border-[#E8E6DF] p-3 rounded-lg focus:outline-none focus:border-[#5C6B46] text-sm"
                    />
                    <button
                      onClick={() => setIsCouponApplied(true)}
                      className="bg-[#F2F1EC] text-[#3D4035] px-4 rounded-lg font-bold hover:bg-[#E8E6DF] transition-colors text-sm"
                    >
                      Použiť
                    </button>
                  </div>
                </div>

                {user && user.points && user.points > 0 && (
                  <div className="mb-6 bg-[#F9F8F6] p-4 rounded-xl border border-[#E8E6DF]">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🪙</span>
                        <div>
                          <p className="font-bold text-sm text-[#3D4035]">
                            Použiť vernostné body
                          </p>
                          <p className="text-[10px] text-[#8A9A5B]">
                            Dostupné: {user.points} bodov
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#E8A317]">
                        - {pointsDiscount.toFixed(2)} €
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <input
                        type="range"
                        min="0"
                        max={user.points}
                        value={pointsUsed}
                        onChange={(e) => setPointsUsed(Number(e.target.value))}
                        className="w-full h-2 bg-[#E8E6DF] rounded-lg appearance-none cursor-pointer accent-[#5C6B46]"
                      />
                      <input
                        type="number"
                        value={pointsUsed}
                        onChange={(e) => {
                          const val = Math.min(
                            Number(e.target.value),
                            user.points || 0,
                          );
                          setPointsUsed(val);
                        }}
                        className="w-20 border border-[#E8E6DF] p-1.5 rounded-md text-center text-sm font-bold outline-none focus:border-[#5C6B46]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4 border-t border-[#E8E6DF] pt-4">
                  <div className="flex justify-between text-sm text-[#6B6E56]">
                    <span>Medzisúčet:</span>
                    <span className="font-medium">
                      {cartTotal.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-[#6B6E56]">
                    <span>Doprava:</span>
                    <span className="font-medium">
                      {shippingCost.toFixed(2)} €
                    </span>
                  </div>
                  {isCouponApplied && (
                    <div className="flex justify-between text-sm text-[#5C6B46] font-bold bg-[#F2F1EC] p-2 rounded-md">
                      <span>Zľavový kód:</span>
                      <span>- {couponDiscount.toFixed(2)} €</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#E8E6DF] pt-4 flex justify-between items-end mb-6">
                  <span className="text-lg font-bold text-[#2C2E26]">
                    Spolu k úhrade:
                  </span>
                  <span className="text-2xl font-bold text-[#5C6B46]">
                    {finalTotal.toFixed(2)} €
                  </span>
                </div>

                <button className="w-full bg-[#5C6B46] text-white py-4 rounded-xl font-bold text-center text-lg hover:bg-[#4A5738] transition-colors shadow-lg active:scale-[0.98]">
                  Objednať s povinnosťou platby
                </button>
                <div className="text-center mt-3 text-xs text-[#8A9A5B] flex items-center justify-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-[#5C6B46]"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Bezpečná šifrovaná SSL platba
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
