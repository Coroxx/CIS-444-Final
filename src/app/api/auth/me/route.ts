import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  getAuthUser,
  hashPassword,
} from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      balance: user.balance,
      createdAt: user.createdAt.toISOString(),
    },
  });
}

export async function PATCH(request: Request) {
  const authed = await getAuthUser();
  if (!authed) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { displayName, currentPassword, newPassword } = await request.json();
  const updates: { displayName?: string; password?: string } = {};

  if (typeof displayName === "string" && displayName.trim().length > 0) {
    updates.displayName = displayName.trim().slice(0, 40);
  }

  if (newPassword) {
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password required" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({ where: { id: authed.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const ok = await comparePassword(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Current password incorrect" },
        { status: 403 }
      );
    }
    updates.password = await hashPassword(newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No changes provided" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: authed.id },
    data: updates,
    select: {
      id: true,
      email: true,
      displayName: true,
      balance: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    user: { ...updated, createdAt: updated.createdAt.toISOString() },
  });
}

export async function DELETE() {
  const authed = await getAuthUser();
  if (!authed) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: authed.id } });

  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  return NextResponse.json({ success: true });
}
