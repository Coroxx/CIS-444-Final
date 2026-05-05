import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(trades);
}

export async function POST(request: Request) {
  const rl = consumeRateLimit(request, { keyPrefix: "trade", limit: 20 });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { symbol, type, quantity, price } = await request.json();

  if (!symbol || !type || !quantity || !price) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (type !== "BUY" && type !== "SELL") {
    return NextResponse.json({ error: "Invalid trade type" }, { status: 400 });
  }

  if (quantity <= 0 || price <= 0) {
    return NextResponse.json({ error: "Invalid quantity or price" }, { status: 400 });
  }

  const total = quantity * price;

  if (type === "BUY") {
    if (user.balance < total) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const [trade] = await prisma.$transaction([
      prisma.trade.create({
        data: { userId: user.id, symbol, type, quantity, price, total },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: total } },
      }),
    ]);

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    return NextResponse.json({ trade, balance: updated?.balance });
  }

  const buys = await prisma.trade.aggregate({
    where: { userId: user.id, symbol, type: "BUY" },
    _sum: { quantity: true },
  });
  const sells = await prisma.trade.aggregate({
    where: { userId: user.id, symbol, type: "SELL" },
    _sum: { quantity: true },
  });

  const holdings = (buys._sum.quantity || 0) - (sells._sum.quantity || 0);

  if (holdings < quantity) {
    return NextResponse.json(
      { error: `Insufficient holdings. You own ${holdings} shares of ${symbol}` },
      { status: 400 }
    );
  }

  const [trade] = await prisma.$transaction([
    prisma.trade.create({
      data: { userId: user.id, symbol, type, quantity, price, total },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: total } },
    }),
  ]);

  const updated = await prisma.user.findUnique({
    where: { id: user.id },
    select: { balance: true },
  });

  return NextResponse.json({ trade, balance: updated?.balance });
}
