import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Šálky a poháre na čaj",
  description: "Objavte šálky a poháre na čaj v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Šálky a poháre na čaj" description="Objavte starostlivo vybraný sortiment: šálky a poháre na čaj." subCategory="Šálky a poháre na čaj" />;
}
