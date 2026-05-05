import { NextResponse } from "next/server";
import {
  getCryptoHistory,
  getCryptoMarkets,
  getCryptoPrice,
} from "@/lib/api/coingecko";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: raw } = await context.params;
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? 30);

  let coinId = raw.toLowerCase();
  const markets = await getCryptoMarkets();
  const exactId = markets.find((m) => m.id === coinId);
  if (!exactId) {
    const bySymbol = markets.find((m) => m.symbol.toLowerCase() === coinId);
    if (bySymbol) coinId = bySymbol.id;
  }

  const [quote, history] = await Promise.all([
    getCryptoPrice(coinId),
    getCryptoHistory(coinId, Number.isFinite(days) && days > 0 ? days : 30),
  ]);

  return NextResponse.json({ quote, history });
}
