import { describe, it, expect } from "vitest";
import { getCached, setCache, TTL } from "../cache";

describe("cache", () => {
  it("returns undefined for missing keys", () => {
    expect(getCached("nonexistent-key")).toBeUndefined();
  });

  it("stores and retrieves values", () => {
    setCache("unit:test:a", { foo: "bar" }, 60);
    expect(getCached<{ foo: string }>("unit:test:a")).toEqual({ foo: "bar" });
  });

  it("overwrites values on re-set", () => {
    setCache("unit:test:b", 1, 60);
    setCache("unit:test:b", 2, 60);
    expect(getCached<number>("unit:test:b")).toBe(2);
  });

  it("exposes sensible TTL constants", () => {
    expect(TTL.STOCK_QUOTE).toBeGreaterThan(0);
    expect(TTL.CRYPTO).toBeLessThan(TTL.STOCK_QUOTE);
    expect(TTL.HISTORICAL).toBeGreaterThanOrEqual(TTL.STOCK_QUOTE);
    expect(TTL.LEADERBOARD).toBe(300);
  });
});
