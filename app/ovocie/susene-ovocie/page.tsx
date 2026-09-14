import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Sušené ovocie",
  description: "Objavte sušené ovocie v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Sušené ovocie" description="Objavte starostlivo vybraný sortiment: sušené ovocie." subCategory="Sušené ovocie" />;
}
