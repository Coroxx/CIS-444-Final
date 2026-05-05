import NodeCache from "node-cache";

const cache = new NodeCache();

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, data, ttlSeconds);
}

export const TTL = {
  STOCK_QUOTE: 300,
  HISTORICAL: 900,
  CRYPTO: 120,
  NEWS: 900,
  SEARCH: 600,
  LEADERBOARD: 300,
} as const;
