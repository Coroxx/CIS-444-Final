"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Trophy,
  AlertOctagon,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";

interface Holding {
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
}

interface AllocationSlice {
  name: string;
  value: number;
  percent: number;
}

interface Analytics {
  portfolioValue: number;
  cash: number;
  holdingsValue: number;
  totalTrades: number;
  totalSells: number;
  winRate: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  bestTrade: { symbol: string; pnl: number } | null;
  worstTrade: { symbol: string; pnl: number } | null;
  holdings: Holding[];
  allocation: AllocationSlice[];
}

const PALETTE = [
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#a78bfa",
  "#ef4444",
  "#84cc16",
  "#ec4899",
  "#06b6d4",
];

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/portfolio/analytics", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  const isPositive = data.totalPnl >= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PieIcon className="h-6 w-6 text-cyan" />
          Portfolio Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Allocation, P&amp;L breakdown, and trade performance
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Portfolio value"
          value={`$${fmt(data.portfolioValue)}`}
          accent="text-foreground"
          icon={<Activity className="h-4 w-4 text-cyan" />}
        />
        <StatCard
          label="Total P&L"
          value={`${isPositive ? "+" : ""}$${fmt(data.totalPnl)}`}
          accent={isPositive ? "text-gain" : "text-loss"}
          icon={
            isPositive ? (
              <TrendingUp className="h-4 w-4 text-gain" />
            ) : (
              <TrendingDown className="h-4 w-4 text-loss" />
            )
          }
        />
        <StatCard
          label="Win rate"
          value={`${data.winRate.toFixed(1)}%`}
          accent="text-amber"
          icon={<Trophy className="h-4 w-4 text-amber" />}
          sub={`${data.totalSells} sells`}
        />
        <StatCard
          label="Total trades"
          value={String(data.totalTrades)}
          accent="text-foreground"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Allocation
          </h3>
          {data.allocation.every((a) => a.value === 0) ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No data yet — execute a trade to populate allocation.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.allocation}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {data.allocation.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`$${fmt(Number(val))}`, String(name)]}
                    contentStyle={{
                      background: "oklch(0.18 0.02 264)",
                      border: "1px solid oklch(0.3 0.02 264)",
                      borderRadius: 8,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            P&amp;L per holding
          </h3>
          {data.holdings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No open positions.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.holdings}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.22 0.02 264)"
                  />
                  <XAxis
                    dataKey="symbol"
                    tick={{ fill: "oklch(0.6 0.01 264)", fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.6 0.01 264)", fontSize: 11 }}
                    tickFormatter={(v) => `$${v.toFixed(0)}`}
                  />
                  <Tooltip
                    formatter={(v) => `$${fmt(Number(v))}`}
                    contentStyle={{
                      background: "oklch(0.18 0.02 264)",
                      border: "1px solid oklch(0.3 0.02 264)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="totalPnl">
                    {data.holdings.map((h, i) => (
                      <Cell
                        key={i}
                        fill={h.totalPnl >= 0 ? "#10b981" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TradeHighlight
          label="Best realized trade"
          accent="text-gain"
          icon={<Trophy className="h-4 w-4 text-gain" />}
          trade={data.bestTrade}
        />
        <TradeHighlight
          label="Worst realized trade"
          accent="text-loss"
          icon={<AlertOctagon className="h-4 w-4 text-loss" />}
          trade={data.worstTrade}
        />
      </div>

      {data.holdings.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-border/50">
                <th className="text-left px-4 py-3">Symbol</th>
                <th className="text-right px-4 py-3">Qty</th>
                <th className="text-right px-4 py-3">Avg cost</th>
                <th className="text-right px-4 py-3">Last price</th>
                <th className="text-right px-4 py-3">Market value</th>
                <th className="text-right px-4 py-3">Unrealized P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {data.holdings.map((h) => (
                <tr
                  key={h.symbol}
                  className="border-b border-border/20 last:border-b-0"
                >
                  <td className="px-4 py-3 font-mono font-semibold">
                    {h.symbol}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {h.quantity.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    ${fmt(h.avgCost)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    ${fmt(h.currentPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    ${fmt(h.marketValue)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      h.unrealizedPnl >= 0 ? "text-gain" : "text-loss"
                    }`}
                  >
                    {h.unrealizedPnl >= 0 ? "+" : ""}${fmt(h.unrealizedPnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      <div className="flex items-center justify-between text-xs uppercase text-muted-foreground tracking-wider">
        <span>{label}</span>
        {icon}
      </div>
      <p className={`text-xl font-mono font-bold mt-2 ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function TradeHighlight({
  label,
  trade,
  accent,
  icon,
}: {
  label: string;
  trade: { symbol: string; pnl: number } | null;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground tracking-wider">
          {icon}
          {label}
        </div>
        <p className="text-lg font-mono font-bold mt-2">
          {trade ? trade.symbol : "—"}
        </p>
      </div>
      <p className={`text-xl font-mono font-bold ${accent}`}>
        {trade ? `${trade.pnl >= 0 ? "+" : ""}$${fmt(trade.pnl)}` : "—"}
      </p>
    </div>
  );
}
