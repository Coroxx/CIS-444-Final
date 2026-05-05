"use client";

import { useState } from "react";
import { BellPlus } from "lucide-react";
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

interface AlertButtonProps {
  symbol: string;
  currentPrice: number;
  type?: "stock" | "crypto";
}

export function AlertButton({
  symbol,
  currentPrice,
  type = "stock",
}: AlertButtonProps) {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(currentPrice.toFixed(2));
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    const targetPrice = parseFloat(target);
    if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, targetPrice, direction, type }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Failed to create alert");
        return;
      }
      toast.success(`Alert set for ${symbol} ${direction} $${targetPrice.toFixed(2)}`);
      setOpen(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-cyan/40 text-cyan hover:bg-cyan/10 hover:text-cyan"
      >
        <BellPlus className="h-4 w-4 mr-1.5" />
        Set Alert
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellPlus className="h-4 w-4 text-cyan" />
              <span>
                Set price alert —{" "}
                <span className="font-mono text-cyan">{symbol}</span>
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current price</p>
              <p className="text-xl font-mono font-bold">
                ${currentPrice.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Notify me when price goes
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDirection("above")}
                  className={`flex-1 h-10 rounded-md border text-sm font-medium transition ${
                    direction === "above"
                      ? "border-gain bg-gain/15 text-gain"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Above ▲
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("below")}
                  className={`flex-1 h-10 rounded-md border text-sm font-medium transition ${
                    direction === "below"
                      ? "border-loss bg-loss/15 text-loss"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Below ▼
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Target price
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="font-mono text-lg h-12"
                autoFocus
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-cyan text-navy font-semibold hover:bg-cyan/90"
            >
              {loading ? "Saving..." : "Create alert"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
