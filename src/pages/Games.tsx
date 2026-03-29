import { useMemo, useState } from "react";
import { ArrowRight, Brain, Gauge, Orbit, Search, Sparkles, Swords, Waypoints } from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GameStatus = "live" | "coming-soon";

type GameEntry = {
  id: string;
  title: string;
  tag: string;
  description: string;
  status: GameStatus;
  icon: typeof Brain;
  path?: string;
  coverClassName: string;
  accentClassName: string;
};

const gameEntries: GameEntry[] = [
  {
    id: "ai-knowledge-arena",
    title: "AI Knowledge Arena",
    tag: "Trivia",
    description: "Play the upgraded SpotAI quiz with faster rounds, cleaner feedback, and stronger replay loops.",
    status: "live",
    icon: Brain,
    path: "/quiz/arena",
    coverClassName: "from-slate-950 via-indigo-950 to-fuchsia-900",
    accentClassName: "from-cyan-400 to-violet-500",
  },
  {
    id: "prompt-speed-run",
    title: "Prompt Speed Run",
    tag: "Challenge",
    description: "A rapid prompt-building race with bonus rounds, timing pressure, and streak scoring.",
    status: "coming-soon",
    icon: Gauge,
    coverClassName: "from-sky-950 via-cyan-950 to-slate-950",
    accentClassName: "from-sky-400 to-cyan-500",
  },
  {
    id: "neural-match",
    title: "Neural Match",
    tag: "Puzzle",
    description: "Pair models, use cases, and outputs in a fast memory board built for short sessions.",
    status: "coming-soon",
    icon: Orbit,
    coverClassName: "from-violet-900 via-fuchsia-900 to-rose-900",
    accentClassName: "from-violet-400 to-pink-500",
  },
  {
    id: "agent-tactics",
    title: "Agent Tactics",
    tag: "Strategy",
    description: "Pick the best multi-step agent plan before the timer runs out.",
    status: "coming-soon",
    icon: Waypoints,
    coverClassName: "from-emerald-900 via-teal-900 to-cyan-900",
    accentClassName: "from-emerald-400 to-cyan-500",
  },
  {
    id: "model-clash",
    title: "Model Clash",
    tag: "Versus",
    description: "Compare two models and guess which one wins on cost, speed, or quality.",
    status: "coming-soon",
    icon: Swords,
    coverClassName: "from-amber-900 via-orange-900 to-rose-900",
    accentClassName: "from-amber-400 to-orange-500",
  },
  {
    id: "vision-sprint",
    title: "Vision Sprint",
    tag: "Visual",
    description: "Spot the generated image artifact before the clock burns out.",
    status: "coming-soon",
    icon: Sparkles,
    coverClassName: "from-indigo-950 via-slate-900 to-slate-950",
    accentClassName: "from-indigo-400 to-sky-500",
  },
];

const filterOptions = [
  { key: "all", label: "All games" },
  { key: "live", label: "Live now" },
  { key: "coming-soon", label: "Coming soon" },
] as const;

