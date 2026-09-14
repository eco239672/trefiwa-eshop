import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Čajníky",
  description: "Objavte čajníky v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Čajníky" description="Objavte starostlivo vybraný sortiment: čajníky." subCategory="Čajníky" />;
}
