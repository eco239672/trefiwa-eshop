import { ProductGrid } from "./components/catalog/ProductGrid";
import { getCatalogProducts } from "../lib/catalog";

export default async function Home() {
  const products = await getCatalogProducts();
  return <main className="min-h-screen bg-[#F9F8F6] text-[#3D4035]"><section className="mx-auto max-w-4xl px-4 py-10 text-center md:py-14"><h1 className="mb-4 text-3xl font-semibold text-[#2C2E26] md:text-5xl">Z prírody k nám</h1><p className="text-base leading-relaxed text-[#6B6E56] md:text-xl">Objavte našu ponuku prémiových sypaných čajov, čajových zmesí, zdravých potravín a ekologického sortimentu.</p></section><section className="mx-auto max-w-7xl px-4 pb-12 md:px-8 lg:px-12"><h2 className="mb-5 border-b border-[#E8E6DF] pb-3 text-2xl font-semibold text-[#2C2E26]">Naše produkty</h2><ProductGrid products={products.slice(0, 8)} /></section></main>;
}
