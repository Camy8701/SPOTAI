export type GameCatalogItem = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  to?: string;
  status: "live" | "coming-soon";
  keywords: string[];
};

export const gameCatalog: GameCatalogItem[] = [
  {
    id: "ai-knowledge-quiz",
    title: "AI Knowledge Quiz",
    subtitle: "Beginner to advanced AI rounds with live scoring.",
    tag: "Quiz",
    image: "/images/games/ai-knowledge-quiz.png",
    to: "/quiz/levels",
    status: "live",
    keywords: ["ai", "knowledge", "fundamentals", "intermediate", "advanced", "brain", "quiz"],
  },
  {
    id: "prompt-speed-run",
    title: "Prompt Speed Run",
    subtitle: "Fast challenge mode with time pressure and XP bonuses.",
    tag: "Challenge",
    image: "/images/original-library/futuristic-neon-data-visualization-panel.webp",
    status: "coming-soon",
    keywords: ["prompt", "speed", "run", "challenge", "timed", "xp"],
  },
  {
    id: "model-clash",
    title: "Model Clash",
    subtitle: "Head-to-head logic rounds with adaptive difficulty.",
    tag: "Strategy",
    image: "/images/original-library/cute-neon-robot-coding-at-holographic-screen.jpeg",
    status: "coming-soon",
    keywords: ["model", "clash", "strategy", "logic", "adaptive", "arena"],
  },
];
