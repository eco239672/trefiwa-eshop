import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Liečivé čajové zmesi",
  description: "Objavte liečivé čajové zmesi v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Liečivé čajové zmesi" description="Objavte starostlivo vybraný sortiment: liečivé čajové zmesi." subCategory="Liečivky" />;
}
