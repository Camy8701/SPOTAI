export type QuizDifficulty = "easy" | "medium" | "hard";

export type QuizQuestion = {
  id: number | string;
  quizTitle: string;
  category: string;
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type QuizModeId = "daily" | "classic" | "survival" | "category" | "recovery";

export type QuizModeConfig = {
  id: QuizModeId;
  title: string;
  subtitle: string;
  description: string;
  questionCount: number;
  lives: number | null;
  accentClassName: string;
  surfaceClassName: string;
};

export type QuizSession = {
  id: string;
  mode: QuizModeId;
  title: string;
  subtitle: string;
  description: string;
  category: string | null;
  questions: QuizQuestion[];
  lives: number | null;
  saveTitle: string;
};

export const QUIZ_MODE_CONFIG: Record<QuizModeId, QuizModeConfig> = {
  daily: {
    id: "daily",
    title: "Daily Challenge",
    subtitle: "A quick ritual for your AI streak",
    description: "Five hand-picked questions with a fixed daily lineup and a clean habit loop.",
    questionCount: 5,
    lives: null,
    accentClassName: "from-cyan-400 via-sky-500 to-indigo-500",
    surfaceClassName: "border-cyan-400/30 bg-cyan-500/[0.08]",
  },
  classic: {
    id: "classic",
    title: "Classic Arena",
    subtitle: "Balanced rounds with a satisfying ramp",
    description: "Ten questions across the AI landscape, gradually escalating from easy to hard.",
    questionCount: 10,
    lives: null,
    accentClassName: "from-fuchsia-500 via-pink-500 to-rose-500",
    surfaceClassName: "border-pink-500/25 bg-pink-500/[0.08]",
  },
  survival: {
    id: "survival",
    title: "Survival Run",
    subtitle: "Keep your streak alive with only three lives",
    description: "A longer run where wrong answers cost lives and momentum matters more.",
    questionCount: 15,
    lives: 3,
    accentClassName: "from-amber-400 via-orange-500 to-red-500",
    surfaceClassName: "border-orange-500/25 bg-orange-500/[0.08]",
  },
  category: {
    id: "category",
    title: "Category Clash",
    subtitle: "Go deep on one subject",
    description: "Choose a topic deck and clear a focused round with tighter question curation.",
    questionCount: 8,
    lives: null,
    accentClassName: "from-violet-500 via-purple-500 to-indigo-500",
    surfaceClassName: "border-violet-500/25 bg-violet-500/[0.08]",
  },
  recovery: {
    id: "recovery",
    title: "Recovery Run",
    subtitle: "Revisit your weak spots before they fade",
    description: "A focused remix of the questions you recently missed, built to turn mistakes into momentum.",
    questionCount: 6,
    lives: null,
    accentClassName: "from-emerald-400 via-teal-500 to-cyan-500",
    surfaceClassName: "border-emerald-500/25 bg-emerald-500/[0.08]",
  },
};

const difficultyWeight: Record<QuizDifficulty, number> = {
  easy: 10,
  medium: 16,
  hard: 24,
};

const seededRandom = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const shuffleWithSeed = <T,>(items: T[], seedKey: string) => {
  const next = [...items];
  const random = seededRandom(hashString(seedKey));

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
};

const normalizeCategoryKey = (value: string | null | undefined) =>
  (value || "general").trim().toLowerCase().replace(/\s+/g, "-");

const titleCase = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getDifficultyTargets = (mode: QuizModeId, total: number): Record<QuizDifficulty, number> => {
  if (mode === "daily") {
    return { easy: 2, medium: 2, hard: Math.max(total - 4, 1) };
  }

  if (mode === "classic") {
    return { easy: 3, medium: 4, hard: Math.max(total - 7, 2) };
  }

  if (mode === "survival") {
    return { easy: 5, medium: 5, hard: Math.max(total - 10, 5) };
  }

  if (mode === "recovery") {
    return { easy: 2, medium: 2, hard: Math.max(total - 4, 2) };
  }

  return { easy: 3, medium: 3, hard: Math.max(total - 6, 2) };
};

const pickQuestions = (
  questions: QuizQuestion[],
  mode: QuizModeId,
  questionCount: number,
  seedKey: string,
) => {
  const shuffled = shuffleWithSeed(questions, seedKey);
  const targets = getDifficultyTargets(mode, questionCount);
  const buckets: Record<QuizDifficulty, QuizQuestion[]> = {
    easy: shuffled.filter((question) => question.difficulty === "easy"),
    medium: shuffled.filter((question) => question.difficulty === "medium"),
    hard: shuffled.filter((question) => question.difficulty === "hard"),
  };

  const selected: QuizQuestion[] = [];
  const usedIds = new Set<string>();
  const takeFromBucket = (difficulty: QuizDifficulty, amount: number) => {
    const bucket = buckets[difficulty];
    for (const question of bucket) {
      if (selected.length >= questionCount) break;
      const key = String(question.id);
      if (usedIds.has(key)) continue;
      selected.push(question);
      usedIds.add(key);
      if (selected.filter((item) => item.difficulty === difficulty).length >= amount) break;
    }
  };

  takeFromBucket("easy", targets.easy);
  takeFromBucket("medium", targets.medium);
  takeFromBucket("hard", targets.hard);

  for (const question of shuffled) {
    if (selected.length >= questionCount) break;
    const key = String(question.id);
    if (usedIds.has(key)) continue;
    selected.push(question);
    usedIds.add(key);
  }

  const finalRound = selected.slice(0, questionCount);
  const ordered = [
    ...finalRound.filter((question) => question.difficulty === "easy"),
    ...finalRound.filter((question) => question.difficulty === "medium"),
    ...finalRound.filter((question) => question.difficulty === "hard"),
  ];

  return ordered;
};

export const getAvailableQuizCategories = (questions: QuizQuestion[]) => {
  const categoryMap = new Map<string, { key: string; label: string; count: number }>();

  for (const question of questions) {
    const key = normalizeCategoryKey(question.category);
    const current = categoryMap.get(key);
    if (current) {
      current.count += 1;
      continue;
    }

    categoryMap.set(key, {
      key,
      label: titleCase(key),
      count: 1,
    });
  }

  return Array.from(categoryMap.values()).sort((left, right) => right.count - left.count);
};

export const getQuizBankStats = (questions: QuizQuestion[]) => {
  const categories = getAvailableQuizCategories(questions);
  const deckCount = new Set(questions.map((question) => question.quizTitle.trim() || "AI Knowledge Arena")).size;

  return {
    totalQuestions: questions.length,
    categories: categories.length,
    decks: deckCount,
  };
};

export const getQuestionPoints = (question: QuizQuestion, streakBeforeAnswer: number) => {
  const streakMultiplier = 1 + Math.min(streakBeforeAnswer, 4) * 0.18;
  return Math.round(difficultyWeight[question.difficulty] * streakMultiplier);
};

export const buildQuizSession = ({
  questions,
  mode,
  category,
  seedKey,
  sourceQuestions,
}: {
  questions: QuizQuestion[];
  mode: QuizModeId;
  category?: string | null;
  seedKey: string;
  sourceQuestions?: QuizQuestion[];
}): QuizSession => {
  const config = QUIZ_MODE_CONFIG[mode];
  const normalizedCategory = normalizeCategoryKey(category);
  const baseQuestions = sourceQuestions && sourceQuestions.length > 0 ? sourceQuestions : questions;
  const scopedQuestions =
    mode === "category" && normalizedCategory && normalizedCategory !== "all"
      ? baseQuestions.filter((question) => normalizeCategoryKey(question.category) === normalizedCategory)
      : baseQuestions;

  const playableQuestions = scopedQuestions.length > 0 ? scopedQuestions : baseQuestions;
  const questionCount = Math.min(config.questionCount, playableQuestions.length);
  const selectedQuestions = pickQuestions(playableQuestions, mode, questionCount, `${mode}-${normalizedCategory}-${seedKey}`);
  const categoryLabel =
    mode === "category" && normalizedCategory && normalizedCategory !== "all"
      ? titleCase(normalizedCategory)
      : null;

  const saveTitle = categoryLabel ? `${config.title} · ${categoryLabel}` : config.title;

  return {
    id: `${mode}-${seedKey}`,
    mode,
    title: config.title,
    subtitle: categoryLabel ? `${config.subtitle} · ${categoryLabel}` : config.subtitle,
    description: config.description,
    category: categoryLabel,
    questions: selectedQuestions,
    lives: config.lives,
    saveTitle,
  };
};
