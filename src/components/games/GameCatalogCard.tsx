import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { GameCatalogItem } from "@/data/games-catalog";

type GameCatalogCardProps = {
  game: GameCatalogItem;
};

const GameCatalogCard = ({ game }: GameCatalogCardProps) => {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white">
      <div className="relative h-44 overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
          {game.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div>
          <h3 className="text-4xl font-black tracking-tight text-slate-900">
            {game.title}
          </h3>
          <p className="mt-2 text-base leading-7 text-slate-600">{game.subtitle}</p>
        </div>

        {game.to ? (
          <Button
            asChild
            className="h-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 text-sm font-semibold text-white"
          >
            <Link to={game.to}>Start game</Link>
          </Button>
        ) : (
          <span className="inline-flex h-10 items-center rounded-full border border-border bg-muted px-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
};

export default GameCatalogCard;
