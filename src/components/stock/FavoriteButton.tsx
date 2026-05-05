"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface FavoriteButtonProps {
  symbol: string;
  name: string;
  type?: "stock" | "crypto";
}

export function FavoriteButton({ symbol, name, type = "stock" }: FavoriteButtonProps) {
  const { user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setIsFavorite(data.some((w: { symbol: string }) => w.symbol === symbol.toUpperCase()));
        }
      })
      .catch(() => {});
  }, [user, symbol]);

  if (!user) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      if (isFavorite) {
        await fetch(`/api/watchlist?symbol=${symbol}`, { method: "DELETE" });
        setIsFavorite(false);
        toast.success(`${symbol} removed from watchlist`);
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol, name, type }),
        });
        setIsFavorite(true);
        toast.success(`${symbol} added to watchlist`);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="group p-2 rounded-lg hover:bg-secondary transition-colors"
      title={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Star
        className={`h-5 w-5 transition-all ${
          isFavorite
            ? "fill-amber text-amber"
            : "text-muted-foreground group-hover:text-amber"
        }`}
      />
    </button>
  );
}
