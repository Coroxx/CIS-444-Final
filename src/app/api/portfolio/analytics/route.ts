import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getStockQuote } from "@/lib/api/yahoo-finance";

type TradeRow = {
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  total: number;
  createdAt: Date;
};

type HoldingAgg = {
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
};

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trades: TradeRow[] = await prisma.trade.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: {
      symbol: true,
      type: true,
      quantity: true,
      price: true,
      total: true,
      createdAt: true,
    },
  });

  const positions = new Map<
    string,
    { qty: number; costBasis: number; realizedPnl: number }
  >();

  let bestTradePnl = 0;
  let worstTradePnl = 0;
  let bestTradeSymbol = "";
  let worstTradeSymbol = "";
  let winningSells = 0;
  let totalSells = 0;

  for (const t of trades) {
    const p = positions.get(t.symbol) ?? {
      qty: 0,
      costBasis: 0,
      realizedPnl: 0,
    };

    if (t.type === "BUY") {
      p.costBasis += t.total;
      p.qty += t.quantity;
    } else {
      const avgCost = p.qty > 0 ? p.costBasis / p.qty : 0;
      const tradePnl = (t.price - avgCost) * t.quantity;
      p.realizedPnl += tradePnl;
      p.costBasis -= avgCost * t.quantity;
      p.qty -= t.quantity;
      totalSells += 1;
      if (tradePnl > 0) winningSells += 1;
      if (tradePnl > bestTradePnl) {
        bestTradePnl = tradePnl;
        bestTradeSymbol = t.symbol;
      }
      if (tradePnl < worstTradePnl) {
        worstTradePnl = tradePnl;
        worstTradeSymbol = t.symbol;
      }
    }

    positions.set(t.symbol, p);
  }

  const heldSymbols = Array.from(positions.entries()).filter(
    ([, p]) => p.qty > 0.0000001
  );

  const holdings: HoldingAgg[] = await Promise.all(
    heldSymbols.map(async ([symbol, p]) => {
      const quote = await getStockQuote(symbol);
      const avgCost = p.qty > 0 ? p.costBasis / p.qty : 0;
      const marketValue = p.qty * quote.price;
      const unrealized = (quote.price - avgCost) * p.qty;
      return {
        symbol,
        quantity: p.qty,
        avgCost,
        currentPrice: quote.price,
        marketValue,
        realizedPnl: p.realizedPnl,
        unrealizedPnl: unrealized,
        totalPnl: p.realizedPnl + unrealized,
      };
    })
  );

  const holdingsValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const portfolioValue = user.balance + holdingsValue;
  const totalRealized = Array.from(positions.values()).reduce(
    (s, p) => s + p.realizedPnl,
    0
  );
  const totalUnrealized = holdings.reduce((s, h) => s + h.unrealizedPnl, 0);

  const allocation = [
    {
      name: "Cash",
      value: user.balance,
      percent: portfolioValue > 0 ? (user.balance / portfolioValue) * 100 : 100,
    },
    ...holdings.map((h) => ({
      name: h.symbol,
      value: h.marketValue,
      percent: portfolioValue > 0 ? (h.marketValue / portfolioValue) * 100 : 0,
    })),
  ];

  return NextResponse.json({
    portfolioValue,
    cash: user.balance,
    holdingsValue,
    totalTrades: trades.length,
    totalSells,
    winRate: totalSells > 0 ? (winningSells / totalSells) * 100 : 0,
    realizedPnl: totalRealized,
    unrealizedPnl: totalUnrealized,
    totalPnl: totalRealized + totalUnrealized,
    bestTrade: bestTradeSymbol
      ? { symbol: bestTradeSymbol, pnl: bestTradePnl }
      : null,
    worstTrade: worstTradeSymbol
      ? { symbol: worstTradeSymbol, pnl: worstTradePnl }
      : null,
    holdings,
    allocation,
  });
}
