import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const watchlist = await prisma.watchlist.findMany({
    where: { userId: user.id },
    orderBy: { addedAt: "desc" },
  });

  return NextResponse.json(watchlist);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { symbol, name, type } = await request.json();

  if (!symbol || !name) {
    return NextResponse.json({ error: "Symbol and name required" }, { status: 400 });
  }

  try {
    const item = await prisma.watchlist.create({
      data: {
        userId: user.id,
        symbol: symbol.toUpperCase(),
        name,
        type: type || "stock",
      },
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Already in watchlist" }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  await prisma.watchlist.deleteMany({
    where: { userId: user.id, symbol: symbol.toUpperCase() },
  });

  return NextResponse.json({ success: true });
}
