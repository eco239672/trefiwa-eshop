import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const jwtVerify = vi.hoisted(() => vi.fn());
vi.mock("jose", () => ({ jwtVerify }));
vi.mock("../lib/session", () => ({ getJwtSigningKey: () => new TextEncoder().encode("test") }));

const { proxy } = await import("../proxy");

describe("account proxy", () => {
  beforeEach(() => jwtVerify.mockReset());

  it("redirects an anonymous request away from a protected route", async () => {
    const response = await proxy(new NextRequest("https://trefiwa.sk/ucet/objednavky"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://trefiwa.sk/");
  });

  it("allows a verified session", async () => {
    jwtVerify.mockResolvedValue({ payload: {} });
    const request = new NextRequest("https://trefiwa.sk/ucet", { headers: { cookie: "trefiwa_session=valid" } });
    expect((await proxy(request)).status).toBe(200);
  });
});
