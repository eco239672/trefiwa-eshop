import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Sladené ovocie",
  description: "Objavte sladené ovocie v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Sladené ovocie" description="Objavte starostlivo vybraný sortiment: sladené ovocie." subCategory="Sladené ovocie" />;
}
