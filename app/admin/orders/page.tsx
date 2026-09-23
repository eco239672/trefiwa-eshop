import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "../../../lib/db";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../../../lib/orders/status";

type Search = { q?: string; status?: string; payment?: string; from?: string; to?: string };

const orderStatusValues = Object.values(ORDER_STATUSES);
const paymentStatusValues = Object.values(PAYMENT_STATUSES);

function dayStart(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;
  const q = search.q?.trim().slice(0, 100) || "";
  const from = dayStart(search.from);
  const toStart = dayStart(search.to);
  const to = toStart ? new Date(toStart.getTime() + 24 * 60 * 60 * 1000) : null;
  const where: Prisma.OrderWhereInput = {
    ...(q ? { orderNumber: { contains: q, mode: "insensitive" } } : {}),
    ...(orderStatusValues.includes(search.status as typeof orderStatusValues[number]) ? { status: search.status } : {}),
    ...(paymentStatusValues.includes(search.payment as typeof paymentStatusValues[number]) ? { paymentStatus: search.payment } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) } } : {}),
  };
  const orders = await db.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, select: { orderNumber: true, createdAt: true, customerFirstName: true, customerLastName: true, customerEmail: true, total: true, currency: true, status: true, paymentStatus: true } });
  return <section className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm"><h2 className="mb-5 text-xl font-bold text-[#2C2E26]">Objednávky</h2><form className="mb-6 grid gap-3 md:grid-cols-5"><input name="q" defaultValue={q} placeholder="Číslo objednávky" className="rounded-lg border border-[#D5D3C9] p-3" /><select name="status" defaultValue={search.status || ""} className="rounded-lg border border-[#D5D3C9] p-3"><option value="">Všetky stavy</option>{orderStatusValues.map((status) => <option key={status}>{status}</option>)}</select><select name="payment" defaultValue={search.payment || ""} className="rounded-lg border border-[#D5D3C9] p-3"><option value="">Všetky platby</option>{paymentStatusValues.map((status) => <option key={status}>{status}</option>)}</select><input type="date" name="from" defaultValue={search.from} className="rounded-lg border border-[#D5D3C9] p-3" /><input type="date" name="to" defaultValue={search.to} className="rounded-lg border border-[#D5D3C9] p-3" /><button className="rounded-lg bg-[#5C6B46] px-5 py-3 font-bold text-white md:col-span-5">Filtrovať</button></form><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-sm"><thead className="border-b bg-[#F9F8F6] text-[#6B6E56]"><tr><th className="p-3">Objednávka</th><th className="p-3">Dátum</th><th className="p-3">Zákazník</th><th className="p-3">Spolu</th><th className="p-3">Stav</th><th className="p-3">Platba</th></tr></thead><tbody>{orders.map((order) => <tr key={order.orderNumber} className="border-b border-[#F2F1EC]"><td className="p-3 font-semibold"><Link className="text-[#5C6B46] underline" href={`/admin/orders/${order.orderNumber}`}>{order.orderNumber}</Link></td><td className="p-3">{order.createdAt.toLocaleDateString("sk-SK")}</td><td className="p-3">{[order.customerFirstName, order.customerLastName].filter(Boolean).join(" ") || "—"}<br /><span className="text-xs text-[#6B6E56]">{order.customerEmail || "—"}</span></td><td className="p-3">{Number(order.total).toFixed(2)} {order.currency}</td><td className="p-3">{order.status}</td><td className="p-3">{order.paymentStatus}</td></tr>)}</tbody></table></div>{orders.length === 0 ? <p className="py-8 text-center text-[#6B6E56]">Žiadne objednávky nevyhovujú filtru.</p> : null}</section>;
}
