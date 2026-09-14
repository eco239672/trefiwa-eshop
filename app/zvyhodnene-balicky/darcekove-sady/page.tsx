import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Darčekové sady",
  description: "Objavte darčekové sady v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Darčekové sady" description="Objavte starostlivo vybraný sortiment: darčekové sady." subCategory="Darčekové sady" />;
}
