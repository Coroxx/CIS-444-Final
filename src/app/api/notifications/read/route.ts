import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return NextResponse.json({ success: true });
}
