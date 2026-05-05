"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StockChart } from "@/components/stock/StockChart";
import { TimeframeSelector } from "@/components/stock/TimeframeSelector";
import { StockInfoCards } from "@/components/stock/StockInfoCards";
import { TradeButtons } from "@/components/stock/TradeButtons";
import { FavoriteButton } from "@/components/stock/FavoriteButton";
import { AlertButton } from "@/components/stock/AlertButton";
import type { StockQuote, TimeSeriesPoint } from "@/types";

const KNOWN_CRYPTO_TICKERS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  XRP: "ripple",
  BNB: "binancecoin",
  USDC: "usd-coin",
  SOL: "solana",
  TRX: "tron",
  DOGE: "dogecoin",
  ADA: "cardano",
  WBT: "whitebit",
  HYPE: "hyperliquid",
  LEO: "leo-token",
  BCH: "bitcoin-cash",
  XMR: "monero",
  ZEC: "zcash",
  LINK: "chainlink",
  CC: "canton-network",
};

export default function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const router = useRouter();
  const { symbol } = use(params);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [timeframe, setTimeframe] = useState("1mo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const upper = symbol.toUpperCase();
    const cryptoId = KNOWN_CRYPTO_TICKERS[upper];
    if (cryptoId) {
      router.replace(`/crypto/${cryptoId}`);
      return;
    }
    setLoading(true);
    fetch(`/api/stocks?symbol=${symbol}`)
      .then((r) => r.json())
      .then(setQuote)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [symbol, router]);

  useEffect(() => {
    fetch(`/api/stocks/timeseries?symbol=${symbol}&period=${timeframe}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTimeSeries(data);
      })
      .catch(() => setTimeSeries([]));
  }, [symbol, timeframe]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-muted-foreground">
          Symbol not found
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Could not find data for &ldquo;{symbol}&rdquo;
        </p>
      </div>
    );
  }

  const isPositive = quote.change >= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{quote.name}</h1>
            <FavoriteButton symbol={quote.symbol} name={quote.name} />
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {quote.symbol}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold font-mono">
            ${quote.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <div
            className={`flex items-center gap-1 justify-end ${
              isPositive ? "text-gain" : "text-loss"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-mono font-medium">
              {isPositive ? "+" : ""}
              {quote.change.toFixed(2)} ({isPositive ? "+" : ""}
              {quote.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-4">
        <TimeframeSelector active={timeframe} onChange={setTimeframe} />
        <StockChart data={timeSeries} isPositive={isPositive} />
      </div>

      <StockInfoCards quote={quote} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-auto sm:max-w-xs sm:flex-1">
          <TradeButtons quote={quote} />
        </div>
        <AlertButton symbol={quote.symbol} currentPrice={quote.price} />
      </div>
    </div>
  );
}
