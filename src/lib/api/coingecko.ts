import { getCached, setCache, TTL } from "@/lib/cache";
import { MOCK_CRYPTO } from "@/lib/mock-data";
import type { CryptoMarket, StockQuote, TimeSeriesPoint } from "@/types";

const BASE_URL = "https://api.coingecko.com/api/v3";

export async function getCryptoPrice(coinId: string): Promise<StockQuote> {
  const cacheKey = `crypto:price:${coinId.toLowerCase()}`;
  const cached = getCached<StockQuote>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      { next: { revalidate: TTL.CRYPTO } }
    );
    if (!res.ok) throw new Error("CoinGecko API error");
    const data = await res.json();
    const md = data.market_data ?? {};
    const price = md.current_price?.usd ?? 0;
    const change = md.price_change_24h ?? 0;
    const open = +(price - change).toFixed(2);
    const high24 = md.high_24h?.usd ?? price;
    const low24 = md.low_24h?.usd ?? price;
    const high = Math.max(price, open, high24);
    const low = Math.min(price, open, low24);
    const img = data.image as { large?: string; small?: string; thumb?: string } | undefined;
    const image = img?.small ?? img?.thumb ?? img?.large;
    const quote: StockQuote = {
      symbol: (data.symbol as string)?.toUpperCase() ?? coinId.toUpperCase(),
      name: (data.name as string) ?? coinId,
      price,
      open,
      high,
      low,
      volume: md.total_volume?.usd ?? 0,
      change,
      changePercent: md.price_change_percentage_24h ?? 0,
      marketCap: md.market_cap?.usd ?? 0,
      image,
    };
    setCache(cacheKey, quote, TTL.CRYPTO);
    return quote;
  } catch {
    try {
      const markets = await getCryptoMarkets();
      const m = markets.find((x) => x.id === coinId.toLowerCase());
      if (m) {
        const price = m.currentPrice ?? 0;
        const change = m.priceChange24h ?? 0;
        const open = +(price - change).toFixed(8);
        const fallback: StockQuote = {
          symbol: m.symbol,
          name: m.name,
          price,
          open,
          high: Math.max(price, open) * 1.005,
          low: Math.min(price, open) * 0.995,
          volume: 0,
          change,
          changePercent: m.priceChangePercent24h ?? 0,
          marketCap: m.marketCap,
          image: m.image,
        };
        setCache(cacheKey, fallback, TTL.CRYPTO);
        return fallback;
      }
    } catch {}
    const mock = MOCK_CRYPTO.find((c) => c.id === coinId.toLowerCase());
    const mPrice = mock?.currentPrice ?? 0;
    const mChange = mock?.priceChange24h ?? 0;
    const mOpen = +(mPrice - mChange).toFixed(8);
    return {
      symbol: mock?.symbol ?? coinId.toUpperCase(),
      name: mock?.name ?? coinId,
      price: mPrice,
      open: mOpen,
      high: Math.max(mPrice, mOpen) * 1.01,
      low: Math.min(mPrice, mOpen) * 0.99,
      volume: 0,
      change: mChange,
      changePercent: mock?.priceChangePercent24h ?? 0,
      marketCap: mock?.marketCap,
      image: mock?.image,
    };
  }
}

export async function getCryptoMarkets(): Promise<CryptoMarket[]> {
  const cacheKey = "crypto:markets";
  const cached = getCached<CryptoMarket[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false`,
      { next: { revalidate: TTL.CRYPTO } }
    );
    if (!res.ok) throw new Error("CoinGecko API error");
    const data = await res.json();

    const markets: CryptoMarket[] = data.map(
      (c: Record<string, unknown>, i: number) => ({
        id: c.id as string,
        symbol: (c.symbol as string).toUpperCase(),
        name: c.name as string,
        image: c.image as string,
        currentPrice: c.current_price as number,
        priceChange24h: c.price_change_24h as number,
        priceChangePercent24h: c.price_change_percentage_24h as number,
        marketCap: c.market_cap as number,
        rank: i + 1,
      })
    );

    setCache(cacheKey, markets, TTL.CRYPTO);
    return markets;
  } catch {
    return MOCK_CRYPTO;
  }
}

export async function getCryptoHistory(
  coinId: string,
  days: number = 30
): Promise<TimeSeriesPoint[]> {
  const cacheKey = `crypto:history:${coinId}:${days}`;
  const cached = getCached<TimeSeriesPoint[]>(cacheKey);
  if (cached) return cached;

  try {
    const reqDays = Math.max(days, 2);
    const res = await fetch(
      `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${reqDays}`,
      { next: { revalidate: TTL.CRYPTO } }
    );
    if (!res.ok) throw new Error("CoinGecko API error");
    const data = await res.json();

    const prices = (data.prices ?? []) as [number, number][];
    const volumes = (data.total_volumes ?? []) as [number, number][];
    const volumeByDay: Record<string, number> = {};
    for (const [ts, vol] of volumes) {
      const day = new Date(ts).toISOString().split("T")[0];
      volumeByDay[day] = (volumeByDay[day] ?? 0) + vol;
    }

    const buckets: Record<string, { ts: number[]; px: number[] }> = {};
    for (const [ts, price] of prices) {
      const day = new Date(ts).toISOString().split("T")[0];
      if (!buckets[day]) buckets[day] = { ts: [], px: [] };
      buckets[day].ts.push(ts);
      buckets[day].px.push(price);
    }

    const points: TimeSeriesPoint[] = Object.keys(buckets)
      .sort()
      .map((day) => {
        const b = buckets[day];
        const open = b.px[0];
        const close = b.px[b.px.length - 1];
        let high = -Infinity;
        let low = Infinity;
        for (const p of b.px) {
          if (p > high) high = p;
          if (p < low) low = p;
        }
        return {
          date: day,
          open,
          high,
          low,
          close,
          volume: Math.round(volumeByDay[day] ?? 0),
        };
      });

    setCache(cacheKey, points, TTL.CRYPTO);
    return points;
  } catch {
    const { generateTimeSeries } = await import("@/lib/mock-data");
    return generateTimeSeries(67200, days);
  }
}
