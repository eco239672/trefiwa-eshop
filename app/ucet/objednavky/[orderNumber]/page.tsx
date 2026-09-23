import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "../../../authActions";
import { db } from "../../../../lib/db";
import { canViewAccountOrder } from "../../../../lib/orders/access";
import { getBankTransferInstructions } from "../../../../lib/payments/bank-transfer";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await getSession();
  if (!session) redirect("/");
  const { orderNumber } = await params;
  const order = await db.order.findFirst({
    where: { orderNumber, userId: session.id },
    include: { items: { select: { id: true, productName: true, variantWeight: true, quantity: true, totalPrice: true } } },
  });
  if (!order || !canViewAccountOrder(order.userId, session.id)) notFound();
  const bankTransfer = order.paymentMethod === "BANK_TRANSFER" ? getBankTransferInstructions(order.orderNumber) : null;

  return (
    <div className="rounded-2xl border border-[#E8E6DF] bg-white p-8 shadow-sm">
      <Link href="/ucet/objednavky" className="text-sm font-semibold text-[#5C6B46] underline">← Späť na objednávky</Link>
      <h1 className="mb-2 mt-5 text-3xl font-bold text-[#2C2E26]">Objednávka {order.orderNumber}</h1>
      <p className="mb-1 text-[#6B6E56]">Vytvorená: <strong>{order.createdAt.toLocaleString("sk-SK")}</strong></p>
      <p className="mb-6 text-[#6B6E56]">Stav: <strong>{order.status}</strong> · Platba: <strong>{order.paymentStatus}</strong></p>
      <section className="mb-6 rounded-xl border border-[#D5D3C9] bg-[#F9F8F6] p-5">
        <h2 className="mb-2 text-lg font-bold text-[#2C2E26]">Doručenie a platba</h2>
        <p>{order.shippingMethodName || order.shippingMethod || "Spôsob dopravy nebol uložený."}</p>
        <p className="mt-1 text-sm text-[#6B6E56]">Platba: {order.paymentMethod}</p>
      </section>
      {order.pickupPointCarrier && order.pickupPointName ? (
        <section className="mb-6 rounded-xl border border-[#D5D3C9] bg-[#F9F8F6] p-5">
          <h2 className="mb-2 text-lg font-bold text-[#2C2E26]">Výdajné miesto</h2>
          <p className="font-semibold text-[#3D4035]">{order.pickupPointCarrier}: {order.pickupPointName}</p>
          {order.pickupPointAddress ? <p className="mt-1 text-sm text-[#6B6E56]">{order.pickupPointAddress}</p> : null}
        </section>
      ) : null}
      <div className="space-y-3 border-y border-[#E8E6DF] py-5">
        {order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.productName} ({item.variantWeight}) × {item.quantity}</span><strong>{Number(item.totalPrice).toFixed(2)} {order.currency}</strong></div>)}
      </div>
      <div className="mt-5 flex justify-between font-bold"><span>Spolu</span><span>{Number(order.total).toFixed(2)} {order.currency}</span></div>
      {bankTransfer ? <section className="mt-6 rounded-xl border border-[#D5D3C9] bg-[#F9F8F6] p-5"><h2 className="mb-2 text-lg font-bold text-[#2C2E26]">Platba bankovým prevodom</h2>{bankTransfer.configured ? <dl className="grid gap-1 text-sm"><div>Príjemca: <strong>{bankTransfer.recipientName}</strong></div><div>IBAN: <strong>{bankTransfer.iban}</strong></div>{bankTransfer.bic ? <div>BIC/SWIFT: <strong>{bankTransfer.bic}</strong></div> : null}<div>Referencia: <strong>{bankTransfer.reference}</strong></div><div>Suma: <strong>{Number(order.total).toFixed(2)} {order.currency}</strong></div></dl> : <p className="text-sm text-[#6B6E56]">Platobné údaje nie sú momentálne nakonfigurované. Kontaktujte podporu s číslom objednávky.</p>}</section> : null}
    </div>
  );
}
