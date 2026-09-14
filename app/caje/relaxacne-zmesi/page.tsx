import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Relaxačné čajové zmesi",
  description: "Objavte relaxačné čajové zmesi v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Relaxačné čajové zmesi" description="Objavte starostlivo vybraný sortiment: relaxačné čajové zmesi." subCategory="Relaxačné zmesi" />;
}
