import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getStockQuote } from "@/lib/api/yahoo-finance";
import { getCryptoMarkets, getCryptoPrice } from "@/lib/api/coingecko";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    where: { userId: user.id },
    select: { symbol: true, type: true, quantity: true },
  });

  const holdingsMap: Record<string, number> = {};
  for (const trade of trades) {
    if (!holdingsMap[trade.symbol]) holdingsMap[trade.symbol] = 0;
    if (trade.type === "BUY") {
      holdingsMap[trade.symbol] += trade.quantity;
    } else {
      holdingsMap[trade.symbol] -= trade.quantity;
    }
  }

  const activeHoldings = Object.entries(holdingsMap).filter(
    ([, qty]) => qty > 0
  );

  const cryptoMarkets = await getCryptoMarkets();
  const cryptoBySymbol = new Map(
    cryptoMarkets.map((m) => [m.symbol.toUpperCase(), m])
  );

  let holdingsValue = 0;
  const holdings: {
    symbol: string;
    quantity: number;
    price: number;
    value: number;
    type: "stock" | "crypto";
    id?: string;
  }[] = [];

  await Promise.all(
    activeHoldings.map(async ([symbol, quantity]) => {
      const cryptoMatch = cryptoBySymbol.get(symbol.toUpperCase());
      if (cryptoMatch) {
        const quote = await getCryptoPrice(cryptoMatch.id);
        const value = quantity * quote.price;
        holdingsValue += value;
        holdings.push({
          symbol,
          quantity,
          price: quote.price,
          value,
          type: "crypto",
          id: cryptoMatch.id,
        });
      } else {
        const quote = await getStockQuote(symbol);
        const value = quantity * quote.price;
        holdingsValue += value;
        holdings.push({
          symbol,
          quantity,
          price: quote.price,
          value,
          type: "stock",
        });
      }
    })
  );

  const portfolioValue = user.balance + holdingsValue;
  const pnl = portfolioValue - 10000;
  const pnlPercent = (pnl / 10000) * 100;

  return NextResponse.json({
    cash: user.balance,
    holdingsValue,
    portfolioValue,
    pnl,
    pnlPercent,
    holdings,
  });
}
