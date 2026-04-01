import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import AnimateInView from "@/components/AnimateInView";
import GameCatalogCard from "@/components/games/GameCatalogCard";
import { gameCatalog } from "@/data/games-catalog";

const GamesSection = () => {
  const homeGames = gameCatalog.slice(0, 3);

  return (
    <section className="bg-white py-12 sm:py-16" id="ai-quiz">
      <AnimateInView>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">Games</h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Play interactive AI challenges and keep leveling up your knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
            {homeGames.map((game) => (
              <GameCatalogCard key={game.id} game={game} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link to="/quiz">
              <motion.button
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Gamepad2 size={18} />
                View All Games
              </motion.button>
            </Link>
          </div>
        </div>
      </AnimateInView>
    </section>
  );
};

export default GamesSection;
