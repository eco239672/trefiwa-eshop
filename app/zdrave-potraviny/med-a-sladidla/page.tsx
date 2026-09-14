import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Med a sladidlá",
  description: "Objavte med a sladidlá v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Med a sladidlá" description="Objavte starostlivo vybraný sortiment: med a sladidlá." subCategory="Med a sladidlá" />;
}
