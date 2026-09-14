import type { Metadata } from "next";
import { CatalogPage } from "../../components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Kakao",
  description: "Objavte kakao v e-shope Trefiwa.",
};

export default function Page() {
  return <CatalogPage title="Kakao" description="Objavte starostlivo vybraný sortiment: kakao." subCategory="Kakao" />;
}
