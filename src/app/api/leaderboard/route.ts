import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCached, setCache, TTL } from "@/lib/cache";
import { getStockQuote } from "@/lib/api/yahoo-finance";
import type { LeaderboardEntry } from "@/types";

export async function GET() {
  const cacheKey = "leaderboard";
  const cached = getCached<LeaderboardEntry[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      balance: true,
      trades: {
        select: { symbol: true, type: true, quantity: true },
      },
      _count: { select: { trades: true } },
    },
  });

  const entries: LeaderboardEntry[] = await Promise.all(
    users.map(async (u) => {
      const holdingsMap: Record<string, number> = {};
      for (const trade of u.trades) {
        if (!holdingsMap[trade.symbol]) holdingsMap[trade.symbol] = 0;
        if (trade.type === "BUY") {
          holdingsMap[trade.symbol] += trade.quantity;
        } else {
          holdingsMap[trade.symbol] -= trade.quantity;
        }
      }

      let holdingsValue = 0;
      const activeHoldings = Object.entries(holdingsMap).filter(([, qty]) => qty > 0);
      await Promise.all(
        activeHoldings.map(async ([symbol, qty]) => {
          try {
            const quote = await getStockQuote(symbol);
            holdingsValue += qty * quote.price;
          } catch {}
        })
      );

      const portfolioValue = u.balance + holdingsValue;
      const pnl = portfolioValue - 10000;

      return {
        rank: 0,
        displayName: u.displayName,
        portfolioValue: Number(portfolioValue.toFixed(2)),
        pnl: Number(pnl.toFixed(2)),
        pnlPercent: Number(((pnl / 10000) * 100).toFixed(2)),
        tradesCount: u._count.trades,
      };
    })
  );

  entries.sort((a, b) => b.portfolioValue - a.portfolioValue);
  entries.forEach((e, i) => (e.rank = i + 1));

  setCache(cacheKey, entries, TTL.LEADERBOARD);
  return NextResponse.json(entries);
}
