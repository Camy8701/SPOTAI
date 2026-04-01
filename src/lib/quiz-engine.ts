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

export type QuizModeId = "progressive" | "daily";

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
  difficulty: QuizDifficulty;
  title: string;
  subtitle: string;
  description: string;
  category: string | null;
  questions: QuizQuestion[];
  lives: number | null;
  saveTitle: string;
  questionCount: number;
  timePerQuestion: number;
};

export type QuizDifficultyConfig = {
  id: QuizDifficulty;
  label: string;
  subtitle: string;
  description: string;
  accentClassName: string;
  surfaceClassName: string;
  buttonClassName: string;
};

export const QUIZ_MODE_CONFIG: Record<QuizModeId, QuizModeConfig> = {
  progressive: {
    id: "progressive",
    title: "AI Knowledge Arena",
    subtitle: "Progressive rounds that build from calm starts to harder finishes",
    description:
      "Choose a difficulty lane, set the question count, and play a shuffled round with a ten-second timer on every question.",
    questionCount: 10,
    lives: null,
    accentClassName: "from-sky-400 via-indigo-400 to-fuchsia-500",
    surfaceClassName: "border-sky-200 bg-sky-50/70",
  },
  daily: {
    id: "daily",
    title: "Daily Challenge",
    subtitle: "A fresh set of questions every day",
    description: "Test your knowledge with a daily quiz challenge.",
    questionCount: 5,
    lives: null,
    accentClassName: "from-amber-400 via-orange-400 to-red-500",
    surfaceClassName: "border-amber-200 bg-amber-50/70",
  },
};

