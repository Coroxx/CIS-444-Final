import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("refresh_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    const accessToken = signAccessToken(payload.userId);
    const refreshToken = signRefreshToken(payload.userId);

    const res = NextResponse.json({ success: true });

    for (const c of setAuthCookies(accessToken, refreshToken)) {
      res.cookies.set(c.name, c.value, c.options as Record<string, unknown>);
    }

    return res;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
