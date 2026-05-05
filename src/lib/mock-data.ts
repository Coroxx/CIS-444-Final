import type {
  StockQuote,
  TimeSeriesPoint,
  CryptoMarket,
  NewsArticle,
  SearchResult,
} from "@/types";

function makeQuote(
  symbol: string,
  name: string,
  price: number,
  changePercent: number,
  marketCap: number,
  baseVolume: number
): StockQuote {
  const change = +(price * (changePercent / 100)).toFixed(2);
  const open = +(price - change * 0.6).toFixed(2);
  const high = +(price + Math.abs(change) * 0.4 + price * 0.005).toFixed(2);
  const low = +(price - Math.abs(change) * 0.6 - price * 0.005).toFixed(2);
  return {
    symbol,
    name,
    price,
    open,
    high,
    low,
    volume: baseVolume,
    change,
    changePercent,
    marketCap,
  };
}

export const MOCK_STOCKS: Record<string, StockQuote> = {

  AAPL:  makeQuote("AAPL",  "Apple Inc.",            178.50,  1.20, 2780000000000, 52300000),
  MSFT:  makeQuote("MSFT",  "Microsoft Corp.",       420.10,  0.50, 3120000000000, 21400000),
  GOOGL: makeQuote("GOOGL", "Alphabet Inc.",         175.20,  0.80, 2160000000000, 25600000),
  AMZN:  makeQuote("AMZN",  "Amazon.com Inc.",       185.60,  0.76, 1920000000000, 43200000),
  META:  makeQuote("META",  "Meta Platforms Inc.",   505.30,  0.64, 1290000000000, 18900000),
  NVDA:  makeQuote("NVDA",  "NVIDIA Corp.",          880.25,  0.89, 2170000000000, 38700000),
  TSLA:  makeQuote("TSLA",  "Tesla Inc.",            245.30, -0.80,  780000000000, 98500000),
  NFLX:  makeQuote("NFLX",  "Netflix Inc.",          628.40,  0.54,  272000000000,  5200000),

  AMD:   makeQuote("AMD",   "Advanced Micro Devices",163.40,  1.85,  264000000000, 47600000),
  INTC:  makeQuote("INTC",  "Intel Corp.",            32.85, -1.42,  140000000000, 41200000),
  ORCL:  makeQuote("ORCL",  "Oracle Corp.",          124.60,  0.95,  342000000000, 13700000),
  ADBE:  makeQuote("ADBE",  "Adobe Inc.",            512.90,  1.12,  227000000000,  3100000),
  CRM:   makeQuote("CRM",   "Salesforce Inc.",       275.40,  0.42,  267000000000,  6400000),
  IBM:   makeQuote("IBM",   "IBM Corp.",             192.85,  0.32,  178000000000,  3900000),
  AVGO:  makeQuote("AVGO",  "Broadcom Inc.",        1685.20,  1.65,  784000000000,  2400000),
  QCOM:  makeQuote("QCOM",  "Qualcomm Inc.",         162.75,  0.95,  181000000000,  9100000),

  JPM:   makeQuote("JPM",   "JPMorgan Chase & Co.",  198.40,  0.35,  570000000000, 11500000),
  V:     makeQuote("V",     "Visa Inc.",             278.60,  0.55,  556000000000,  6800000),
  MA:    makeQuote("MA",    "Mastercard Inc.",       485.20,  0.48,  450000000000,  3200000),
  GS:    makeQuote("GS",    "Goldman Sachs Group",   478.25,  0.72,  155000000000,  2700000),
  BAC:   makeQuote("BAC",   "Bank of America Corp.",  39.65,  0.18,  308000000000, 38400000),

  WMT:   makeQuote("WMT",   "Walmart Inc.",           71.30,  0.45,  573000000000, 18200000),
  COST:  makeQuote("COST",  "Costco Wholesale",      848.40,  0.65,  376000000000,  2100000),
  HD:    makeQuote("HD",    "Home Depot Inc.",       348.90, -0.28,  348000000000,  3700000),
  KO:    makeQuote("KO",    "Coca-Cola Co.",          63.85,  0.22,  274000000000, 14800000),
  PEP:   makeQuote("PEP",   "PepsiCo Inc.",          168.40, -0.15,  231000000000,  5200000),
  MCD:   makeQuote("MCD",   "McDonald's Corp.",      295.60,  0.38,  213000000000,  3400000),
  NKE:   makeQuote("NKE",   "NIKE Inc.",              82.40, -0.95,  124000000000, 11700000),
  DIS:   makeQuote("DIS",   "Walt Disney Co.",       105.30,  0.62,  191000000000,  9800000),
  SBUX:  makeQuote("SBUX",  "Starbucks Corp.",        96.80,  0.48,  110000000000,  7200000),

  JNJ:   makeQuote("JNJ",   "Johnson & Johnson",     162.50,  0.28,  391000000000,  6800000),
  LLY:   makeQuote("LLY",   "Eli Lilly and Co.",     875.40,  1.45,  831000000000,  3900000),
  UNH:   makeQuote("UNH",   "UnitedHealth Group",    528.30,  0.55,  486000000000,  3100000),

  XOM:   makeQuote("XOM",   "Exxon Mobil Corp.",     118.40,  0.85,  468000000000, 14500000),
  CVX:   makeQuote("CVX",   "Chevron Corp.",         162.85,  0.62,  299000000000,  6700000),
};

