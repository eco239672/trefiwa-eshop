import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Čajové lyžičky",
  description: "Objavte čajové lyžičky v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Čajové lyžičky" description="Objavte starostlivo vybraný sortiment: čajové lyžičky." subCategory="Čajové lyžičky" />;
}
