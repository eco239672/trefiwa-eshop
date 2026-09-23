import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  session: { id: "admin-user" } as { id: string } | null,
  role: "ADMIN" as "ADMIN" | "CUSTOMER" | null,
}));

vi.mock("../app/authActions", () => ({ getSession: vi.fn(async () => state.session) }));
vi.mock("../lib/db", () => ({ db: { user: { findUnique: vi.fn(async () => state.role ? { id: "admin-user", role: state.role } : null) } } }));

const { AdminAuthorizationError, requireAdmin } = await import("../lib/admin/access");

describe("admin server authorization", () => {
  beforeEach(() => { state.session = { id: "admin-user" }; state.role = "ADMIN"; });

  it("authorizes the ADMIN role resolved from the database", async () => {
    await expect(requireAdmin()).resolves.toEqual({ id: "admin-user", role: "ADMIN" });
  });

  it("rejects an authenticated non-admin", async () => {
    state.role = "CUSTOMER";
    await expect(requireAdmin()).rejects.toBeInstanceOf(AdminAuthorizationError);
  });

  it("rejects requests without a session", async () => {
    state.session = null;
    await expect(requireAdmin()).rejects.toBeInstanceOf(AdminAuthorizationError);
  });
});
