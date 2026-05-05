import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(
  token: string
): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(
  token: string
): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      balance: true,
      createdAt: true,
    },
  });

  return user;
}

export function setAuthCookies(
  accessToken: string,
  refreshToken: string
): { name: string; value: string; options: Record<string, unknown> }[] {
  const shared = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  return [
    {
      name: "access_token",
      value: accessToken,
      options: { ...shared, maxAge: 15 * 60 },
    },
    {
      name: "refresh_token",
      value: refreshToken,
      options: { ...shared, maxAge: 7 * 24 * 60 * 60 },
    },
  ];
}
