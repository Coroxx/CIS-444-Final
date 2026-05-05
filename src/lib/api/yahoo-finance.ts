

import { getCached, setCache, TTL } from "@/lib/cache";
import {
  MOCK_STOCKS,
  MOCK_SEARCH_RESULTS,
  generateTimeSeries,
} from "@/lib/mock-data";
import type { StockQuote, TimeSeriesPoint, SearchResult } from "@/types";

const STOOQ_QUOTE = "https://stooq.com/q/l/";

const COMMON_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  Accept: "text/csv,*/*",
};

interface StooqRow {
  symbol: string;
  name: string;
  date: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

async function fetchStooqQuote(symbol: string): Promise<StooqRow> {
  const sym = symbol.toLowerCase();
  const url = `${STOOQ_QUOTE}?s=${sym}.us&f=snd2t2ohlcv&h&e=csv`;
  const res = await fetch(url, { headers: COMMON_HEADERS, next: { revalidate: TTL.STOCK_QUOTE } });
  if (!res.ok) throw new Error(`Stooq HTTP ${res.status}`);
  const csv = await res.text();
  const lines = csv.trim().split("\n");
  if (lines.length < 2) throw new Error("Stooq: no data");
  const cols = lines[1].split(",");
  if (cols.some((c) => c === "N/D")) throw new Error(`Stooq: N/D for ${symbol}`);
  return {
    symbol: cols[0],
    name: cols[1],
    date: cols[2],
    time: cols[3],
    open: parseFloat(cols[4]),
    high: parseFloat(cols[5]),
    low: parseFloat(cols[6]),
    close: parseFloat(cols[7]),
    volume: parseInt(cols[8], 10) || 0,
  };
}

export async function searchStocks(query: string): Promise<SearchResult[]> {

  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = getCached<SearchResult[]>(cacheKey);
  if (cached) return cached;

  const q = query.toLowerCase().trim();
  const results = MOCK_SEARCH_RESULTS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  ).slice(0, 8);
  setCache(cacheKey, results, TTL.SEARCH);
  return results;
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const cacheKey = `quote:${symbol.toUpperCase()}`;
  const cached = getCached<StockQuote>(cacheKey);
  if (cached) return cached;

  try {
    const row = await fetchStooqQuote(symbol);

    const change = +(row.close - row.open).toFixed(2);
    const changePercent = +((change / row.open) * 100).toFixed(2);
    const knownName =
      MOCK_STOCKS[symbol.toUpperCase()]?.name ?? toTitleCase(row.name);
    const knownCap = MOCK_STOCKS[symbol.toUpperCase()]?.marketCap;
    const quote: StockQuote = {
      symbol: symbol.toUpperCase(),
      name: knownName,
      price: row.close,
      open: row.open,
      high: row.high,
      low: row.low,
      volume: row.volume,
      change,
      changePercent,
      marketCap: knownCap,
    };
    setCache(cacheKey, quote, TTL.STOCK_QUOTE);
    return quote;
  } catch (err) {
    console.warn(`[stooq] quote(${symbol}) failed, using mock:`, err);
    const mock = MOCK_STOCKS[symbol.toUpperCase()];
    if (mock) return mock;
    return {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      price: 100,
      open: 99,
      high: 101,
      low: 98,
      volume: 1_000_000,
      change: 1,
      changePercent: 1,
    };
  }
}

const PERIOD_DAYS: Record<string, number> = {
  "1d": 1,
  "1w": 7,
  "1mo": 30,
  "3mo": 90,
  "1y": 365,
  "5y": 1825,
};

export async function getStockTimeSeries(
  symbol: string,
  period: string = "1mo"
): Promise<TimeSeriesPoint[]> {
  const cacheKey = `timeseries:${symbol.toUpperCase()}:${period}`;
  const cached = getCached<TimeSeriesPoint[]>(cacheKey);
  if (cached) return cached;

  const days = PERIOD_DAYS[period] ?? 30;

  let endPrice: number;
  try {
    const live = await getStockQuote(symbol);
    endPrice = live.price;
  } catch {
    endPrice = MOCK_STOCKS[symbol.toUpperCase()]?.price ?? 100;
  }

  const points = generateTimeSeriesEndingAt(endPrice, days);
  setCache(cacheKey, points, TTL.HISTORICAL);
  return points;
}

function generateTimeSeriesEndingAt(
  endPrice: number,
  days: number
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const now = new Date();

  const trendDirection = Math.random() < 0.62 ? 1 : -1;
  const trendMagnitude = 0.06 + Math.random() * 0.09;
  let price = endPrice * (1 - trendDirection * trendMagnitude);

  const closes: number[] = [];
  for (let i = days; i >= 0; i--) {
    const delta = (Math.random() - 0.49) * endPrice * 0.022;
    price = Math.max(price + delta, endPrice * 0.55);
    closes.push(price);
  }

  const lastIdx = closes.length - 1;
  const correction = endPrice - closes[lastIdx];
  const window = Math.min(5, closes.length);
  for (let i = 0; i < window; i++) {
    const k = (i + 1) / window;
    closes[lastIdx - (window - 1 - i)] += correction * k;
  }

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const close = closes[days - i];
    const dayHigh = close + Math.random() * endPrice * 0.012;
    const dayLow = close - Math.random() * endPrice * 0.012;
    const open =
      i === days ? close : closes[Math.max(0, days - i - 1)] + (Math.random() - 0.5) * endPrice * 0.005;

    points.push({
      date: date.toISOString().split("T")[0],
      open: Number(open.toFixed(2)),
      high: Number(dayHigh.toFixed(2)),
      low: Number(dayLow.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(20_000_000 + Math.random() * 60_000_000),
    });
  }
  return points;
}

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export { generateTimeSeries };
