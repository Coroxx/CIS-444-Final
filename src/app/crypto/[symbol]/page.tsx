"use client";

import { useState, useEffect, use } from "react";
import { Bitcoin, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StockChart } from "@/components/stock/StockChart";
import { StockInfoCards } from "@/components/stock/StockInfoCards";
import { FavoriteButton } from "@/components/stock/FavoriteButton";
import { AlertButton } from "@/components/stock/AlertButton";
import { TradeButtons } from "@/components/stock/TradeButtons";
import type { StockQuote, TimeSeriesPoint } from "@/types";

const RANGES: { label: string; days: number }[] = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "5Y", days: 1825 },
];

export default function CryptoDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: id } = use(params);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<TimeSeriesPoint[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/crypto/${id}?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        setQuote(data.quote);
        setHistory(Array.isArray(data.history) ? data.history : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, days]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-muted-foreground">
          Crypto not found
        </p>
      </div>
    );
  }

  const isPositive = quote.change >= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            {quote.image ? (
              <img
                src={quote.image}
                alt={quote.name}
                className="h-7 w-7 rounded-full"
              />
            ) : (
              <Bitcoin className="h-5 w-5 text-amber" />
            )}
            <h1 className="text-2xl font-bold">{quote.name}</h1>
            <FavoriteButton
              symbol={quote.symbol}
              name={quote.name}
              type="crypto"
            />
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {quote.symbol} · CRYPTO
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
        <div className="inline-flex rounded-lg bg-secondary/40 p-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                days === r.days
                  ? "bg-cyan/15 text-cyan"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <StockChart data={history} isPositive={isPositive} />
      </div>

      <StockInfoCards quote={quote} />

      <TradeButtons quote={quote} />

      <div className="flex flex-wrap items-center gap-3">
        <AlertButton symbol={id} currentPrice={quote.price} type="crypto" />
      </div>
    </div>
  );
}
