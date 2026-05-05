import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { checkAlerts } from "@/lib/alert-checker";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await checkAlerts(user.id);

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}