export function generateTimeSeries(
  basePrice: number,
  days: number
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  let price = basePrice * 0.92;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const volatility = (Math.random() - 0.48) * basePrice * 0.025;
    price = Math.max(price + volatility, basePrice * 0.7);

    const dayHigh = price + Math.random() * basePrice * 0.015;
    const dayLow = price - Math.random() * basePrice * 0.015;

    points.push({
      date: date.toISOString().split("T")[0],
      open: Number((price - volatility * 0.5).toFixed(2)),
      high: Number(dayHigh.toFixed(2)),
      low: Number(dayLow.toFixed(2)),
      close: Number(price.toFixed(2)),
      volume: Math.floor(20000000 + Math.random() * 60000000),
    });
  }
  return points;
}

export const MOCK_CRYPTO: CryptoMarket[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    currentPrice: 67200,
    priceChange24h: 1250,
    priceChangePercent24h: 1.9,
    marketCap: 1320000000000,
    rank: 1,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    currentPrice: 3450,
    priceChange24h: -45,
    priceChangePercent24h: -1.3,
    marketCap: 415000000000,
    rank: 2,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    currentPrice: 145.8,
    priceChange24h: 5.2,
    priceChangePercent24h: 3.7,
    marketCap: 64000000000,
    rank: 3,
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    currentPrice: 598,
    priceChange24h: 8.5,
    priceChangePercent24h: 1.44,
    marketCap: 92000000000,
    rank: 4,
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "XRP",
    image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    currentPrice: 0.62,
    priceChange24h: 0.015,
    priceChangePercent24h: 2.48,
    marketCap: 34000000000,
    rank: 5,
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    image: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
    currentPrice: 0.45,
    priceChange24h: -0.008,
    priceChangePercent24h: -1.75,
    marketCap: 16000000000,
    rank: 6,
  },
];

export const MOCK_NEWS: NewsArticle[] = [
  {
    title: "Fed signals potential rate cut in Q2 meeting...",
    description: "Federal Reserve officials discussed potential interest rate adjustments during their latest policy meeting.",
    url: "#",
    source: "Reuters",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Tesla announces new EV model for European market...",
    description: "Tesla unveiled plans for a new affordable electric vehicle targeting the European market.",
    url: "#",
    source: "Bloomberg",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    title: "Bitcoin surges past $67k on ETF inflows...",
    description: "Bitcoin reached new highs as institutional investors continued pouring money into spot ETFs.",
    url: "#",
    source: "CoinDesk",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    title: "Apple Q1 earnings beat analyst expectations...",
    description: "Apple reported quarterly earnings that exceeded Wall Street estimates, driven by strong services revenue.",
    url: "#",
    source: "CNBC",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    title: "NVIDIA unveils next-gen AI chips at annual conference...",
    description: "NVIDIA announced its latest GPU architecture aimed at accelerating AI workloads for enterprises.",
    url: "#",
    source: "TechCrunch",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

export const MOCK_SEARCH_RESULTS: SearchResult[] = [
  ...Object.values(MOCK_STOCKS).map(
    (s): SearchResult => ({ symbol: s.symbol, name: s.name, type: "stock" })
  ),
  { symbol: "BTC",  name: "Bitcoin",   type: "crypto" },
  { symbol: "ETH",  name: "Ethereum",  type: "crypto" },
  { symbol: "SOL",  name: "Solana",    type: "crypto" },
  { symbol: "BNB",  name: "BNB",       type: "crypto" },
  { symbol: "XRP",  name: "XRP",       type: "crypto" },
  { symbol: "ADA",  name: "Cardano",   type: "crypto" },
];

export const TRENDING_SYMBOLS = [
  "AAPL", "MSFT", "NVDA", "TSLA",
  "GOOGL", "AMZN", "META", "AMD",
];