const Games = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof filterOptions)[number]["key"]>("all");

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return gameEntries.filter((game) => {
      const matchesStatus = statusFilter === "all" ? true : game.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : `${game.title} ${game.tag} ${game.description}`.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  const featuredGames = filteredGames.slice(0, 2);
  const gridGames = filteredGames.slice(2);

  return (
    <Layout>
      <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.45)_100%)]">
        <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_22%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.4)_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-6 text-center">
              <div className="space-y-3">
                <Badge
                  variant="outline"
                  className="rounded-full border-border bg-background/80 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
                >
                  SpotAI games
                </Badge>
                <div className="space-y-3">
                  <h1
                    className="text-4xl text-foreground sm:text-5xl"
                    style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                  >
                    Games
                  </h1>
                  <p className="mx-auto max-w-2xl text-sm uppercase tracking-[0.34em] text-muted-foreground/80 sm:text-[13px]">
                    Play, learn, and level up your AI knowledge
                  </p>
                </div>
              </div>

              <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search game modes"
                    className="h-12 rounded-full border-border bg-background pl-10 pr-4"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setStatusFilter(option.key)}
                      className={cn(
                        "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        statusFilter === option.key
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {filteredGames.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-border bg-card/70 p-10 text-center">
                <p className="text-lg font-semibold text-foreground">No games match that search yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">Try another keyword or switch the filter back to all games.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  {featuredGames.map((game) => {
                    const Icon = game.icon;

                    const cardContent = (
                      <>
                        <div className={cn("relative h-64 overflow-hidden rounded-[1.6rem] bg-gradient-to-br p-6 text-white", game.coverClassName)}>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_30%)]" />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(2,6,23,0.18)_100%)]" />
                          <div className="relative z-10 flex h-full flex-col justify-between">
                            <div className="flex items-start justify-between gap-3">
                              <Badge className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white">
                                {game.tag}
                              </Badge>
                              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg", game.accentClassName)}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                            </div>

                            <div className="max-w-xs">
                              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
                                {game.status === "live" ? "Available now" : "Coming soon"}
                              </p>
                              <h2 className="mt-3 text-3xl leading-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                                {game.title}
                              </h2>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-end justify-between gap-5 px-2 pb-2 pt-5">
                          <div className="space-y-3">
                            <p className="max-w-xl text-sm leading-6 text-muted-foreground">{game.description}</p>
                            <div className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {game.status === "live" ? "Live game" : "Placeholder"}
                            </div>
                          </div>

                          {game.path ? (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background transition-transform group-hover:translate-x-1">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="rounded-full border border-border bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground">
                              Soon
                            </div>
                          )}
                        </div>
                      </>
                    );

                    const cardClassName = cn(
                      "group block rounded-[2rem] border border-border bg-card p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all",
                      game.path && "cursor-pointer hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)]",
                    );

                    if (game.path) {
                      return (
                        <Link
                          key={game.id}
                          to={game.path}
                          className={cardClassName}
                        >
                          {cardContent}
                        </Link>
                      );
                    }

                    return (
                      <div
                        key={game.id}
                        className={cn(
                          cardClassName,
                          "cursor-default",
                        )}
                      >
                        {cardContent}
                      </div>
                    );
                  })}
                </div>

                {gridGames.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-semibold text-foreground">More games on deck</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Keep the catalog alive while the next releases are being built.</p>
                      </div>
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                        {gridGames.length} placeholders
                      </Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {gridGames.map((game) => {
                        const Icon = game.icon;

                        return (
                          <div
                            key={game.id}
                            className="rounded-[1.7rem] border border-border bg-card p-3 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
                          >
                            <div className={cn("relative h-44 overflow-hidden rounded-[1.3rem] bg-gradient-to-br p-4 text-white", game.coverClassName)}>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_32%)]" />
                              <div className="relative z-10 flex h-full flex-col justify-between">
                                <div className="flex items-center justify-between gap-3">
                                  <Badge className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white">
                                    {game.tag}
                                  </Badge>
                                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md", game.accentClassName)}>
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-xl leading-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                                    {game.title}
                                  </h3>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4 px-2 pb-2 pt-4">
                              <p className="text-sm leading-6 text-muted-foreground">{game.description}</p>
                              <Button type="button" variant="outline" className="h-10 w-full rounded-full" disabled>
                                Placeholder
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Featured live game</p>
                      <h2 className="text-3xl text-foreground" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                        Ready for the AI Knowledge Arena?
                      </h2>
                      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Jump straight into the upgraded quiz experience with tighter rounds, better feedback, and a stronger reason to replay.
                      </p>
                    </div>
                    <Button asChild className="h-12 rounded-full px-6">
                      <Link to="/quiz/arena">
                        Launch quiz arena
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Games;
