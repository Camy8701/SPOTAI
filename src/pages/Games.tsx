import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GameCard = {
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  to?: string;
  status: "live" | "coming-soon";
};

const gameCards: GameCard[] = [
  {
    title: "AI Knowledge Arena",
    subtitle: "History, tools, ethics, and pop culture",
    tag: "Trivia",
    image:
      "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=1400&q=80",
    to: "/quiz/arena",
    status: "live",
  },
  {
    title: "Prompt Speed Run",
    subtitle: "Quick rounds, faster scoring, bonus points",
    tag: "Challenge",
    image:
      "https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?auto=format&fit=crop&w=1400&q=80",
    status: "coming-soon",
  },
];

const upcomingTitles = ["Neural Match", "Agent Tactics", "Model Clash", "Vision Sprint"];

const Games = () => {
  const [query, setQuery] = useState("");

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return gameCards;

    return gameCards.filter((card) =>
      `${card.title} ${card.subtitle} ${card.tag}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1
                className="text-5xl tracking-tight"
                style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
              >
                Games
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Play, learn, and level up your AI knowledge
              </p>
            </div>

            <div className="relative mx-auto mt-8 max-w-2xl">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search game modes"
                className="h-12 rounded-full border-input bg-background pr-10"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {filteredCards.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border bg-card px-8 py-12 text-center shadow-[0_8px_26px_rgba(16,24,40,0.06)]">
              <p className="text-xl font-semibold text-foreground">No games match that search.</p>
              <p className="mt-2 text-muted-foreground">Try a broader search term like quiz or challenge.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                {filteredCards.map((card) => (
                  <article
                    key={card.title}
                    className="overflow-hidden rounded-[2rem] border border-black/8 bg-white p-4 shadow-[0_6px_24px_rgba(20,20,20,0.06)]"
                  >
                    <div className="relative mb-5 h-[21rem] overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#eef0eb] via-[#e3e5df] to-[#cfd4c8]">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-4 left-4 rounded-full bg-[#151515] px-4 py-1 text-xs font-semibold tracking-wide text-white">
                        {card.tag}
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-4 px-2 pb-2">
                      <div>
                        <h3 className="text-[2rem] leading-tight font-semibold tracking-tight text-[#21252d]">
                          {card.title}
                        </h3>
                        <p className="mt-1 text-[1.05rem] text-[#6a6f77]">{card.subtitle}</p>
                      </div>
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d3d8d3] text-[#1f2421]">
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4 px-2 pb-2">
                      <span className="inline-flex items-center rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {card.status === "live" ? "Live game" : "Placeholder"}
                      </span>

                      {card.to ? (
                        <Button
                          asChild
                          className="h-11 rounded-full border border-slate-900 bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          <Link to={card.to}>Play now</Link>
                        </Button>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex h-11 items-center rounded-full border px-5 text-sm font-semibold",
                            "border-slate-200 bg-slate-50 text-muted-foreground",
                          )}
                        >
                          Coming soon
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center">
                {upcomingTitles.map((title) => (
                  <span
                    key={title}
                    className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {title} soon
                  </span>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Games;
