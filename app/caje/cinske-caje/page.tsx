import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Čínske čaje",
  description: "Objavte čínske čaje v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Čínske čaje" description="Objavte starostlivo vybraný sortiment: čínske čaje." subCategory="Čínske čaje" />;
}
