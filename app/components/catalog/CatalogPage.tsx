import { getCatalogProducts } from "../../../lib/catalog";
import { ProductGrid } from "./ProductGrid";

type Props = { title: string; description: string; subCategory: string };

export async function CatalogPage({ title, description, subCategory }: Props) {
  const products = await getCatalogProducts(subCategory);
  return <main className="flex min-h-screen flex-col bg-[#FAF4E8] text-[#3D4035]"><div className="mx-auto w-full max-w-7xl flex-grow px-6 py-16"><section className="mx-auto mb-12 max-w-4xl text-center"><h1 className="mb-4 text-4xl font-semibold text-[#2C2E26] md:text-5xl">{title}</h1><p className="text-lg leading-relaxed text-[#6B6E56] md:text-xl">{description}</p></section><ProductGrid products={products} /></div></main>;
}
