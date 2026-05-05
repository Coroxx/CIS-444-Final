import { NextResponse } from "next/server";
import { getStockTimeSeries } from "@/lib/api/yahoo-finance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const period = searchParams.get("period") || "1mo";

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const data = await getStockTimeSeries(symbol, period);
  return NextResponse.json(data);
}
