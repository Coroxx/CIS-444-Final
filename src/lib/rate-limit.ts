import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
  keyPrefix?: string;
}

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function consumeRateLimit(
  request: Request,
  options: RateLimitOptions = {}
): { ok: boolean; remaining: number; resetAt: number } {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60_000;
  const ip = getClientIp(request);
  const key = `${options.keyPrefix ?? "rl"}:${ip}`;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  const ok = bucket.count <= limit;
  return { ok, remaining, resetAt: bucket.resetAt };
}

export function rateLimitResponse(
  resetAt: number
): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

export function withRateLimitHeaders<T>(
  response: NextResponse<T>,
  remaining: number
): NextResponse<T> {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}

export function resetRateLimitForTest() {
  buckets.clear();
}
