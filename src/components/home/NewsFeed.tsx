"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, ExternalLink } from "lucide-react";
import type { NewsArticle } from "@/types";
import { formatDistanceToNow } from "date-fns";

export function NewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then(setNews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {news.map((article, i) => (
        <a
          key={i}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
        >
          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-cyan transition-colors">
              {article.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {article.source}
              </span>
              <span className="text-xs text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(article.publishedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
        </a>
      ))}
    </div>
  );
}
