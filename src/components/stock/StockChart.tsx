"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesPoint } from "@/types";

interface StockChartProps {
  data: TimeSeriesPoint[];
  isPositive: boolean;
}

export function StockChart({ data, isPositive }: StockChartProps) {
  const color = isPositive ? "oklch(0.696 0.17 162.48)" : "oklch(0.637 0.237 15.163)";
  const gradientId = isPositive ? "gradientGain" : "gradientLoss";

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        No chart data available
      </div>
    );
  }

  return (
    <div className="h-[300px] sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "oklch(0.6 0.01 264)", fontSize: 11 }}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            minTickGap={40}
          />
          <YAxis
            domain={["auto", "auto"]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "oklch(0.6 0.01 264)", fontSize: 11 }}
            tickFormatter={(val) => `$${val.toFixed(0)}`}
            width={60}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as TimeSeriesPoint;
              return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                  <p className="text-xs text-muted-foreground mb-1">{d.date}</p>
                  <p className="text-sm font-mono font-semibold">
                    ${d.close.toFixed(2)}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      O: ${d.open.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      H: ${d.high.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      L: ${d.low.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      V: {(d.volume / 1e6).toFixed(1)}M
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 4,
              fill: color,
              stroke: "oklch(0.13 0.02 264)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
