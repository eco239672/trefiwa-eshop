"use client";
/* eslint-disable react-hooks/set-state-in-effect -- local checkout state is intentionally hydrated from sessionStorage after mount. */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitCheckout } from "./actions";
import { calculateShippingCents, countries, FREE_SHIPPING_THRESHOLD_CENTS, formatEuroFromCents, getDeliveryOptions } from "../../lib/checkout/config";
import { PAYMENT_METHODS, type PaymentMethod } from "../../lib/checkout/types";
import { selectionForDelivery, type PacketaSelection } from "../../lib/packeta/selection";
import { useCart } from "../context/CartContext";
import { PacketaPickupSelector } from "./PacketaPickupSelector";

const IDEMPOTENCY_STORAGE_KEY = "trefiwa_checkout_idempotency";
const cardPaymentUiEnabled = process.env.NEXT_PUBLIC_COMGATE_CARD_ENABLED === "true";
const cardPaymentTestNotice = process.env.NEXT_PUBLIC_COMGATE_TEST_MODE_NOTICE === "true";

type CustomerForm = {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  zip: string;
  email: string;
  phone: string;
};

function parseDisplayPrice(value: number | string) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return Number.parseFloat(value.replace(",", ".").replace(/[^0-9.]/g, "")) || 0;
}

function createIdempotencyKey() {
  return crypto.randomUUID();
}

