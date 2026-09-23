import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAuthorizationError, requireAdmin } from "../../lib/admin/access";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthorizationError) notFound();
    throw error;
  }

  return <main className="min-h-screen bg-[#F9F8F6] px-4 py-8 text-[#3D4035] md:px-8"><div className="mx-auto max-w-7xl"><header className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-wider text-[#8A9A5B]">Správa e-shopu</p><h1 className="text-2xl font-bold text-[#2C2E26]">Administrácia</h1></div><nav className="flex flex-wrap gap-3 text-sm font-semibold"><Link href="/admin/orders" className="rounded-lg border border-[#D5D3C9] px-4 py-2 hover:border-[#5C6B46]">Objednávky</Link><Link href="/admin/inventory" className="rounded-lg border border-[#D5D3C9] px-4 py-2 hover:border-[#5C6B46]">Sklad</Link><Link href="/admin/reviews" className="rounded-lg border border-[#D5D3C9] px-4 py-2 hover:border-[#5C6B46]">Recenzie</Link><Link href="/" className="rounded-lg bg-[#5C6B46] px-4 py-2 text-white">E-shop</Link></nav></header>{children}</div></main>;
}
