import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET() {
  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { displayName: true } },
    },
  });

  const formatted = messages.reverse().map((m) => ({
    id: m.id,
    userId: m.userId,
    displayName: m.user.displayName,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  return NextResponse.json(formatted);
}

export async function POST(request: Request) {
  const rl = consumeRateLimit(request, { keyPrefix: "chat", limit: 30 });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      userId: user.id,
      content: content.trim(),
    },
  });

  return NextResponse.json({
    id: message.id,
    userId: message.userId,
    displayName: user.displayName,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  });
}
