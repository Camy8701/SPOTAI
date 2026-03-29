import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarDays,
  CheckCircle2,
  Flame,
  Heart,
  Layers3,
  RotateCcw,
  ShieldAlert,
  Star,
  Swords,
  XCircle,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import QuizArenaHud from "@/components/quiz/QuizArenaHud";
import QuizModeCard from "@/components/quiz/QuizModeCard";
import QuizSummaryCard from "@/components/quiz/QuizSummaryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fallbackQuizQuestions } from "@/lib/quiz-content";
import {
  QUIZ_MODE_CONFIG,
  buildQuizSession,
  getQuestionPoints,
  getQuizBankStats,
  type QuizModeId,
  type QuizQuestion,
  type QuizSession,
} from "@/lib/quiz-engine";
import {
  buildQuizAttemptsPayload,
  computeUpdatedQuizPlayerStats,
  type QuizPlayerStatsRow,
} from "@/lib/quiz-progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type QuizQuestionRow = Database["public"]["Tables"]["quiz_questions"]["Row"];

type RevealState = {
  selectedIndex: number;
  isCorrect: boolean;
  pointsEarned: number;
  livesAfterAnswer: number | null;
};

const modeIcons = {
  daily: CalendarDays,
  classic: Brain,
  survival: ShieldAlert,
  category: Layers3,
  recovery: RotateCcw,
} as const;

const modeStatLabels: Record<QuizModeId, string> = {
  daily: "5-question ritual",
  classic: "10-question ramp",
  survival: "3 lives",
  category: "Focused deck",
  recovery: "Weak spots remixed",
};

const visibleModes: QuizModeId[] = ["daily", "classic", "survival"];

const formatCategoryLabel = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeDifficulty = (value?: string | null): QuizQuestion["difficulty"] => {
  if (value === "easy" || value === "hard") return value;
  return "medium";
};

const normalizeQuestion = (item: QuizQuestionRow): QuizQuestion | null => {
  const options = Array.isArray(item.options) ? item.options.map((option) => String(option)) : [];
  const correctAnswer = Number(item.correct_answer);

  if (options.length < 2 || Number.isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
    return null;
  }

  return {
    id: item.id,
    quizTitle: (item.quiz_title || "AI Knowledge Arena").trim(),
    category: (item.category || "general").trim().toLowerCase().replace(/\s+/g, "-"),
    difficulty: normalizeDifficulty(item.difficulty),
    question: item.question,
    options,
    correctAnswer,
    explanation: item.explanation?.trim() || "No explanation provided yet.",
  };
};

const getRecoveryIdsFromAttempts = (attempts: Array<{ question_id: string; is_correct: boolean }>) => {
  const latestByQuestion = new Map<string, boolean>();

  for (const attempt of attempts) {
    const key = String(attempt.question_id);
    if (latestByQuestion.has(key)) continue;
    latestByQuestion.set(key, attempt.is_correct);
  }

  return Array.from(latestByQuestion.entries())
    .filter(([, isCorrect]) => !isCorrect)
    .map(([questionId]) => questionId);
};

