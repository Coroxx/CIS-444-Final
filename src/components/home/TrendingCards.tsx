"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { StockQuote } from "@/types";

export function TrendingCards() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stocks/trending")
      .then((r) => r.json())
      .then(setStocks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stocks.map((stock) => {
        const isPositive = stock.change >= 0;
        return (
          <Link
            key={stock.symbol}
            href={`/stock/${stock.symbol}`}
            className={`group relative overflow-hidden rounded-xl border p-4 transition-all hover:scale-[1.02] ${
              isPositive
                ? "border-gain/20 hover:border-gain/40 hover:glow-gain"
                : "border-loss/20 hover:border-loss/40 hover:glow-loss"
            } bg-card`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold font-mono">{stock.symbol}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                  {stock.name}
                </p>
              </div>
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  isPositive ? "bg-gain/10" : "bg-loss/10"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-gain" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-loss" />
                )}
              </div>
            </div>
            <p className="text-lg font-bold font-mono">
              ${stock.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p
              className={`text-xs font-mono font-medium ${
                isPositive ? "text-gain" : "text-loss"
              }`}
            >
              {isPositive ? "+" : ""}
              {stock.changePercent.toFixed(2)}%
            </p>

            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                isPositive
                  ? "bg-gradient-to-t from-gain/5 to-transparent"
                  : "bg-gradient-to-t from-loss/5 to-transparent"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
}
