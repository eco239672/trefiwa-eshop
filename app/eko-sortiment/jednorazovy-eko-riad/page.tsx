import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Jednorazový eko-riad",
  description: "Objavte jednorazový eko-riad v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Jednorazový eko-riad" description="Objavte starostlivo vybraný sortiment: jednorazový eko-riad." subCategory="Jednorazový eko-riad" />;
}