const Quiz = () => {
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();
  const { user } = useAuth();

  const [questionPool, setQuestionPool] = useState<QuizQuestion[]>(fallbackQuizQuestions);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<QuizModeId>("daily");
  const [activeSession, setActiveSession] = useState<QuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<number | null>>([]);
  const [revealState, setRevealState] = useState<RevealState | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [roundPoints, setRoundPoints] = useState(0);
  const [awardedPoints, setAwardedPoints] = useState<number[]>([]);
  const [livesRemaining, setLivesRemaining] = useState<number | null>(null);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [sessionNonce, setSessionNonce] = useState(0);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState<QuizPlayerStatsRow | null>(null);
  const [playerStatsLoading, setPlayerStatsLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState<Array<{
    id: string;
    quiz_title: string;
    mode: string;
    correct_count: number;
    total_questions: number;
    completed_at: string;
  }>>([]);
  const [recoveryQuestionIds, setRecoveryQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      setQuestionsLoading(true);

      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error || !data || data.length === 0) {
        setQuestionPool(fallbackQuizQuestions);
        setQuestionsLoading(false);
        return;
      }

      const mappedQuestions = data
        .map((item) => normalizeQuestion(item))
        .filter((item): item is QuizQuestion => !!item);

      setQuestionPool(mappedQuestions.length > 0 ? mappedQuestions : fallbackQuizQuestions);
      setQuestionsLoading(false);
    };

    loadQuestions();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setPlayerStats(null);
      setPlayerStatsLoading(false);
      setRecentSessions([]);
      setRecoveryQuestionIds([]);
      return;
    }

    let mounted = true;
    setPlayerStatsLoading(true);

    Promise.all([
      supabase
        .from("quiz_player_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("quiz_sessions")
        .select("id, quiz_title, mode, correct_count, total_questions, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(4),
      supabase
        .from("quiz_question_attempts")
        .select("question_id, is_correct")
        .eq("user_id", user.id)
        .order("answered_at", { ascending: false })
        .limit(80),
    ]).then(([statsRes, sessionsRes, attemptsRes]) => {
        if (!mounted) return;
        setPlayerStats(statsRes.data || null);
        setRecentSessions(sessionsRes.data || []);
        setRecoveryQuestionIds(getRecoveryIdsFromAttempts(attemptsRes.data || []));
        setPlayerStatsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const bankStats = useMemo(() => getQuizBankStats(questionPool), [questionPool]);
  const recoveryQuestions = useMemo(() => {
    if (recoveryQuestionIds.length === 0) return [];
    const questionMap = new Map(questionPool.map((question) => [String(question.id), question]));
    return recoveryQuestionIds
      .map((id) => questionMap.get(id))
      .filter((question): question is QuizQuestion => !!question);
  }, [questionPool, recoveryQuestionIds]);
  const currentQuestion = activeSession?.questions[currentQuestionIndex] ?? null;
  const answeredQuestionCount = selectedAnswers.filter((value) => typeof value === "number").length;
  const overallAccuracy =
    playerStats && playerStats.total_questions_answered > 0
      ? Math.round((playerStats.total_correct_answers / playerStats.total_questions_answered) * 100)
      : null;
  const todayKey = new Date().toISOString().slice(0, 10);
  const completedDailyToday = playerStats?.last_daily_challenge_date === todayKey;
  const favoriteCategoryLabel = playerStats?.favorite_category ? formatCategoryLabel(playerStats.favorite_category) : "Still learning your style";
  const recommendedMode: QuizModeId =
    !completedDailyToday ? "daily" : overallAccuracy !== null && overallAccuracy >= 80 ? "survival" : "classic";

  const resetRunState = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setRevealState(null);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setRoundPoints(0);
    setAwardedPoints([]);
    setSummaryVisible(false);
    setSavedSessionId(null);
  };

  const startMode = (modeOverride?: QuizModeId, sourceQuestionsOverride?: QuizQuestion[]) => {
    const nextMode = modeOverride || selectedMode;
    const sourceQuestions =
      sourceQuestionsOverride ||
      (nextMode === "recovery" ? recoveryQuestions : undefined);

    if (nextMode === "recovery" && (!sourceQuestions || sourceQuestions.length === 0)) {
      toast({
        title: "Recovery run not ready",
        description: "Play more rounds first and your missed questions will collect here.",
      });
      return;
    }

    const seedKey =
      nextMode === "daily"
        ? new Date().toISOString().slice(0, 10)
        : `${Date.now()}-${sessionNonce}`;

    const session = buildQuizSession({
      questions: questionPool,
      mode: nextMode,
      category: null,
      seedKey,
      sourceQuestions,
    });

    if (session.questions.length === 0) {
      toast({
        title: "No questions available",
        description: "Add more quiz questions or choose another category.",
        variant: "destructive",
      });
      return;
    }

    setSelectedMode(nextMode);
    setActiveSession(session);
    resetRunState();
    setLivesRemaining(session.lives);
    setSessionNonce((value) => value + 1);
  };

  const returnToHub = () => {
    setActiveSession(null);
    resetRunState();
    setLivesRemaining(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!currentQuestion || revealState) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const pointsEarned = isCorrect ? getQuestionPoints(currentQuestion, streak) : 0;
    const nextLives = livesRemaining === null ? null : isCorrect ? livesRemaining : Math.max(livesRemaining - 1, 0);

    setSelectedAnswers((previous) => {
      const next = [...previous];
      next[currentQuestionIndex] = answerIndex;
      return next;
    });
    setAwardedPoints((previous) => {
      const next = [...previous];
      next[currentQuestionIndex] = pointsEarned;
      return next;
    });
    setRevealState({
      selectedIndex: answerIndex,
      isCorrect,
      pointsEarned,
      livesAfterAnswer: nextLives,
    });
    setCorrectCount((value) => value + (isCorrect ? 1 : 0));
    setRoundPoints((value) => value + pointsEarned);
    setStreak(nextStreak);
    setMaxStreak((value) => Math.max(value, nextStreak));
    setLivesRemaining(nextLives);
  };

  const advanceRun = () => {
    if (!activeSession || !revealState) return;

    const outOfLives = revealState.livesAfterAnswer !== null && revealState.livesAfterAnswer <= 0;
    const isLastQuestion = currentQuestionIndex >= activeSession.questions.length - 1;

    if (outOfLives || isLastQuestion) {
      setSummaryVisible(true);
      setRevealState(null);
      return;
    }

    setCurrentQuestionIndex((value) => value + 1);
    setRevealState(null);
  };

  const replayCurrentMode = () => {
    if (!activeSession) {
      startMode();
      return;
    }

    startMode(activeSession.mode);
  };

  const categoryBreakdown = useMemo(() => {
    if (!activeSession) return [];

    const map = new Map<string, { label: string; correct: number; total: number }>();

    activeSession.questions.slice(0, answeredQuestionCount).forEach((question, index) => {
      const label = formatCategoryLabel(question.category);
      const current = map.get(label) || { label, correct: 0, total: 0 };
      current.total += 1;
      if (selectedAnswers[index] === question.correctAnswer) current.correct += 1;
      map.set(label, current);
    });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        ratio: item.total === 0 ? 0 : item.correct / item.total,
      }))
      .sort((left, right) => right.total - left.total);
  }, [activeSession, answeredQuestionCount, selectedAnswers]);

  const immediateRecoveryQuestions = useMemo(() => {
    if (!activeSession || answeredQuestionCount === 0) return [];

    return activeSession.questions.slice(0, answeredQuestionCount).filter((question, index) => {
      const answer = selectedAnswers[index];
      return typeof answer === "number" && answer !== question.correctAnswer;
    });
  }, [activeSession, answeredQuestionCount, selectedAnswers]);

  useEffect(() => {
    if (!user || !activeSession || !summaryVisible || savedSessionId === activeSession.id || answeredQuestionCount === 0) return;

    const saveResult = async () => {
      const playedSession: QuizSession = {
        ...activeSession,
        questions: activeSession.questions.slice(0, answeredQuestionCount),
      };
      const answeredSelections = selectedAnswers.slice(0, answeredQuestionCount);
      const answeredPoints = awardedPoints.slice(0, answeredQuestionCount);
      const incorrectCount = answeredQuestionCount - correctCount;
      const difficultyBand = Array.from(new Set(playedSession.questions.map((question) => question.difficulty))).join(",");

      const { data: sessionData, error: sessionError } = await supabase
        .from("quiz_sessions")
        .insert({
          user_id: user.id,
          mode: playedSession.mode,
          quiz_title: playedSession.saveTitle,
          category: playedSession.category?.toLowerCase().replace(/\s+/g, "-") || null,
          difficulty_band: difficultyBand || null,
          score: correctCount,
          total_questions: answeredQuestionCount,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          max_streak: maxStreak,
          xp_earned: roundPoints,
          lives_start: playedSession.lives,
          lives_remaining: livesRemaining,
          answers: answeredSelections.map((value) => (typeof value === "number" ? value : null)),
        })
        .select("id")
        .single();

      if (sessionError || !sessionData) {
        toast({
          title: "Could not save quiz session",
          description: sessionError?.message || "The run session could not be written.",
          variant: "destructive",
        });
        return;
      }

      const attemptsPayload = buildQuizAttemptsPayload({
        sessionId: sessionData.id,
        userId: user.id,
        session: playedSession,
        selectedAnswers: answeredSelections,
        awardedPoints: answeredPoints,
      });

      if (attemptsPayload.length > 0) {
        const { error: attemptsError } = await supabase.from("quiz_question_attempts").insert(attemptsPayload);

        if (attemptsError) {
          toast({
            title: "Could not save question attempts",
            description: attemptsError.message,
            variant: "destructive",
          });
          return;
        }
      }

      const nextStats = computeUpdatedQuizPlayerStats({
        previous: playerStats,
        session: playedSession,
        selectedAnswers: answeredSelections,
        awardedPoints: answeredPoints,
        maxStreak,
      });

      const { error: statsError } = await supabase.from("quiz_player_stats").upsert(
        {
          user_id: user.id,
          ...nextStats,
        },
        { onConflict: "user_id" },
      );

      if (statsError) {
        toast({
          title: "Could not update quiz stats",
          description: statsError.message,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("quiz_results").insert({
        user_id: user.id,
        quiz_title: playedSession.saveTitle,
        score: correctCount,
        total_questions: answeredQuestionCount,
        answers: answeredSelections.map((value) => (typeof value === "number" ? value : null)),
      });

      if (error) {
        toast({
          title: "Could not save quiz result",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSavedSessionId(activeSession.id);
      setPlayerStats((previous) => ({
        user_id: user.id,
        current_streak_days: nextStats.current_streak_days,
        best_streak_days: nextStats.best_streak_days,
        total_sessions: nextStats.total_sessions,
        total_correct_answers: nextStats.total_correct_answers,
        total_questions_answered: nextStats.total_questions_answered,
        total_xp: nextStats.total_xp,
        longest_answer_streak: nextStats.longest_answer_streak,
        favorite_category: nextStats.favorite_category,
        last_daily_challenge_date: nextStats.last_daily_challenge_date,
        created_at: previous?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setRecentSessions((previous) => [
        {
          id: sessionData.id,
          quiz_title: playedSession.saveTitle,
          mode: playedSession.mode,
          correct_count: correctCount,
          total_questions: answeredQuestionCount,
          completed_at: new Date().toISOString(),
        },
        ...previous,
      ].slice(0, 4));
      setRecoveryQuestionIds((previous) => {
        const next = new Set(previous);
        attemptsPayload.forEach((attempt) => {
          const key = String(attempt.question_id);
          if (attempt.is_correct) {
            next.delete(key);
          } else {
            next.add(key);
          }
        });
        return Array.from(next);
      });
      toast({
        title: "Run saved",
        description: "Your quiz history, streak-ready stats, and latest run are now stored.",
      });
    };

    saveResult();
  }, [
    activeSession,
    answeredQuestionCount,
    awardedPoints,
    correctCount,
    livesRemaining,
    maxStreak,
    playerStats,
    roundPoints,
    savedSessionId,
    selectedAnswers,
    summaryVisible,
    toast,
    user,
  ]);

  return (
    <Layout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.16),transparent_22%),linear-gradient(180deg,#0b1020_0%,#090d18_50%,#070a12_100%)] text-white">
        <section className="relative overflow-hidden border-b border-white/8">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:88px_88px] opacity-20" />
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {!activeSession ? (
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <div className="relative z-10 space-y-6">
                  <Badge className="rounded-full border-white/15 bg-white/8 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-white/75" variant="outline">
                    SpotAI quiz arena
                  </Badge>

                  <div className="space-y-4">
                    <h1 className="max-w-3xl text-5xl leading-none text-white sm:text-6xl" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                      Pick a lane and jump straight into the quiz arena.
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-slate-200/75 sm:text-lg">
                      Three streamlined modes, cleaner pacing, and recovery runs that unlock automatically after you miss a few questions.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">
                      3 core modes
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">
                      Instant answer feedback
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">
                      Recovery runs after misses
                    </span>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_18px_60px_rgba(10,14,39,0.18)] backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Arena profile</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {playerStatsLoading ? "Loading…" : `${playerStats?.current_streak_days || 0}-day streak`}
                        </p>
                      </div>
                      <Badge className="rounded-full border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/72" variant="outline">
                        {completedDailyToday ? "Daily cleared" : "Daily ready"}
                      </Badge>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-3xl font-semibold text-white">{playerStats?.total_sessions || 0}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Runs played</p>
                      </div>
                      <div>
                        <p className="text-3xl font-semibold text-white">{playerStats?.total_xp || 0}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Arena XP</p>
                      </div>
                      <div>
                        <p className="text-3xl font-semibold text-white">{overallAccuracy ?? "—"}{overallAccuracy !== null ? "%" : ""}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Accuracy</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">{favoriteCategoryLabel}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Favorite lane</p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Question bank</p>
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-2xl font-semibold text-white">{bankStats.totalQuestions}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Questions</p>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-white">{bankStats.categories}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Categories</p>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-white">{bankStats.decks}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Decks</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Suggested next</p>
                      <p className="mt-2 text-xl font-semibold text-white">{QUIZ_MODE_CONFIG[recommendedMode].title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200/74">
                        {recommendedMode === "daily" && "Your daily rhythm is open. Clear a quick run to keep the streak simple."}
                        {recommendedMode === "classic" && "Classic Arena is the cleanest all-round session when you want balanced progression."}
                        {recommendedMode === "survival" && "Your accuracy is strong enough to handle a longer run with lives on the line."}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Recent runs</p>
                        <Badge className="rounded-full border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70" variant="outline">
                          {recentSessions.length}
                        </Badge>
                      </div>
                      {recentSessions.length === 0 ? (
                        <p className="mt-3 text-sm leading-6 text-slate-200/72">
                          Finish your first run and it will show up here with score and mode history.
                        </p>
                      ) : (
                        <div className="mt-3 space-y-3">
                          {recentSessions.slice(0, 2).map((session) => (
                            <div key={session.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-white">{session.quiz_title}</p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/50">
                                    {session.mode} · {new Date(session.completed_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-sm font-semibold text-white">
                                  {session.correct_count}/{session.total_questions}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={returnToHub}
                    className="h-11 rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to quiz hub
                  </Button>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70" variant="outline">
                      {activeSession.title}
                    </Badge>
                    {activeSession.category && (
                      <Badge className="rounded-full border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70" variant="outline">
                        {activeSession.category}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl text-white sm:text-5xl" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                    {activeSession.subtitle}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-200/72 sm:text-base">
                    {activeSession.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {!activeSession ? (
            <div className="space-y-10">
              <div className="grid gap-5 lg:grid-cols-3">
                {visibleModes.map((modeId) => {
                  const mode = QUIZ_MODE_CONFIG[modeId];
                  const Icon = modeIcons[mode.id];
                  return (
                    <QuizModeCard
                      key={mode.id}
                      mode={mode}
                      icon={Icon}
                      isSelected={recommendedMode === mode.id}
                      statLabel={modeStatLabels[mode.id]}
                      onSelect={() => startMode(mode.id)}
                    />
                  );
                })}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_60px_rgba(10,14,39,0.18)] backdrop-blur-xl sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Recovery runs</p>
                    <h2 className="mt-2 text-3xl text-white" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                      Clean up missed questions when they matter.
                    </h2>
                  </div>
                  <Badge className="rounded-full border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70" variant="outline">
                    {recoveryQuestions.length} queued
                  </Badge>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200/75">
                  Recovery is no longer a full top-level mode. It appears as a lightweight follow-up once you miss enough questions to make a useful retry deck.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => startMode("recovery", recoveryQuestions)}
                    disabled={recoveryQuestions.length === 0}
                    className="h-12 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 hover:bg-white/90"
                  >
                    {recoveryQuestions.length === 0 ? "Unlock recovery by playing first" : "Fix missed questions"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="inline-flex h-12 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    {completedDailyToday ? "Daily cleared today" : "Daily challenge still open"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <QuizArenaHud
                mode={QUIZ_MODE_CONFIG[activeSession.mode]}
                questionIndex={currentQuestionIndex}
                totalQuestions={activeSession.questions.length}
                correctCount={correctCount}
                streak={streak}
                livesRemaining={livesRemaining}
                roundPoints={roundPoints}
              />

              <AnimatePresence mode="wait">
                {summaryVisible ? (
                  <QuizSummaryCard
                    key="summary"
                    mode={QUIZ_MODE_CONFIG[activeSession.mode]}
                    correctCount={correctCount}
                    totalQuestions={answeredQuestionCount}
                    maxStreak={maxStreak}
                    roundPoints={roundPoints}
                    categoryBreakdown={categoryBreakdown}
                    onReplay={replayCurrentMode}
                    onReturnToHub={returnToHub}
                  />
                ) : currentQuestion ? (
                  <motion.div
                    key={currentQuestion.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, y: -18 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]"
                  >
                    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_60px_rgba(10,14,39,0.18)] backdrop-blur-xl sm:p-8">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="rounded-full border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70" variant="outline">
                          {formatCategoryLabel(currentQuestion.category)}
                        </Badge>
                        <Badge className="rounded-full border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70" variant="outline">
                          {currentQuestion.difficulty}
                        </Badge>
                        <Badge className="rounded-full border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70" variant="outline">
                          {currentQuestion.quizTitle}
                        </Badge>
                      </div>

                      <div className="mt-6 space-y-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Now playing</p>
                          <h2 className="mt-3 text-3xl leading-tight text-white sm:text-4xl" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                            {currentQuestion.question}
                          </h2>
                        </div>

                        <div className="grid gap-3">
                          {currentQuestion.options.map((option, index) => {
                            const isSelected = revealState?.selectedIndex === index;
                            const isCorrect = revealState && index === currentQuestion.correctAnswer;
                            const isWrongPick = revealState && isSelected && !revealState.isCorrect;

                            return (
                              <motion.button
                                key={option}
                                type="button"
                                onClick={() => handleAnswerSelect(index)}
                                whileHover={shouldReduceMotion || revealState ? {} : { scale: 1.01, y: -1 }}
                                whileTap={shouldReduceMotion || revealState ? {} : { scale: 0.995 }}
                                className={cn(
                                  "w-full rounded-[1.55rem] border p-4 text-left transition-all sm:p-5",
                                  "bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]",
                                  !revealState && "border-white/10 hover:border-white/28",
                                  isSelected && "border-white/40 ring-2 ring-white/45",
                                  isCorrect && revealState?.isCorrect && "border-emerald-400/70 bg-emerald-500/18",
                                  isCorrect && !revealState?.isCorrect && "border-emerald-400/70 bg-emerald-500/16",
                                  isWrongPick && "border-rose-400/70 bg-rose-500/18",
                                )}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex gap-4">
                                    <div className={cn(
                                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold",
                                      !revealState && "border-white/10 bg-white/6 text-white/80",
                                      isCorrect && "border-emerald-300/40 bg-emerald-300/20 text-white",
                                      isWrongPick && "border-rose-300/40 bg-rose-300/20 text-white",
                                    )}>
                                      {String.fromCharCode(65 + index)}
                                    </div>
                                    <div>
                                      <p className="text-base font-medium text-white">{option}</p>
                                      {!revealState && (
                                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Tap to lock in</p>
                                      )}
                                    </div>
                                  </div>

                                  {revealState && isCorrect && <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-300" />}
                                  {isWrongPick && <XCircle className="mt-1 h-5 w-5 text-rose-300" />}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_60px_rgba(10,14,39,0.18)] backdrop-blur-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Run context</p>
                        <div className="mt-5 space-y-4 text-sm leading-6 text-slate-200/74">
                          <div className="rounded-[1.3rem] border border-white/10 bg-black/15 p-4">
                            {activeSession.mode === "daily" && "Today’s five-question lineup is fixed, so finishing the run is the win condition."}
                            {activeSession.mode === "classic" && "Classic Arena starts broad, then pushes you into harder questions before the summary."}
                            {activeSession.mode === "survival" && "Every wrong answer costs a life. Protect your streak and finish before lives run out."}
                            {activeSession.mode === "category" && "This deck stays inside one topic so you can build focused mastery instead of jumping around."}
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Current streak</p>
                              <p className="mt-2 text-2xl font-semibold text-white">{streak}</p>
                            </div>
                            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Best streak</p>
                              <p className="mt-2 text-2xl font-semibold text-white">{maxStreak}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {revealState ? (
                          <motion.div
                            key={`${currentQuestion.id}-reveal`}
                            initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
                            animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                            exit={shouldReduceMotion ? {} : { opacity: 0, x: 14 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            role="alert"
                            className={cn(
                              "rounded-[2rem] border p-6 shadow-[0_18px_60px_rgba(10,14,39,0.18)] backdrop-blur-xl",
                              revealState.isCorrect
                                ? "border-emerald-400/25 bg-emerald-500/12"
                                : "border-rose-400/25 bg-rose-500/12",
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Answer feedback</p>
                                <h3 className="mt-2 text-2xl text-white" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                                  {revealState.isCorrect ? "Nice hit." : "Close, but not this one."}
                                </h3>
                              </div>
                              <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                                +{revealState.pointsEarned} XP
                              </div>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-slate-100/78">
                              {currentQuestion.explanation}
                            </p>

                            {!revealState.isCorrect && (
                              <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-black/15 p-4 text-sm text-slate-100/78">
                                Correct answer: <span className="font-semibold text-white">{currentQuestion.options[currentQuestion.correctAnswer]}</span>
                              </div>
                            )}

                            <div className="mt-5 flex flex-wrap gap-3">
                              <Button type="button" onClick={advanceRun} className="h-11 rounded-full bg-white px-5 text-slate-950 hover:bg-white/90">
                                {currentQuestionIndex >= activeSession.questions.length - 1 || (revealState.livesAfterAnswer !== null && revealState.livesAfterAnswer <= 0)
                                  ? "View summary"
                                  : "Next question"}
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                              {!revealState.isCorrect && activeSession.mode === "survival" && (
                                <div className="inline-flex h-11 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                                  <Heart className="mr-2 h-4 w-4" />
                                  {revealState.livesAfterAnswer} lives left
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="prompt"
                            initial={shouldReduceMotion ? false : { opacity: 0, x: 12 }}
                            animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                            exit={shouldReduceMotion ? {} : { opacity: 0, x: 12 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_60px_rgba(10,14,39,0.18)] backdrop-blur-xl"
                          >
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Momentum cue</p>
                            <h3 className="mt-2 text-2xl text-white" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                              Lock your answer with confidence.
                            </h3>
                            <p className="mt-4 text-sm leading-6 text-slate-200/72">
                              Each correct answer adds to your streak and boosts the XP payout. In Survival, wrong picks also cost lives.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                                <Star className="h-3.5 w-3.5" />
                                Difficulty-based scoring
                              </span>
                              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                                <Flame className="h-3.5 w-3.5" />
                                Streak multiplier
                              </span>
                              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                                <Swords className="h-3.5 w-3.5" />
                                One-more-run pacing
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {summaryVisible && (
                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={replayCurrentMode} className="h-11 rounded-full bg-white px-5 text-slate-950 hover:bg-white/90">
                    <RotateCcw className="h-4 w-4" />
                    Play again
                  </Button>
                  {immediateRecoveryQuestions.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => startMode("recovery", immediateRecoveryQuestions)}
                      className="h-11 rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                    >
                      Fix missed questions
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={returnToHub}
                    className="h-11 rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                  >
                    Back to hub
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Quiz;
