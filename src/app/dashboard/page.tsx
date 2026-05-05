"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
} from "lucide-react";
import type { TradeRecord, WatchlistItem } from "@/types";

interface PortfolioData {
  cash: number;
  holdingsValue: number;
  portfolioValue: number;
  pnl: number;
  pnlPercent: number;
  holdings: {
    symbol: string;
    quantity: number;
    price: number;
    value: number;
    type?: "stock" | "crypto";
    id?: string;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/trades").then((r) => r.json()),
      fetch("/api/watchlist").then((r) => r.json()),
      fetch("/api/portfolio").then((r) => r.json()),
    ])
      .then(([t, w, p]) => {
        setTrades(Array.isArray(t) ? t : []);
        setWatchlist(Array.isArray(w) ? w : []);
        setPortfolio(p.portfolioValue !== undefined ? p : null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const pnl = portfolio?.pnl ?? 0;
  const pnlPercent = portfolio?.pnlPercent ?? 0;
  const isPnlPositive = pnl >= 0;
  const portfolioValue = portfolio?.portfolioValue ?? user.balance;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Wallet className="h-6 w-6 text-cyan" />
        Dashboard
      </h1>

      <div className="bg-card border border-border/50 rounded-xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Portfolio Value
            </p>
            <p className="text-3xl font-bold font-mono">
              ${portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Cash
            </p>
            <p className="text-xl font-semibold font-mono text-amber">
              ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Holdings
            </p>
            <p className="text-xl font-semibold font-mono text-cyan">
              ${(portfolio?.holdingsValue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              P&L
            </p>
            <div className={`flex items-center gap-1 ${isPnlPositive ? "text-gain" : "text-loss"}`}>
              {isPnlPositive ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
              <span className="text-xl font-semibold font-mono">
                {isPnlPositive ? "+" : ""}${pnl.toFixed(2)}
              </span>
              <span className="text-sm font-mono">
                ({isPnlPositive ? "+" : ""}{pnlPercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {portfolio && portfolio.holdings.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-cyan" />
              Holdings
            </h2>
          </div>
          <div>
            {portfolio.holdings.map((h) => (
              <Link
                key={h.symbol}
                href={
                  h.type === "crypto" && h.id
                    ? `/crypto/${h.id}`
                    : `/stock/${h.symbol}`
                }
                className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors border-b border-border/20 last:border-b-0"
              >
                <div>
                  <span className="text-sm font-mono font-semibold">{h.symbol}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {h.quantity} {h.type === "crypto" ? "coins" : "shares"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-semibold">
                    ${h.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    @ ${h.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <h2 className="text-sm font-semibold">My Watchlist</h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 rounded" />
              ))}
            </div>
          ) : watchlist.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No stocks in your watchlist.
              <br />
              <Link href="/" className="text-cyan hover:underline">
                Search and star stocks
              </Link>
            </div>
          ) : (
            <div>
              {watchlist.map((item) => (
                <Link
                  key={item.id}
                  href={
                    item.type === "crypto"
                      ? `/crypto/${item.symbol.toLowerCase()}`
                      : `/stock/${item.symbol}`
                  }
                  className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors border-b border-border/20 last:border-b-0"
                >
                  <div>
                    <span className="text-sm font-mono font-semibold">
                      {item.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {item.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <h2 className="text-sm font-semibold">Recent Trades</h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 rounded" />
              ))}
            </div>
          ) : trades.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No trades yet.
              <br />
              <Link href="/" className="text-cyan hover:underline">
                Visit a stock page to trade
              </Link>
            </div>
          ) : (
            <div>
              {trades.slice(0, 10).map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-border/20 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                        trade.type === "BUY" ? "bg-gain" : "bg-loss"
                      }`}
                    >
                      {trade.type}
                    </span>
                    <span className="text-sm font-mono font-semibold">
                      {trade.symbol}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">
                      {trade.quantity} @ ${trade.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      ${trade.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
