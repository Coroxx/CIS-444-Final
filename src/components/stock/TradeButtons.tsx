"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { StockQuote } from "@/types";

interface TradeButtonsProps {
  quote: StockQuote;
}

export function TradeButtons({ quote }: TradeButtonsProps) {
  const { user, checkAuth } = useAuthStore();
  const [tradeType, setTradeType] = useState<"BUY" | "SELL" | null>(null);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const qty = parseFloat(quantity) || 0;
  const total = qty * quote.price;

  const handleTrade = async () => {
    if (qty <= 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: quote.symbol,
          type: tradeType,
          quantity: qty,
          price: quote.price,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Trade failed");
        return;
      }

      toast.success(
        `${tradeType} ${qty} ${quote.symbol} at $${quote.price.toFixed(2)}`
      );
      setTradeType(null);
      setQuantity("");
      checkAuth();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setTradeType("BUY")}
          className="flex-1 bg-gain hover:bg-gain/90 text-white font-semibold"
        >
          BUY
        </Button>
        <Button
          onClick={() => setTradeType("SELL")}
          className="flex-1 bg-loss hover:bg-loss/90 text-white font-semibold"
        >
          SELL
        </Button>
      </div>

      <Dialog open={tradeType !== null} onOpenChange={() => setTradeType(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                  tradeType === "BUY" ? "bg-gain" : "bg-loss"
                }`}
              >
                {tradeType}
              </span>
              <span className="font-mono">{quote.symbol}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Price</p>
              <p className="text-2xl font-mono font-bold">
                ${quote.price.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Quantity
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="font-mono text-lg h-12"
                autoFocus
              />
            </div>

            <div className="flex justify-between items-center py-3 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-mono font-bold text-amber">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Available balance</span>
              <span className="font-mono">
                ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <Button
              onClick={handleTrade}
              disabled={qty <= 0 || loading}
              className={`w-full font-semibold ${
                tradeType === "BUY"
                  ? "bg-gain hover:bg-gain/90"
                  : "bg-loss hover:bg-loss/90"
              } text-white`}
            >
              {loading
                ? "Processing..."
                : `${tradeType} ${qty > 0 ? qty : ""} ${quote.symbol}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
