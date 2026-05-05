"use client";

const TIMEFRAMES = [
  { key: "1d", label: "1D" },
  { key: "1w", label: "1W" },
  { key: "1mo", label: "1M" },
  { key: "3mo", label: "3M" },
  { key: "1y", label: "1Y" },
  { key: "5y", label: "5Y" },
];

interface TimeframeSelectorProps {
  active: string;
  onChange: (tf: string) => void;
}

export function TimeframeSelector({ active, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex gap-1 bg-secondary/30 rounded-lg p-1">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.key}
          onClick={() => onChange(tf.key)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            active === tf.key
              ? "bg-cyan text-navy"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
