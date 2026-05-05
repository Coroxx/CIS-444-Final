"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { Trophy, Medal, TrendingUp, TrendingDown } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rankColors: Record<number, string> = {
    1: "text-amber",
    2: "text-[oklch(0.7_0.01_264)]",
    3: "text-[oklch(0.6_0.1_50)]",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Top traders ranked by portfolio value
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No traders yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sign up and start trading to appear here!
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[50px_1fr_120px_100px_60px] gap-4 px-4 py-2.5 border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Rank</span>
            <span>Trader</span>
            <span className="text-right">Portfolio</span>
            <span className="text-right">P&L</span>
            <span className="text-right">Trades</span>
          </div>
          {entries.map((entry) => {
            const isCurrentUser = user?.displayName === entry.displayName;
            const isPos = entry.pnl >= 0;
            return (
              <div
                key={entry.rank}
                className={`grid grid-cols-[50px_1fr_120px_100px_60px] gap-4 px-4 py-3 border-b border-border/20 last:border-b-0 transition-colors ${
                  isCurrentUser
                    ? "bg-cyan/5 border-l-2 border-l-cyan"
                    : "hover:bg-secondary/20"
                }`}
              >
                <span className="flex items-center gap-1">
                  {entry.rank <= 3 ? (
                    <Medal
                      className={`h-5 w-5 ${rankColors[entry.rank] || ""}`}
                    />
                  ) : (
                    <span className="text-sm font-mono text-muted-foreground pl-0.5">
                      {entry.rank}
                    </span>
                  )}
                </span>
                <span className="text-sm font-medium truncate">
                  {entry.displayName}
                  {isCurrentUser && (
                    <span className="text-xs text-cyan ml-1">(you)</span>
                  )}
                </span>
                <span className="text-sm font-mono text-right">
                  ${entry.portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-sm font-mono text-right flex items-center justify-end gap-0.5 ${
                    isPos ? "text-gain" : "text-loss"
                  }`}
                >
                  {isPos ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPos ? "+" : ""}
                  {entry.pnlPercent}%
                </span>
                <span className="text-sm font-mono text-right text-muted-foreground">
                  {entry.tradesCount}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
