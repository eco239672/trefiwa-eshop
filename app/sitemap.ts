import type { MetadataRoute } from "next";
import { db } from "../lib/db";
import { absoluteUrl } from "../lib/site";

export const revalidate = 3600;

const publicPaths = ["/", "/o-nas", "/doprava-a-platba", "/obchodne-podmienky", "/ochrana-osobnych-udajov", "/caje/anglicke-caje", "/caje/cinske-caje", "/caje/liecivky", "/caje/relaxacne-zmesi", "/zdrave-potraviny/kakao", "/zdrave-potraviny/med-a-sladidla", "/zdrave-potraviny/orechy-a-semienka", "/zdrave-potraviny/ranajkove-kase", "/ovocie/sladene-ovocie", "/ovocie/susene-ovocie", "/eko-sortiment/jednorazovy-eko-riad", "/eko-sortiment/ostatne", "/doplnkovy-sortiment/cajniky", "/doplnkovy-sortiment/cajove-lyzicky", "/doplnkovy-sortiment/salky-a-pohare-na-caj", "/doplnkovy-sortiment/sitka-a-filtre", "/zvyhodnene-balicky/darcekove-sady", "/zvyhodnene-balicky/degustacne-sady"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({ select: { id: true } });
  return [
    ...publicPaths.map((path) => ({ url: absoluteUrl(path), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...products.map((product) => ({ url: absoluteUrl(`/produkt/${product.id}`), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
