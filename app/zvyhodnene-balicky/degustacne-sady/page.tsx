import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Degustačné sady",
  description: "Objavte degustačné sady v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Degustačné sady" description="Objavte starostlivo vybraný sortiment: degustačné sady." subCategory="Zvýhodnené balíčky" />;
}
