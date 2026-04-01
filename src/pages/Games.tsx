import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import Layout from "@/components/layout/Layout";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";
import GameCatalogCard from "@/components/games/GameCatalogCard";
import { Input } from "@/components/ui/input";
import { gameCatalog } from "@/data/games-catalog";

const headerBackClassName =
  "border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:border-indigo-300 hover:text-indigo-800";

const Games = () => {
  const [query, setQuery] = useState("");

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return gameCatalog;

    return gameCatalog.filter((game) => {
      const haystack = [
        game.title,
        game.subtitle,
        game.tag,
        game.keywords.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title="Games"
          subtitle="Play interactive AI challenges and keep leveling up your knowledge."
          topLabel="Explore all games"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-indigo-700/75"
        >
          <div className="relative mx-auto max-w-2xl">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search games by name, mode, or tag"
              className="h-12 rounded-full border-input bg-background pr-10"
            />
          </div>
        </CatalogHeroHeader>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {filteredGames.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border bg-card px-8 py-12 text-center">
              <p className="text-xl font-semibold text-foreground">No games found.</p>
              <p className="mt-2 text-muted-foreground">Try searching by quiz, challenge, or strategy.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
              {filteredGames.map((game) => (
                <GameCatalogCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Games;
