import { describe, it, expect, beforeAll, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => undefined, delete: () => undefined }),
}));

vi.mock("../prisma", () => ({
  prisma: { user: { findUnique: async () => null } },
}));

beforeAll(() => {
  process.env.JWT_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
});

describe("auth helpers", () => {
  it("hashes a password to a non-plain value", async () => {
    const { hashPassword } = await import("../auth");
    const hash = await hashPassword("hunter2");
    expect(hash).not.toBe("hunter2");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("comparePassword returns true for matching password", async () => {
    const { hashPassword, comparePassword } = await import("../auth");
    const hash = await hashPassword("correct horse battery staple");
    expect(await comparePassword("correct horse battery staple", hash)).toBe(
      true
    );
  });

  it("comparePassword returns false for wrong password", async () => {
    const { hashPassword, comparePassword } = await import("../auth");
    const hash = await hashPassword("secret");
    expect(await comparePassword("wrong", hash)).toBe(false);
  });

  it("signs and verifies an access token round-trip", async () => {
    const { signAccessToken, verifyAccessToken } = await import("../auth");
    const token = signAccessToken("user-123");
    const payload = verifyAccessToken(token);
    expect(payload?.userId).toBe("user-123");
  });

  it("returns null on invalid access token", async () => {
    const { verifyAccessToken } = await import("../auth");
    expect(verifyAccessToken("not.a.jwt")).toBeNull();
  });

  it("signs and verifies a refresh token round-trip", async () => {
    const { signRefreshToken, verifyRefreshToken } = await import("../auth");
    const token = signRefreshToken("user-xyz");
    const payload = verifyRefreshToken(token);
    expect(payload?.userId).toBe("user-xyz");
  });

  it("access token does not verify as refresh token", async () => {
    const { signAccessToken, verifyRefreshToken } = await import("../auth");
    const token = signAccessToken("user-abc");
    expect(verifyRefreshToken(token)).toBeNull();
  });

  it("setAuthCookies returns properly scoped cookies", async () => {
    const { setAuthCookies } = await import("../auth");
    const cookies = setAuthCookies("acc", "ref");
    expect(cookies).toHaveLength(2);
    expect(cookies.map((c) => c.name).sort()).toEqual([
      "access_token",
      "refresh_token",
    ]);
    for (const c of cookies) {
      expect(c.options.httpOnly).toBe(true);
      expect(c.options.path).toBe("/");
    }
  });
});
