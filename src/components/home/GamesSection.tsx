import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import AnimateInView from "@/components/AnimateInView";

type HomeGame = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  to?: string;
  status: "live" | "coming-soon";
};

const homeGames: HomeGame[] = [
  {
    id: "ai-knowledge-quiz",
    title: "AI Knowledge Quiz",
    subtitle: "Beginner to advanced AI rounds with live scoring.",
    tag: "Quiz",
    image: "/images/games/ai-knowledge-quiz.png",
    to: "/quiz",
    status: "live",
  },
  {
    id: "prompt-speed-run",
    title: "Prompt Speed Run",
    subtitle: "Fast challenge mode with time pressure and XP bonuses.",
    tag: "Challenge",
    image: "/images/original-library/futuristic-neon-data-visualization-panel.webp",
    status: "coming-soon",
  },
  {
    id: "model-clash",
    title: "Model Clash",
    subtitle: "Head-to-head logic rounds with adaptive difficulty.",
    tag: "Strategy",
    image: "/images/original-library/cute-neon-robot-coding-at-holographic-screen.jpeg",
    status: "coming-soon",
  },
];

const GamesSection = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const offset = Math.max(320, Math.floor(carouselRef.current.clientWidth * 0.72));
    carouselRef.current.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-background py-12 sm:py-16" id="ai-quiz">
      <AnimateInView>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">Games</h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Play interactive AI challenges and keep leveling up your knowledge.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              className="absolute left-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-foreground shadow-sm transition hover:bg-white md:inline-flex"
              aria-label="Scroll games left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              className="absolute right-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-foreground shadow-sm transition hover:bg-white md:inline-flex"
              aria-label="Scroll games right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {homeGames.map((game) => (
                <article
                  key={game.id}
                  className="group min-w-[280px] flex-1 snap-start overflow-hidden rounded-3xl border border-border bg-card shadow-[0_10px_30px_rgba(16,24,40,0.08)] sm:min-w-[360px]"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full border border-white/35 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                      {game.tag}
                    </span>
                  </div>
                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{game.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{game.subtitle}</p>
                    </div>

                    {game.to ? (
                      <Link to={game.to} className="inline-flex">
                        <motion.button
                          className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 text-sm font-semibold text-white shadow-sm"
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Start game
                        </motion.button>
                      </Link>
                    ) : (
                      <span className="inline-flex h-10 items-center rounded-full border border-border bg-muted px-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Coming soon
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
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
