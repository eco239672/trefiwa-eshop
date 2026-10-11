import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Zimná edícia čajov",
  description: "Objavte zimnú edíciu čajov v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Zimná edícia" description="Objavte čaje pre zimné chvíle, sviatočnú atmosféru a zahriatie." subCategory="Zimná edícia" />;
}
