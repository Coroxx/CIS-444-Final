import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(alerts);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const symbol = body.symbol?.toString().toUpperCase();
  const targetPrice = Number(body.targetPrice);
  const direction = body.direction === "below" ? "below" : "above";
  const type = body.type === "crypto" ? "crypto" : "stock";

  if (!symbol || !Number.isFinite(targetPrice) || targetPrice <= 0) {
    return NextResponse.json(
      { error: "symbol and positive targetPrice required" },
      { status: 400 }
    );
  }

  const alert = await prisma.priceAlert.create({
    data: { userId: user.id, symbol, targetPrice, direction, type },
  });
  return NextResponse.json(alert);
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.priceAlert.deleteMany({
    where: { id, userId: user.id },
  });
  return NextResponse.json({ success: true });
}