export const QUIZ_DIFFICULTY_CONFIG: Record<QuizDifficulty, QuizDifficultyConfig> = {
  easy: {
    id: "easy",
    label: "Easy",
    subtitle: "Warm start",
    description: "A softer opening with more fundamentals before the round steps upward.",
    accentClassName: "from-sky-400 via-cyan-400 to-blue-500",
    surfaceClassName: "border-sky-200 bg-sky-50/80",
    buttonClassName:
      "border-sky-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 data-[active=true]:border-sky-500 data-[active=true]:bg-sky-500 data-[active=true]:text-white",
  },
  medium: {
    id: "medium",
    label: "Medium",
    subtitle: "Balanced climb",
    description: "A more even spread with a clean ramp from easy into medium and hard.",
    accentClassName: "from-fuchsia-400 via-pink-400 to-violet-500",
    surfaceClassName: "border-fuchsia-200 bg-fuchsia-50/80",
    buttonClassName:
      "border-fuchsia-200 bg-white text-slate-700 hover:border-fuchsia-300 hover:bg-fuchsia-50 data-[active=true]:border-fuchsia-500 data-[active=true]:bg-fuchsia-500 data-[active=true]:text-white",
  },
  hard: {
    id: "hard",
    label: "Hard",
    subtitle: "Steeper finish",
    description: "Still starts readable, but pushes into harder questions earlier and stays there.",
    accentClassName: "from-amber-400 via-orange-500 to-rose-500",
    surfaceClassName: "border-amber-200 bg-amber-50/80",
    buttonClassName:
      "border-amber-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 data-[active=true]:border-amber-500 data-[active=true]:bg-amber-500 data-[active=true]:text-white",
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

const getProgressiveDifficultyPlan = (
  difficulty: QuizDifficulty,
  total: number,
): QuizDifficulty[] => {
  const plan: QuizDifficulty[] = [];

  for (let index = 0; index < total; index += 1) {
    const progress = total <= 1 ? 1 : index / (total - 1);

    if (difficulty === "easy") {
      if (progress < 0.5) {
        plan.push("easy");
      } else if (progress < 0.82) {
        plan.push("medium");
      } else {
        plan.push("hard");
      }
      continue;
    }

    if (difficulty === "medium") {
      if (progress < 0.28) {
        plan.push("easy");
      } else if (progress < 0.7) {
        plan.push("medium");
      } else {
        plan.push("hard");
      }
      continue;
    }

    if (progress < 0.18) {
      plan.push("easy");
    } else if (progress < 0.42) {
      plan.push("medium");
    } else {
      plan.push("hard");
    }
  }

  return plan;
};

const getFallbackDifficultyOrder = (difficulty: QuizDifficulty): QuizDifficulty[] => {
  if (difficulty === "easy") return ["easy", "medium", "hard"];
  if (difficulty === "medium") return ["medium", "hard", "easy"];
  return ["hard", "medium", "easy"];
};

const pickQuestions = (
  questions: QuizQuestion[],
  difficulty: QuizDifficulty,
  questionCount: number,
  seedKey: string,
) => {
  const shuffled = shuffleWithSeed(questions, seedKey);
  const plan = getProgressiveDifficultyPlan(difficulty, questionCount);
  const buckets: Record<QuizDifficulty, QuizQuestion[]> = {
    easy: shuffled.filter((question) => question.difficulty === "easy"),
    medium: shuffled.filter((question) => question.difficulty === "medium"),
    hard: shuffled.filter((question) => question.difficulty === "hard"),
  };
  const cursors: Record<QuizDifficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
  };
  const usedIds = new Set<string>();
  const selected: QuizQuestion[] = [];

  const takeFromDifficulty = (targetDifficulty: QuizDifficulty) => {
    const bucket = buckets[targetDifficulty];
    while (cursors[targetDifficulty] < bucket.length) {
      const question = bucket[cursors[targetDifficulty]];
      cursors[targetDifficulty] += 1;
      const key = String(question.id);
      if (usedIds.has(key)) continue;
      usedIds.add(key);
      return question;
    }
    return null;
  };

  for (const targetDifficulty of plan) {
    const fallbackOrder = getFallbackDifficultyOrder(targetDifficulty);
    const question = fallbackOrder
      .map((difficultyKey) => takeFromDifficulty(difficultyKey))
      .find((item): item is QuizQuestion => !!item);

    if (question) selected.push(question);
    if (selected.length >= questionCount) break;
  }

  for (const question of shuffled) {
    if (selected.length >= questionCount) break;
    const key = String(question.id);
    if (usedIds.has(key)) continue;
    usedIds.add(key);
    selected.push(question);
  }

  return selected.slice(0, questionCount);
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

export const getQuestionPoints = (
  question: QuizQuestion,
  streakBeforeAnswer: number,
  selectedDifficulty: QuizDifficulty = "medium",
) => {
  const streakMultiplier = 1 + Math.min(streakBeforeAnswer, 4) * 0.18;
  const laneMultiplier =
    selectedDifficulty === "easy" ? 1 : selectedDifficulty === "medium" ? 1.12 : 1.28;
  return Math.round(difficultyWeight[question.difficulty] * streakMultiplier * laneMultiplier);
};

export const buildQuizSession = ({
  questions,
  difficulty,
  questionCount,
  seedKey,
  sourceQuestions,
}: {
  questions: QuizQuestion[];
  difficulty: QuizDifficulty;
  questionCount: number;
  seedKey: string;
  sourceQuestions?: QuizQuestion[];
}): QuizSession => {
  const config = QUIZ_MODE_CONFIG.progressive;
  const baseQuestions = sourceQuestions && sourceQuestions.length > 0 ? sourceQuestions : questions;
  const playableQuestions = baseQuestions.length > 0 ? baseQuestions : questions;
  const finalQuestionCount = Math.min(questionCount, playableQuestions.length);
  const selectedQuestions = pickQuestions(
    playableQuestions,
    difficulty,
    finalQuestionCount,
    `${difficulty}-${questionCount}-${seedKey}`,
  );
  const difficultyLabel = QUIZ_DIFFICULTY_CONFIG[difficulty].label;

  return {
    id: `progressive-${difficulty}-${seedKey}`,
    mode: "progressive",
    difficulty,
    title: config.title,
    subtitle: `${difficultyLabel} lane · ${finalQuestionCount} questions`,
    description: config.description,
    category: null,
    questions: selectedQuestions,
    lives: null,
    saveTitle: `${config.title} · ${difficultyLabel}`,
    questionCount: finalQuestionCount,
    timePerQuestion: 10,
  };
};
