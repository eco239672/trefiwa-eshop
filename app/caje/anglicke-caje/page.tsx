import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Anglické čaje a čajové zmesi",
  description: "Objavte anglické čaje a čajové zmesi v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Anglické čaje a čajové zmesi" description="Objavte starostlivo vybraný sortiment: anglické čaje a čajové zmesi." subCategory="Anglické čaje" />;
}
