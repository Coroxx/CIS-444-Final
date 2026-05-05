import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
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
  const rl = consumeRateLimit(request, { keyPrefix: "login", limit: 5 });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

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
