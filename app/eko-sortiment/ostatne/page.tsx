import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Eko sortiment",
  description: "Objavte eko sortiment v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Eko sortiment" description="Objavte starostlivo vybraný sortiment: eko sortiment." subCategory="Eko sortiment" />;
}