export default function CheckoutPage() {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart, cartNotice } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [country, setCountry] = useState("Slovensko");
  const [shippingMethod, setShippingMethod] = useState("sk_kurier");
  const [couponCode, setCouponCode] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pickupPoint, setPickupPoint] = useState<PacketaSelection>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.BANK_TRANSFER);
  const [form, setForm] = useState<CustomerForm>({ firstName: "", lastName: "", street: "", city: "", zip: "", email: "", phone: "" });

  const cartSignature = useMemo(
    () => JSON.stringify(cart.map((item) => ({ variantId: item.variantId, quantity: item.quantity })).sort((a, b) => a.variantId.localeCompare(b.variantId))),
    [cart],
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
    try {
      const previous = stored ? JSON.parse(stored) : null;
      if (previous?.signature === cartSignature && typeof previous.key === "string") {
        setIdempotencyKey(previous.key);
      } else {
        const key = createIdempotencyKey();
        sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify({ signature: cartSignature, key }));
        setIdempotencyKey(key);
      }
    } catch {
      const key = createIdempotencyKey();
      sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify({ signature: cartSignature, key }));
      setIdempotencyKey(key);
    }
    setMounted(true);
  }, [cartSignature]);

  const deliveryOptions = getDeliveryOptions(country);
  const delivery = deliveryOptions.find((option) => option.id === shippingMethod) ?? deliveryOptions.find((option) => option.availableForCheckout);
  const estimatedShippingCents = delivery ? Number(calculateShippingCents(BigInt(Math.round(cartTotal * 100)), delivery)) : 0;
  const estimatedTotal = cartTotal + estimatedShippingCents / 100;

  useEffect(() => {
    setPickupPoint((current) => selectionForDelivery(Boolean(delivery?.requiresPickupPoint), current));
  }, [delivery?.requiresPickupPoint]);

  const updateForm = (field: keyof CustomerForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const changeCountry = (nextCountry: string) => {
    setCountry(nextCountry);
    setShippingMethod(getDeliveryOptions(nextCountry).find((method) => method.availableForCheckout)?.id ?? "");
    setPickupPoint(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!idempotencyKey || !delivery) {
      setError("Pokladňu sa nepodarilo pripraviť. Obnovte stránku a skúste to znova.");
      return;
    }
    if (delivery.requiresPickupPoint && !pickupPoint) {
      setError("Pre Packetu najprv vyberte výdajné miesto.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const result = await submitCheckout({
      idempotencyKey,
      items: cart.map((item) => ({ variantId: item.variantId, quantity: Number(item.quantity) })),
      shippingMethod: delivery.id,
      pickupPoint: delivery.requiresPickupPoint && pickupPoint ? pickupPoint : undefined,
      paymentMethod,
      couponCode,
      customer: { ...form, country },
    });

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    clearCart();
    sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
    if (result.paymentRedirectUrl) {
      window.location.assign(result.paymentRedirectUrl);
      return;
    }
    router.replace(`/checkout/success/${result.orderNumber}`);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#F9F8F6] py-10 text-[#3D4035]">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold text-[#2C2E26] mb-8">Bezpečná pokladňa</h1>
        {cart.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-[#E8E6DF] text-center"><h2 className="text-xl font-bold mb-4">Váš košík je prázdny</h2><Link href="/" className="inline-block bg-[#5C6B46] text-white px-8 py-3 rounded-md font-bold uppercase">Späť do obchodu</Link></div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8E6DF]">
                <h2 className="text-xl font-bold text-[#2C2E26] mb-6">Doručovacie údaje</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Field id="firstName" label="Meno" value={form.firstName} onChange={(value) => updateForm("firstName", value)} autoComplete="given-name" /><Field id="lastName" label="Priezvisko" value={form.lastName} onChange={(value) => updateForm("lastName", value)} autoComplete="family-name" /></div>
                <div className="mt-4"><Field id="street" label="Ulica a číslo popisné" value={form.street} onChange={(value) => updateForm("street", value)} autoComplete="street-address" /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"><Field id="city" label="Mesto" value={form.city} onChange={(value) => updateForm("city", value)} autoComplete="address-level2" /><Field id="zip" label="PSČ" value={form.zip} onChange={(value) => updateForm("zip", value)} autoComplete="postal-code" /><div><label htmlFor="country" className="block text-xs font-bold text-[#8A9A5B] uppercase mb-1">Krajina</label><select id="country" value={country} onChange={(event) => changeCountry(event.target.value)} className="w-full border border-[#E8E6DF] p-3 rounded-lg focus:outline-none focus:border-[#5C6B46]" required>{countries.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"><Field id="email" label="E-mail" value={form.email} onChange={(value) => updateForm("email", value)} type="email" autoComplete="email" /><Field id="phone" label="Telefón" value={form.phone} onChange={(value) => updateForm("phone", value)} type="tel" autoComplete="tel" /></div>
              </section>
              <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8E6DF]"><h2 className="text-xl font-bold text-[#2C2E26] mb-4">Spôsob doručenia</h2><div className="space-y-3">{deliveryOptions.map((method) => <label key={method.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${method.availableForCheckout ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${shippingMethod === method.id ? "border-[#5C6B46] bg-[#F2F1EC]" : "border-[#E8E6DF]"}`}><span className="flex items-center gap-3"><input type="radio" name="shippingMethod" value={method.id} checked={shippingMethod === method.id} disabled={!method.availableForCheckout} onChange={() => setShippingMethod(method.id)} /><span><strong className="block">{method.name}</strong><span className="text-xs text-[#8A9A5B]">{method.availableForCheckout ? method.time : "Dočasne nedostupné – výber výdajného miesta sa pripravuje."}</span></span></span><strong>{formatEuroFromCents(method.priceCents)}</strong></label>)}</div><p className="mt-4 text-xs text-[#8A9A5B]">Doprava zdarma od {formatEuroFromCents(FREE_SHIPPING_THRESHOLD_CENTS)} sa počíta z hodnoty tovaru pred zľavou.</p></section>
              {delivery?.requiresPickupPoint ? <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8E6DF]"><h2 className="text-xl font-bold text-[#2C2E26] mb-2">Výdajné miesto Packeta</h2><PacketaPickupSelector value={pickupPoint} onChange={setPickupPoint} /></section> : null}
              <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8E6DF]"><h2 className="text-xl font-bold text-[#2C2E26] mb-4">Spôsob platby</h2><label className={`flex items-center gap-3 p-4 rounded-xl border-2 ${paymentMethod === PAYMENT_METHODS.BANK_TRANSFER ? "border-[#5C6B46] bg-[#F2F1EC]" : "border-[#E8E6DF]"}`}><input type="radio" name="paymentMethod" checked={paymentMethod === PAYMENT_METHODS.BANK_TRANSFER} onChange={() => setPaymentMethod(PAYMENT_METHODS.BANK_TRANSFER)} /><span><strong className="block">Bankový prevod</strong><span className="text-xs text-[#8A9A5B]">Platobné pokyny a referencia objednávky sa zobrazia po vytvorení objednávky.</span></span></label>{cardPaymentUiEnabled ? <label className={`mt-3 flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 ${paymentMethod === PAYMENT_METHODS.CARD ? "border-[#5C6B46] bg-[#F2F1EC]" : "border-[#E8E6DF]"}`}><input type="radio" name="paymentMethod" checked={paymentMethod === PAYMENT_METHODS.CARD} onChange={() => setPaymentMethod(PAYMENT_METHODS.CARD)} /><span><strong className="block">Platba kartou online (Comgate){cardPaymentTestNotice ? " — TESTOVACÍ REŽIM" : ""}</strong><span className="text-xs text-[#8A9A5B]">{cardPaymentTestNotice ? "Testovacia platba Comgate — peniaze sa nestrhnú." : "Po odoslaní objednávky budete presmerovaní na zabezpečenú platobnú bránu Comgate."}</span></span></label> : <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#E8E6DF] p-4 opacity-60" aria-disabled="true"><input type="radio" name="paymentMethod" disabled /><span><strong className="block">Platba kartou online (Comgate)</strong><span className="text-xs text-[#8A9A5B]">Dočasne nedostupné – Comgate ešte nie je nakonfigurovaný.</span></span></div>}</section>
            </div>
            <aside className="w-full lg:w-[430px]"><div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8E6DF] lg:sticky lg:top-24"><h2 className="text-xl font-bold text-[#2C2E26] mb-6">Zhrnutie objednávky</h2><div className="space-y-4 mb-6 pb-6 border-b border-[#E8E6DF]">{cart.map((item) => <div key={item.id} className="flex gap-3 items-center"><div className="w-14 h-14 bg-[#EFEFEA] rounded-md bg-cover bg-center" style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined} /><div className="flex-1"><p className="font-semibold text-sm">{item.name}</p><p className="text-[#8A9A5B] text-xs">{parseDisplayPrice(item.price).toFixed(2)} € / ks</p></div><div className="flex items-center border border-[#E8E6DF] rounded-md"><button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label={`Znížiť množstvo ${item.name}`} className="px-2 py-1">−</button><span className="w-7 text-center text-sm">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label={`Zvýšiť množstvo ${item.name}`} className="px-2 py-1">+</button></div><button type="button" onClick={() => removeFromCart(item.id)} className="text-xs text-[#D84949] underline">Odstrániť</button></div>)}</div><div className="mb-6"><label htmlFor="coupon" className="block text-xs font-bold text-[#8A9A5B] uppercase tracking-wider mb-2">Zľavový kód</label><input id="coupon" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Voliteľné" className="w-full border border-[#E8E6DF] p-3 rounded-lg" /></div>{cartNotice && <p role="status" className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-800">{cartNotice}</p>}{error && <p role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{error}</p>}<div className="space-y-2 border-t border-[#E8E6DF] pt-4 text-sm text-[#6B6E56]"><div className="flex justify-between"><span>Odhad medzisúčtu:</span><span>{cartTotal.toFixed(2)} €</span></div><div className="flex justify-between"><span>Doprava:</span><span>{((delivery?.priceCents ?? 0) / 100).toFixed(2)} €</span></div></div><div className="border-t border-[#E8E6DF] pt-4 flex justify-between items-end my-6"><span className="font-bold">Odhad spolu:</span><span className="text-2xl font-bold text-[#5C6B46]">{estimatedTotal.toFixed(2)} €</span></div><p className="text-xs text-[#8A9A5B] mb-4">Konečnú cenu, dostupnosť, dopravu a zľavu overí server pred vytvorením objednávky.</p><button type="submit" disabled={isSubmitting || !idempotencyKey} className="w-full bg-[#5C6B46] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#4A5738] disabled:opacity-60 disabled:cursor-not-allowed">{isSubmitting ? "Vytváram objednávku…" : "Objednať s povinnosťou platby"}</button></div></aside>
          </div>
        )}
      </form>
    </main>
  );
}

function Field({ id, label, value, onChange, type = "text", autoComplete }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string }) {
  return <div><label htmlFor={id} className="block text-xs font-bold text-[#8A9A5B] uppercase mb-1">{label}</label><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} required className="w-full border border-[#E8E6DF] p-3 rounded-lg focus:outline-none focus:border-[#5C6B46]" /></div>;
}
