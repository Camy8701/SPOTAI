import type { Database } from "@/integrations/supabase/types";
import type { QuizQuestion, QuizSession } from "@/lib/quiz-engine";

export type QuizPlayerStatsRow = {
  user_id: string;
  current_streak_days: number;
  best_streak_days: number;
  total_sessions: number;
  total_correct_answers: number;
  total_questions_answered: number;
  total_xp: number;
  longest_answer_streak: number;
  favorite_category: string | null;
  last_daily_challenge_date: string | null;
  created_at: string;
  updated_at: string;
};

type AttemptRecord = {
  question: QuizQuestion;
  selectedAnswer: number | null;
  pointsEarned: number;
};

const getDateKey = (value: Date) => value.toISOString().slice(0, 10);

const getPreviousDateKey = (value: Date) => {
  const previous = new Date(value);
  previous.setDate(previous.getDate() - 1);
  return getDateKey(previous);
};

const getFavoriteCategory = (attempts: AttemptRecord[]) => {
  const counts = new Map<string, number>();

  for (const attempt of attempts) {
    counts.set(attempt.question.category, (counts.get(attempt.question.category) || 0) + 1);
  }

  const favorite = Array.from(counts.entries()).sort((left, right) => right[1] - left[1])[0];
  return favorite?.[0] || null;
};

export const buildQuizAttemptsPayload = ({
  sessionId,
  userId,
  session,
  selectedAnswers,
  awardedPoints,
}: {
  sessionId: string;
  userId: string;
  session: QuizSession;
  selectedAnswers: Array<number | null>;
  awardedPoints: number[];
}) =>
  session.questions.reduce<Array<{
    session_id: string;
    user_id: string;
    question_id: string;
    order_index: number;
    quiz_title: string;
    category: string;
    difficulty: string;
    question_text: string;
    selected_answer: number | null;
    correct_answer: number;
    is_correct: boolean;
    points_earned: number;
  }>>((items, question, index) => {
    const selectedAnswer = typeof selectedAnswers[index] === "number" ? selectedAnswers[index] : null;

    items.push({
      session_id: sessionId,
      user_id: userId,
      question_id: String(question.id),
      order_index: index,
      quiz_title: session.saveTitle,
      category: question.category,
      difficulty: question.difficulty,
      question_text: question.question,
      selected_answer: selectedAnswer,
      correct_answer: question.correctAnswer,
      is_correct: selectedAnswer !== null && selectedAnswer === question.correctAnswer,
      points_earned: awardedPoints[index] || 0,
    });

    return items;
  }, []);

export const computeUpdatedQuizPlayerStats = ({
  previous,
  session,
  selectedAnswers,
  awardedPoints,
  maxStreak,
  today = new Date(),
}: {
  previous: QuizPlayerStatsRow | null;
  session: QuizSession;
  selectedAnswers: Array<number | null>;
  awardedPoints: number[];
  maxStreak: number;
  today?: Date;
}) => {
  const attempts = session.questions.map((question, index) => ({
    question,
    selectedAnswer: typeof selectedAnswers[index] === "number" ? selectedAnswers[index] : null,
    pointsEarned: awardedPoints[index] || 0,
  }));
  const answeredAttempts = attempts.filter((attempt) => attempt.selectedAnswer !== null);

  const correctCount = answeredAttempts.filter((attempt) => attempt.selectedAnswer === attempt.question.correctAnswer).length;
  const totalQuestionsAnswered = answeredAttempts.length;
  const totalXp = answeredAttempts.reduce((sum, attempt) => sum + attempt.pointsEarned, 0);
  const favoriteCategory = session.category?.toLowerCase().replace(/\s+/g, "-") || getFavoriteCategory(answeredAttempts);

  const todayKey = getDateKey(today);
  const yesterdayKey = getPreviousDateKey(today);
  const lastDailyDate = previous?.last_daily_challenge_date || null;

  let currentStreakDays = previous?.current_streak_days || 0;
  let bestStreakDays = previous?.best_streak_days || 0;

  if (session.mode === "daily") {
    if (lastDailyDate === todayKey) {
      currentStreakDays = previous?.current_streak_days || 1;
    } else if (lastDailyDate === yesterdayKey) {
      currentStreakDays = (previous?.current_streak_days || 0) + 1;
    } else {
      currentStreakDays = 1;
    }

    bestStreakDays = Math.max(bestStreakDays, currentStreakDays);
  }

  return {
    current_streak_days: currentStreakDays,
    best_streak_days: bestStreakDays,
    total_sessions: (previous?.total_sessions || 0) + 1,
    total_correct_answers: (previous?.total_correct_answers || 0) + correctCount,
    total_questions_answered: (previous?.total_questions_answered || 0) + totalQuestionsAnswered,
    total_xp: (previous?.total_xp || 0) + totalXp,
    longest_answer_streak: Math.max(previous?.longest_answer_streak || 0, maxStreak),
    favorite_category: favoriteCategory,
    last_daily_challenge_date: session.mode === "daily" ? todayKey : previous?.last_daily_challenge_date || null,
  };
};
