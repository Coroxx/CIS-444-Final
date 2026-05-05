import { NextResponse } from "next/server";
import { getFinancialNews } from "@/lib/api/newsapi";

export async function GET() {
  const news = await getFinancialNews();
  return NextResponse.json(news);
}
