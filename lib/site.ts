export const siteConfig = {
  name: "Trefiwa",
  url: "https://trefiwa.sk",
  description: "Prémiové čaje, zdravé potraviny a ekologický sortiment.",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
