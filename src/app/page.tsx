import { SearchBar } from "@/components/home/SearchBar";
import { TrendingCards } from "@/components/home/TrendingCards";
import { NewsFeed } from "@/components/home/NewsFeed";

export default function HomePage() {
  return (
    <div className="grid-bg min-h-full">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Track the markets.
            <br />
            <span className="text-cyan">Make your move.</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Search any stock or crypto, view interactive charts, and trade with
            simulated currency.
          </p>
        </div>

        <SearchBar />

        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-1 rounded-full bg-cyan" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Trending
            </h2>
          </div>
          <TrendingCards />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-1 rounded-full bg-amber" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Market News
            </h2>
          </div>
          <NewsFeed />
        </section>
      </div>
    </div>
  );
}
