"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Bitcoin } from "lucide-react";
import type { SearchResult } from "@/types";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch {}
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    if (result.type === "crypto") {
      router.push(`/crypto/${result.symbol.toLowerCase()}`);
    } else {
      router.push(`/stock/${result.symbol}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search stocks, crypto, or indices..."
          className="w-full h-12 pl-12 pr-4 bg-card border border-border/50 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan/50 transition-all"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden z-50">
          {results.map((result) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result)}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                {result.type === "crypto" ? (
                  <Bitcoin className="h-4 w-4 text-amber" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-cyan" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold font-mono">
                    {result.symbol}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                    {result.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {result.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
