import { NextResponse } from "next/server";
import { getStockQuote } from "@/lib/api/yahoo-finance";
import { TRENDING_SYMBOLS } from "@/lib/mock-data";

export async function GET() {
  const quotes = await Promise.all(
    TRENDING_SYMBOLS.map((symbol) => getStockQuote(symbol))
  );
  return NextResponse.json(quotes);
}
