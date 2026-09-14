import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../../authActions";
import { db } from "../../../lib/db";

function formatAmount(value: { toString(): string } | number, currency: string) {
  return new Intl.NumberFormat("sk-SK", { style: "currency", currency }).format(Number(value));
}

export default async function ObjednavkyPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const orders = await db.order.findMany({
    where: { userId: session.id },
    select: { orderNumber: true, createdAt: true, total: true, currency: true, status: true, paymentStatus: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-[500px] rounded-2xl border border-[#E8E6DF] bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-3xl font-bold text-[#2C2E26]">Moje objednávky</h1>
      <p className="mb-8 text-[#6B6E56]">Prehľad vašich aktuálnych aj predchádzajúcich nákupov.</p>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D5D3C9] bg-[#F9F8F6] py-16 text-center">
          <h2 className="mb-2 text-lg font-bold text-[#3D4035]">Zatiaľ nemáte žiadne objednávky</h2>
          <p className="text-[#6B6E56]">Objednávky vytvorené po prihlásení sa zobrazia tu.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E8E6DF]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#F9F8F6] text-[#6B6E56]"><tr><th className="p-4">Objednávka</th><th className="p-4">Dátum</th><th className="p-4">Spolu</th><th className="p-4">Stav</th><th className="p-4">Platba</th></tr></thead>
            <tbody>{orders.map((order) => <tr key={order.orderNumber} className="border-t border-[#E8E6DF] hover:bg-[#F9F8F6]"><td className="p-4 font-semibold"><Link className="text-[#5C6B46] underline" href={`/ucet/objednavky/${order.orderNumber}`}>{order.orderNumber}</Link></td><td className="p-4">{order.createdAt.toLocaleDateString("sk-SK")}</td><td className="p-4">{formatAmount(order.total, order.currency)}</td><td className="p-4">{order.status}</td><td className="p-4">{order.paymentStatus}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
