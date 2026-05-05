import { describe, it, expect, beforeEach } from "vitest";
import {
  consumeRateLimit,
  rateLimitResponse,
  resetRateLimitForTest,
} from "../rate-limit";

function req(ip = "1.2.3.4"): Request {
  return new Request("http://x.test/", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimitForTest();
  });

  it("allows the first request and decrements remaining", () => {
    const { ok, remaining } = consumeRateLimit(req(), {
      keyPrefix: "t1",
      limit: 5,
    });
    expect(ok).toBe(true);
    expect(remaining).toBe(4);
  });

  it("blocks requests exceeding the limit", () => {
    for (let i = 0; i < 3; i += 1) {
      expect(consumeRateLimit(req(), { keyPrefix: "t2", limit: 3 }).ok).toBe(
        true
      );
    }
    const blocked = consumeRateLimit(req(), { keyPrefix: "t2", limit: 3 });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("isolates buckets by IP address", () => {
    consumeRateLimit(req("10.0.0.1"), { keyPrefix: "t3", limit: 2 });
    consumeRateLimit(req("10.0.0.1"), { keyPrefix: "t3", limit: 2 });
    const other = consumeRateLimit(req("10.0.0.2"), {
      keyPrefix: "t3",
      limit: 2,
    });
    expect(other.ok).toBe(true);
    expect(other.remaining).toBe(1);
  });

  it("isolates buckets by keyPrefix", () => {
    consumeRateLimit(req(), { keyPrefix: "login", limit: 1 });
    const signup = consumeRateLimit(req(), { keyPrefix: "signup", limit: 1 });
    expect(signup.ok).toBe(true);
  });

  it("returns a 429 response with a Retry-After header", () => {
    const res = rateLimitResponse(Date.now() + 30_000);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("handles missing forwarded-for header", () => {
    const plain = new Request("http://x.test/");
    const r = consumeRateLimit(plain, { keyPrefix: "t5", limit: 2 });
    expect(r.ok).toBe(true);
  });
});
