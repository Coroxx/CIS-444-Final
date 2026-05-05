"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, BarChart3, Bitcoin } from "lucide-react";
import type { StockQuote, CryptoMarket } from "@/types";
import { MOCK_STOCKS } from "@/lib/mock-data";

export default function MarketsPage() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [crypto, setCrypto] = useState<CryptoMarket[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingCrypto, setLoadingCrypto] = useState(true);

  useEffect(() => {
    const symbols = Object.keys(MOCK_STOCKS);
    Promise.all(
      symbols.map((s) =>
        fetch(`/api/stocks?symbol=${s}`)
          .then((r) => r.json())
          .catch(() => MOCK_STOCKS[s])
      )
    )
      .then(setStocks)
      .finally(() => setLoadingStocks(false));

    fetch("/api/crypto")
      .then((r) => r.json())
      .then(setCrypto)
      .catch(() => {})
      .finally(() => setLoadingCrypto(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-cyan" />
          Markets
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse stocks and cryptocurrencies
        </p>
      </div>

      <Tabs defaultValue="stocks">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="stocks" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Stocks
          </TabsTrigger>
          <TabsTrigger value="crypto" className="gap-1.5">
            <Bitcoin className="h-3.5 w-3.5" />
            Crypto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stocks" className="mt-4">
          {loadingStocks ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-xl overflow-x-auto">
              <div className="min-w-[560px] grid grid-cols-[1fr_1fr_100px_100px] gap-4 px-4 py-2.5 border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Symbol</span>
                <span>Name</span>
                <span className="text-right">Price</span>
                <span className="text-right">Change</span>
              </div>
              {stocks.map((stock) => {
                const isPos = stock.change >= 0;
                return (
                  <Link
                    key={stock.symbol}
                    href={`/stock/${stock.symbol}`}
                    className="min-w-[560px] grid grid-cols-[1fr_1fr_100px_100px] gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors border-b border-border/20 last:border-b-0"
                  >
                    <span className="font-mono font-semibold text-sm">
                      {stock.symbol}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">
                      {stock.name}
                    </span>
                    <span className="text-sm font-mono text-right">
                      ${stock.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm font-mono text-right flex items-center justify-end gap-1 ${
                        isPos ? "text-gain" : "text-loss"
                      }`}
                    >
                      {isPos ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {isPos ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="crypto" className="mt-4">
          {loadingCrypto ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-xl overflow-x-auto">
              <div className="min-w-[660px] grid grid-cols-[36px_32px_1fr_1fr_100px_100px] gap-4 px-4 py-2.5 border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>#</span>
                <span></span>
                <span>Name</span>
                <span>Symbol</span>
                <span className="text-right">Price</span>
                <span className="text-right">24h</span>
              </div>
              {crypto.map((coin) => {
                const isPos = coin.priceChangePercent24h >= 0;
                return (
                  <Link
                    key={coin.id}
                    href={`/crypto/${coin.id}`}
                    className="min-w-[660px] grid grid-cols-[36px_32px_1fr_1fr_100px_100px] gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors border-b border-border/20 last:border-b-0 items-center"
                  >
                    <span className="text-xs text-muted-foreground">
                      {coin.rank}
                    </span>
                    <span>
                      {coin.image ? (
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : null}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {coin.name}
                    </span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {coin.symbol}
                    </span>
                    <span className="text-sm font-mono text-right">
                      ${coin.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`text-sm font-mono text-right ${
                        isPos ? "text-gain" : "text-loss"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {coin.priceChangePercent24h.toFixed(2)}%
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
