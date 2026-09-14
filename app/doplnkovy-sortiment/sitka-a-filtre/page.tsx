import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Sitká a filtre",
  description: "Objavte sitká a filtre v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Sitká a filtre" description="Objavte starostlivo vybraný sortiment: sitká a filtre." subCategory="Sitká a filtre" />;
}
