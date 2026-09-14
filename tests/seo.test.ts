import { describe, expect, it, vi } from "vitest";

const findMany = vi.hoisted(() => vi.fn(async () => [{ id: "product-id" }]));
vi.mock("../lib/db", () => ({ db: { product: { findMany } } }));

const { default: robots } = await import("../app/robots");
const { default: sitemap } = await import("../app/sitemap");

describe("SEO metadata routes", () => {
  it("does not index checkout or account routes", () => {
    const rules = robots().rules;
    expect(rules).toEqual(expect.objectContaining({ disallow: expect.arrayContaining(["/checkout", "/ucet"]) }));
  });

  it("includes public product URLs in the sitemap", async () => {
    const entries = await sitemap();
    expect(entries.map((entry) => entry.url)).toContain("https://trefiwa.sk/produkt/product-id");
    expect(entries.map((entry) => entry.url)).not.toContain("https://trefiwa.sk/checkout");
  });
});
