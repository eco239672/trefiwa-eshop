import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Orechy a semienka",
  description: "Objavte orechy a semienka v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Orechy a semienka" description="Objavte starostlivo vybraný sortiment: orechy a semienka." subCategory="Orechy a semienka" />;
}
