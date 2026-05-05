"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { WatchlistItem } from "@/types";

export default function WatchlistPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => setWatchlist(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const removeFromWatchlist = async (symbol: string) => {
    try {
      await fetch(`/api/watchlist?symbol=${symbol}`, { method: "DELETE" });
      setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
      toast.success(`${symbol} removed from watchlist`);
    } catch {
      toast.error("Failed to remove");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-amber" />
          Watchlist
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your starred stocks and crypto
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : watchlist.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No stocks in your watchlist yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Search and star stocks to add them here
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold mt-4 bg-cyan text-navy hover:bg-cyan/90 transition-colors"
          >
            Browse stocks
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          {watchlist.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-4 border-b border-border/20 last:border-b-0 hover:bg-secondary/20 transition-colors"
            >
              <Link
                href={
                  item.type === "crypto"
                    ? `/crypto/${item.symbol.toLowerCase()}`
                    : `/stock/${item.symbol}`
                }
                className="flex items-center gap-3 flex-1"
              >
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-xs font-bold font-mono">
                    {item.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold font-mono">
                    {item.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  {item.type}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromWatchlist(item.symbol)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-loss"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
