import { NextResponse } from "next/server";
import { getStockQuote } from "@/lib/api/yahoo-finance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const quote = await getStockQuote(symbol);
  return NextResponse.json(quote);
}
