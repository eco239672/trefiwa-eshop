import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Raňajkové kaše",
  description: "Objavte raňajkové kaše v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Raňajkové kaše" description="Objavte starostlivo vybraný sortiment: raňajkové kaše." subCategory="Raňajkové kaše" />;
}
