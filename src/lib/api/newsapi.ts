import { getCached, setCache, TTL } from "@/lib/cache";
import { MOCK_NEWS } from "@/lib/mock-data";
import type { NewsArticle } from "@/types";

const API_KEY = process.env.NEWS_API_KEY;

export async function getFinancialNews(): Promise<NewsArticle[]> {
  const cacheKey = "news:financial";
  const cached = getCached<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  if (!API_KEY) return MOCK_NEWS;

  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=10&apiKey=${API_KEY}`,
      { next: { revalidate: TTL.NEWS } }
    );
    if (!res.ok) throw new Error("NewsAPI error");
    const data = await res.json();

    const articles: NewsArticle[] = (
      data.articles as Record<string, unknown>[]
    ).map((a) => ({
      title: a.title as string,
      description: (a.description || "") as string,
      url: a.url as string,
      source: (a.source as Record<string, string>)?.name || "Unknown",
      publishedAt: a.publishedAt as string,
    }));

    setCache(cacheKey, articles, TTL.NEWS);
    return articles;
  } catch {
    return MOCK_NEWS;
  }
}
