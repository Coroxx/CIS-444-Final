export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  balance: number;
  createdAt: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  image?: string;
}

export interface TimeSeriesPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CryptoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCap: number;
  rank: number;
}

export interface TradeRecord {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  type: "stock" | "crypto";
  currentPrice?: number;
  change?: number;
  changePercent?: number;
}

export interface ChatMsg {
  id: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  portfolioValue: number;
  pnl: number;
  pnlPercent: number;
  tradesCount: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: "stock" | "crypto";
}
