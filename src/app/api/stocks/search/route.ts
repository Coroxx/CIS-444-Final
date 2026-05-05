import { NextResponse } from "next/server";
import { searchStocks } from "@/lib/api/yahoo-finance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 1) {
    return NextResponse.json([]);
  }

  const results = await searchStocks(q);
  return NextResponse.json(results);
}
