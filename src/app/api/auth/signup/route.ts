import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from "@/lib/auth";
import {
  consumeRateLimit,
  rateLimitResponse,
  withRateLimitHeaders,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rl = consumeRateLimit(request, { keyPrefix: "signup", limit: 3 });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: "Email, password, and display name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, displayName },
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        balance: user.balance,
        createdAt: user.createdAt.toISOString(),
      },
    });

    for (const c of setAuthCookies(accessToken, refreshToken)) {
      res.cookies.set(c.name, c.value, c.options as Record<string, unknown>);
    }

    return withRateLimitHeaders(res, rl.remaining);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
