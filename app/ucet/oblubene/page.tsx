import { redirect } from "next/navigation";
import { getSession } from "../../authActions";
import { db } from "../../../lib/db";
import { getCatalogProductsByIds } from "../../../lib/catalog";
import { ProductGrid } from "../../components/catalog/ProductGrid";

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/");
  const items = await db.wishlistItem.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" }, select: { productId: true } });
  const products = await getCatalogProductsByIds(items.map((item) => item.productId));
  return <div className="min-h-[500px] rounded-2xl border border-[#E8E6DF] bg-white p-8 shadow-sm"><h1 className="mb-2 text-3xl font-bold text-[#2C2E26]">Obľúbené produkty</h1><p className="mb-8 text-[#6B6E56]">Produkty uložené vo vašom účte.</p>{products.length ? <ProductGrid products={products} /> : <p className="rounded-xl border border-dashed border-[#D5D3C9] bg-[#F9F8F6] p-8 text-center text-[#6B6E56]">Zatiaľ nemáte žiadne obľúbené produkty.</p>}</div>;
}
