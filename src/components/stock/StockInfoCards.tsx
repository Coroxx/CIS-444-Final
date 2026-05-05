import type { StockQuote } from "@/types";

interface StockInfoCardsProps {
  quote: StockQuote;
}

export function StockInfoCards({ quote }: StockInfoCardsProps) {
  const stats = [
    { label: "Open", value: `$${quote.open.toFixed(2)}` },
    { label: "High", value: `$${quote.high.toFixed(2)}` },
    { label: "Low", value: `$${quote.low.toFixed(2)}` },
    {
      label: "Volume",
      value:
        quote.volume >= 1e9
          ? `${(quote.volume / 1e9).toFixed(1)}B`
          : quote.volume >= 1e6
          ? `${(quote.volume / 1e6).toFixed(1)}M`
          : quote.volume.toLocaleString(),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border border-border/50 rounded-lg p-3"
        >
          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
          <p className="text-sm font-mono font-semibold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
