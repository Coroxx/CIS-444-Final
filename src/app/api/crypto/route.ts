import { NextResponse } from "next/server";
import { getCryptoMarkets } from "@/lib/api/coingecko";

export async function GET() {
  const markets = await getCryptoMarkets();
  return NextResponse.json(markets);
}
