import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: null as null | { id: string; name: string; email: string; password: string | null },
  rateAllowed: true,
  cookieValue: null as string | null,
  cookieOptions: null as Record<string, unknown> | null,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: (_name: string, value: string, options: Record<string, unknown>) => {
      state.cookieValue = value;
      state.cookieOptions = options;
    },
    get: () => state.cookieValue ? { value: state.cookieValue } : undefined,
    delete: () => { state.cookieValue = null; },
  })),
}));

vi.mock("../lib/db", () => ({
  db: { user: { findUnique: vi.fn(async () => state.user) } },
}));

vi.mock("../lib/security/rate-limit", () => ({
  consumeRequestRateLimit: vi.fn(async () => ({ allowed: state.rateAllowed })),
}));

process.env.JWT_SECRET = "test-local-jwt-secret-that-is-at-least-thirty-two-characters";
const { getSession, loginUser, logoutUser } = await import("../app/authActions");
const { proxy } = await import("../proxy");

function form(email: string, password: string) {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  return data;
}

describe("local authentication actions", () => {
  beforeEach(async () => {
    state.user = { id: "user-1", name: "Jana", email: "jana@example.com", password: await bcrypt.hash("correct-password", 4) };
    state.rateAllowed = true;
    state.cookieValue = null;
    state.cookieOptions = null;
  });

  it("creates an HttpOnly session and resolves it for protected account access", async () => {
    await expect(loginUser(form("jana@example.com", "correct-password"))).resolves.toEqual({ success: true });
    expect(state.cookieValue).toEqual(expect.any(String));
    expect(state.cookieOptions).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 604800 });
    await expect(getSession()).resolves.toEqual({ id: "user-1", name: "Jana", email: "jana@example.com" });
    const request = new NextRequest("https://trefiwa.sk/ucet/objednavky", { headers: { cookie: `trefiwa_session=${state.cookieValue}` } });
    expect((await proxy(request)).status).toBe(200);
  });

  it("rejects an invalid password without setting a session", async () => {
    await expect(loginUser(form("jana@example.com", "wrong-password"))).resolves.toEqual({ error: "Nesprávny e-mail alebo heslo." });
    expect(state.cookieValue).toBeNull();
  });

  it("enforces rate limiting before a password check", async () => {
    state.rateAllowed = false;
    await expect(loginUser(form("jana@example.com", "correct-password"))).resolves.toEqual({ error: "Príliš veľa pokusov. Skúste to neskôr." });
    expect(state.cookieValue).toBeNull();
  });

  it("clears the session on logout", async () => {
    await loginUser(form("jana@example.com", "correct-password"));
    await logoutUser();
    await expect(getSession()).resolves.toBeNull();
  });
});
