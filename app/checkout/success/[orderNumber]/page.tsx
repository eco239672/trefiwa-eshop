import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "../../../authActions";
import { db } from "../../../../lib/db";
import { canAccessOrder } from "../../../../lib/checkout/access";
import { guestOrderCookieName } from "../../../../lib/checkout/guest-cookie";
import { getBankTransferInstructions } from "../../../../lib/payments/bank-transfer";
import { companyConfig } from "../../../../lib/company/config";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: { select: { id: true, productName: true, variantWeight: true, quantity: true, totalPrice: true } } },
  });
  if (!order) notFound();

  const session = await getSession();
  const cookieStore = await cookies();
  const canView = canAccessOrder(order, session?.id, cookieStore.get(guestOrderCookieName(orderNumber))?.value);
  if (!canView) notFound();
  const bankTransfer = order.paymentMethod === "BANK_TRANSFER" ? getBankTransferInstructions(order.orderNumber) : null;
  const cardPaymentState = order.paymentMethod === "CARD"
    ? order.paymentStatus === "PAID" ? "Platba kartou bola potvrdená."
      : order.paymentStatus === "CANCELLED" ? "Platba kartou bola zrušená. Objednávka nebola označená ako zaplatená."
        : order.paymentStatus === "FAILED" ? "Platbu kartou sa nepodarilo pripraviť alebo dokončiť."
          : "Platbu kartou overujeme. Potvrdenie sa zobrazuje až po dôveryhodnom serverovom overení Comgate."
    : null;

  return (
    <main className="min-h-screen bg-[#F9F8F6] py-12 px-4 text-[#3D4035]">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-[#E8E6DF]">
        <p className="text-[#5C6B46] font-bold mb-2">Objednávka bola prijatá</p>
        <h1 className="text-3xl font-bold text-[#2C2E26] mb-4">Ďakujeme za vašu objednávku</h1>
        <p className="text-[#6B6E56] mb-6">Objednávka <strong>{order.orderNumber}</strong> bola bezpečne uložená. Stav platby: <strong>{order.paymentStatus}</strong>.</p>
        {cardPaymentState ? <section className="mb-6 rounded-xl border border-[#D5D3C9] bg-[#F9F8F6] p-5"><h2 className="mb-2 text-lg font-bold text-[#2C2E26]">Platba kartou cez Comgate</h2><p className="text-sm text-[#6B6E56]">{cardPaymentState}</p>{order.paymentStatus === "AWAITING_PAYMENT" && order.paymentRedirectUrl ? <a className="mt-4 inline-block rounded-lg bg-[#5C6B46] px-4 py-2 text-sm font-bold text-white" href={order.paymentRedirectUrl}>Pokračovať v platbe</a> : null}{(order.paymentStatus === "FAILED" || order.paymentStatus === "CANCELLED") ? <p className="mt-3 text-sm text-[#6B6E56]">Novú platbu nevytvárame automaticky, aby nedošlo k duplicitnému účtovaniu. Kontaktujte nás na <a className="font-semibold underline" href={`mailto:${companyConfig.email}`}>{companyConfig.email}</a>.</p> : null}</section> : null}
        {bankTransfer ? <section className="mb-6 rounded-xl border border-[#D5D3C9] bg-[#F9F8F6] p-5">
          <h2 className="mb-2 text-lg font-bold text-[#2C2E26]">Platba bankovým prevodom</h2>
          {bankTransfer.configured ? (
            <dl className="grid gap-2 text-sm text-[#6B6E56]">
              <div className="flex justify-between gap-4"><dt>Príjemca</dt><dd className="font-semibold text-right text-[#3D4035]">{bankTransfer.recipientName}</dd></div>
              <div className="flex justify-between gap-4"><dt>IBAN</dt><dd className="font-semibold text-right text-[#3D4035]">{bankTransfer.iban}</dd></div>
              {bankTransfer.bic && <div className="flex justify-between gap-4"><dt>BIC/SWIFT</dt><dd className="font-semibold text-right text-[#3D4035]">{bankTransfer.bic}</dd></div>}
              <div className="flex justify-between gap-4"><dt>Referencia platby</dt><dd className="font-semibold text-right text-[#3D4035]">{bankTransfer.reference}</dd></div>
              <div className="flex justify-between gap-4"><dt>Suma</dt><dd className="font-semibold text-right text-[#3D4035]">{Number(order.total).toFixed(2)} {order.currency}</dd></div>
            </dl>
          ) : <p className="text-sm text-[#6B6E56]">Platobné údaje ešte nie sú nakonfigurované. Pre dokončenie platby kontaktujte zákaznícku podporu s referenciou <strong>{bankTransfer.reference}</strong>.</p>}
        </section> : null}
        {order.pickupPointCarrier && order.pickupPointName ? (
          <section className="mb-6 rounded-xl border border-[#D5D3C9] bg-[#F9F8F6] p-5">
            <h2 className="mb-2 text-lg font-bold text-[#2C2E26]">Výdajné miesto</h2>
            <p className="font-semibold text-[#3D4035]">{order.pickupPointCarrier}: {order.pickupPointName}</p>
            {order.pickupPointAddress ? <p className="mt-1 text-sm text-[#6B6E56]">{order.pickupPointAddress}</p> : null}
          </section>
        ) : null}
        <div className="border-y border-[#E8E6DF] py-5 space-y-3 mb-6">
          {order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.productName} ({item.variantWeight}) × {item.quantity}</span><strong>{Number(item.totalPrice).toFixed(2)} €</strong></div>)}
          <div className="flex justify-between pt-3 border-t border-[#E8E6DF] font-bold"><span>Spolu</span><span>{Number(order.total).toFixed(2)} {order.currency}</span></div>
        </div>
        <Link href="/" className="inline-block bg-[#5C6B46] text-white px-6 py-3 rounded-lg font-bold">Pokračovať v nákupe</Link>
      </div>
    </main>
  );
}
