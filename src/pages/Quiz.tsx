import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Flame,
  Loader2,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fallbackQuizQuestions } from "@/lib/quiz-content";
import {
  QUIZ_DIFFICULTY_CONFIG,
  buildQuizSession,
  getQuestionPoints,
  getQuizBankStats,
  type QuizDifficulty,
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
  selectedIndex: number | null;
  isCorrect: boolean;
  pointsEarned: number;
  timedOut: boolean;
};

type RecentSession = {
  id: string;
  quiz_title: string;
  correct_count: number;
  total_questions: number;
  xp_earned: number;
  completed_at: string;
  difficulty_band: string | null;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  completedAt: string;
  isCurrentUser: boolean;
};

const QUESTION_COUNT_OPTIONS = [10, 15, 20, 25, 30];
const TIME_PER_QUESTION = 10;

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

const Quiz = () => {
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const difficultyParam = searchParams.get("difficulty");
  const countParam = Number(searchParams.get("count"));
  const autoStartRequested = searchParams.get("autostart") === "1";

  const [questionPool, setQuestionPool] = useState<QuizQuestion[]>(fallbackQuizQuestions);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>("medium");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(15);
  const [activeSession, setActiveSession] = useState<QuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<number | null>>([]);
  const [revealState, setRevealState] = useState<RevealState | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [roundPoints, setRoundPoints] = useState(0);
  const [awardedPoints, setAwardedPoints] = useState<number[]>([]);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [sessionNonce, setSessionNonce] = useState(0);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState<QuizPlayerStatsRow | null>(null);
  const [playerStatsLoading, setPlayerStatsLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(TIME_PER_QUESTION);
  const hasAutoStartedRef = useRef(false);
  const [autoStartPending, setAutoStartPending] = useState(autoStartRequested);

  useEffect(() => {
    setAutoStartPending(autoStartRequested);
    hasAutoStartedRef.current = false;
  }, [autoStartRequested, difficultyParam, countParam]);

  useEffect(() => {
    if (difficultyParam === "easy" || difficultyParam === "medium" || difficultyParam === "hard") {
      setSelectedDifficulty(difficultyParam);
    }

    if (QUESTION_COUNT_OPTIONS.includes(countParam)) {
      setSelectedQuestionCount(countParam);
    }
  }, [difficultyParam, countParam]);

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
        .select("id, quiz_title, correct_count, total_questions, xp_earned, completed_at, difficulty_band")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(5),
    ]).then(([statsRes, sessionsRes]) => {
      if (!mounted) return;
      setPlayerStats(statsRes.data || null);
      setRecentSessions(sessionsRes.data || []);
      setPlayerStatsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;
    setLeaderboardLoading(true);

    const loadLeaderboard = async () => {
      const { data: sessionsData, error } = await supabase
        .from("quiz_sessions")
        .select("id, user_id, correct_count, total_questions, xp_earned, completed_at, difficulty_band")
        .eq("mode", "progressive")
        .eq("difficulty_band", selectedDifficulty)
        .order("xp_earned", { ascending: false })
        .order("correct_count", { ascending: false })
        .limit(8);

      if (!mounted) return;

      if (error || !sessionsData || sessionsData.length === 0) {
        setLeaderboard([]);
        setLeaderboardLoading(false);
        return;
      }

      const profileIds = Array.from(new Set(sessionsData.map((session) => session.user_id)));
      const { data: profilesData } = profileIds.length
        ? await supabase
            .from("profiles")
            .select("user_id, display_name, first_name")
            .in("user_id", profileIds)
        : { data: [] };

      if (!mounted) return;

      const profileMap = new Map(
        (profilesData || []).map((profile) => [
          profile.user_id,
          profile.display_name || profile.first_name || "SpotAI player",
        ]),
      );

      setLeaderboard(
        sessionsData.map((session) => ({
          id: session.id,
          name: profileMap.get(session.user_id) || "SpotAI player",
          correctCount: session.correct_count,
          totalQuestions: session.total_questions,
          xpEarned: session.xp_earned,
          completedAt: session.completed_at,
          isCurrentUser: session.user_id === user?.id,
        })),
      );
      setLeaderboardLoading(false);
    };

    loadLeaderboard();

    return () => {
      mounted = false;
    };
  }, [selectedDifficulty, user?.id, savedSessionId]);

  const bankStats = useMemo(() => getQuizBankStats(questionPool), [questionPool]);
  const currentQuestion = activeSession?.questions[currentQuestionIndex] ?? null;
  const answeredQuestionCount = activeSession
    ? Math.min(
        currentQuestionIndex + (revealState || summaryVisible ? 1 : 0),
        activeSession.questions.length,
      )
    : 0;
  const overallAccuracy =
    playerStats && playerStats.total_questions_answered > 0
      ? Math.round((playerStats.total_correct_answers / playerStats.total_questions_answered) * 100)
      : null;
  const personalBest = recentSessions.length
    ? recentSessions.reduce((best, session) =>
        session.xp_earned > best.xp_earned ? session : best,
      recentSessions[0])
    : null;

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
    setSecondsLeft(TIME_PER_QUESTION);
  };

  const returnToSetup = () => {
    setActiveSession(null);
    resetRunState();
  };

  const startGame = (difficultyOverride?: QuizDifficulty, questionCountOverride?: number) => {
    const nextDifficulty = difficultyOverride || selectedDifficulty;
    const nextQuestionCount = questionCountOverride || selectedQuestionCount;

    if (questionPool.length < 2) {
      toast({
        title: "Quiz bank too small",
        description: "Add more quiz questions before starting a new arena run.",
        variant: "destructive",
      });
      return;
    }

    let nextSession: QuizSession | null = null;
    let attempt = 0;
    const previousSignature = window.localStorage.getItem("spotai-last-quiz-signature");

    while (attempt < 6) {
      const candidate = buildQuizSession({
        questions: questionPool,
        difficulty: nextDifficulty,
        questionCount: nextQuestionCount,
        seedKey: `${Date.now()}-${sessionNonce}-${attempt}`,
      });
      const signature = candidate.questions.map((question) => String(question.id)).join("|");

      if (signature !== previousSignature || attempt === 5) {
        window.localStorage.setItem("spotai-last-quiz-signature", signature);
        nextSession = candidate;
        break;
      }

      attempt += 1;
    }

    if (!nextSession || nextSession.questions.length === 0) {
      toast({
        title: "No questions available",
        description: "The selected setup could not build a playable run.",
        variant: "destructive",
      });
      return;
    }

    setSelectedDifficulty(nextDifficulty);
    setSelectedQuestionCount(nextQuestionCount);
    resetRunState();
    setSelectedAnswers(Array(nextSession.questions.length).fill(null));
    setAwardedPoints(Array(nextSession.questions.length).fill(0));
    setActiveSession(nextSession);
    setSessionNonce((value) => value + 1);
  };

  useEffect(() => {
    if (!autoStartRequested || hasAutoStartedRef.current) return;
    if (questionsLoading || activeSession) return;

    const nextDifficulty: QuizDifficulty =
      difficultyParam === "easy" || difficultyParam === "medium" || difficultyParam === "hard"
        ? difficultyParam
        : selectedDifficulty;

    const nextCount = QUESTION_COUNT_OPTIONS.includes(countParam)
      ? countParam
      : selectedQuestionCount;

    if (questionPool.length < 2) {
      hasAutoStartedRef.current = true;
      setAutoStartPending(false);
      return;
    }

    hasAutoStartedRef.current = true;
    startGame(nextDifficulty, nextCount);
  }, [
    activeSession,
    autoStartRequested,
    countParam,
    difficultyParam,
    questionsLoading,
    questionPool.length,
    selectedDifficulty,
    selectedQuestionCount,
  ]);

  useEffect(() => {
    if (activeSession && autoStartPending) {
      setAutoStartPending(false);
    }
  }, [activeSession, autoStartPending]);

  const handleAnswerLocked = (answerIndex: number | null) => {
    if (!currentQuestion || revealState || !activeSession) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const pointsEarned = isCorrect
      ? getQuestionPoints(currentQuestion, streak, activeSession.difficulty)
      : 0;

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
      timedOut: answerIndex === null,
    });
    setCorrectCount((value) => value + (isCorrect ? 1 : 0));
    setRoundPoints((value) => value + pointsEarned);
    setStreak(nextStreak);
    setMaxStreak((value) => Math.max(value, nextStreak));
  };

  const advanceRun = () => {
    if (!activeSession || !revealState) return;

    const isLastQuestion = currentQuestionIndex >= activeSession.questions.length - 1;

    if (isLastQuestion) {
      setSummaryVisible(true);
      setRevealState(null);
      return;
    }

    setCurrentQuestionIndex((value) => value + 1);
    setRevealState(null);
    setSecondsLeft(TIME_PER_QUESTION);
  };

  useEffect(() => {
    if (!activeSession || !currentQuestion || summaryVisible || revealState) return;
    if (secondsLeft <= 0) {
      handleAnswerLocked(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeSession, currentQuestion, revealState, secondsLeft, summaryVisible]);

  useEffect(() => {
    if (!activeSession || !currentQuestion || revealState || summaryVisible) return;
    setSecondsLeft(TIME_PER_QUESTION);
  }, [activeSession?.id, currentQuestionIndex, revealState, summaryVisible, currentQuestion]);

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

      const { data: sessionData, error: sessionError } = await supabase
        .from("quiz_sessions")
        .insert({
          user_id: user.id,
          mode: playedSession.mode,
          quiz_title: playedSession.saveTitle,
          category: playedSession.category?.toLowerCase().replace(/\s+/g, "-") || null,
          difficulty_band: playedSession.difficulty,
          score: correctCount,
          total_questions: answeredQuestionCount,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          max_streak: maxStreak,
          xp_earned: roundPoints,
          lives_start: null,
          lives_remaining: null,
          answers: answeredSelections,
        })
        .select("id")
        .single();

      if (sessionError || !sessionData) {
        toast({
          title: "Could not save arena run",
          description: sessionError?.message || "The run could not be written.",
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

      const { error: resultError } = await supabase.from("quiz_results").insert({
        user_id: user.id,
        quiz_title: playedSession.saveTitle,
        score: correctCount,
        total_questions: answeredQuestionCount,
        answers: answeredSelections,
      });

      if (resultError) {
        toast({
          title: "Could not save quiz result",
          description: resultError.message,
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
          correct_count: correctCount,
          total_questions: answeredQuestionCount,
          xp_earned: roundPoints,
          completed_at: new Date().toISOString(),
          difficulty_band: playedSession.difficulty,
        },
        ...previous,
      ].slice(0, 5));
      toast({
        title: "Arena run saved",
        description: "Your score, stats, and ranking-ready run are now stored.",
      });
    };

    saveResult();
  }, [
    activeSession,
    answeredQuestionCount,
    awardedPoints,
    correctCount,
    maxStreak,
    playerStats,
    roundPoints,
    savedSessionId,
    selectedAnswers,
    summaryVisible,
    toast,
    user,
  ]);

  const difficultyConfig = QUIZ_DIFFICULTY_CONFIG[selectedDifficulty];
  const progressValue =
    activeSession && activeSession.questions.length > 0
      ? ((currentQuestionIndex + (revealState ? 1 : 0)) / activeSession.questions.length) * 100
      : 0;
  const summaryRatio =
    answeredQuestionCount > 0 ? Math.round((correctCount / answeredQuestionCount) * 100) : 0;
  const visibleSecondsLeft = revealState ? 0 : Math.max(secondsLeft, 1);

  return (
    <Layout>
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_24%,#ffffff_100%)] text-foreground">
        <section className="border-b border-border bg-[linear-gradient(180deg,#f5f8ff_0%,#eef4fb_100%)]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            {!activeSession ? (
              autoStartPending ? (
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/quiz")}
                      className="h-11 rounded-full border-border bg-background px-5 text-foreground hover:bg-accent"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to games
                    </Button>

                    <Link to="/quiz" className="inline-flex">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-full border-border bg-background px-5 text-foreground hover:bg-accent"
                      >
                        View all games
                      </Button>
                    </Link>
                  </div>

                  <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
                    <Badge
                      variant="outline"
                      className="rounded-full border-border bg-slate-50 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
                    >
                      Launching arena
                    </Badge>
                    <h1
                      className="mt-4 text-4xl tracking-tight sm:text-5xl"
                      style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                    >
                      Starting your quiz run...
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                      Preparing {selectedQuestionCount} questions in the{" "}
                      {QUIZ_DIFFICULTY_CONFIG[selectedDifficulty].label.toLowerCase()} lane.
                    </p>
                    <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Building session
                    </div>
                  </div>
                </div>
              ) : (
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/quiz")}
                    className="h-11 rounded-full border-border bg-background px-5 text-foreground hover:bg-accent"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to games
                  </Button>

                  <Link to="/home" className="inline-flex items-center">
                    <span className="spotai-wordmark text-2xl font-extrabold tracking-tight">SpotAI</span>
                  </Link>
                </div>

                <div className="text-center">
                  <Badge variant="outline" className="rounded-full border-border bg-background px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    SpotAI games
                  </Badge>
                  <h1
                    className="mt-4 text-5xl tracking-tight sm:text-6xl"
                    style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                  >
                    AI Knowledge Arena
                  </h1>
                  <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                    One progressive quiz lane, three difficulty buttons, a ten-second timer on every question, and a live ranking panel that updates as runs land.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.14fr_0.86fr]">
                  <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <div className={cn("h-1.5 w-full bg-gradient-to-r", difficultyConfig.accentClassName)} />
                    <div className="space-y-7 p-6 sm:p-7">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                          Game setup
                        </p>
                        <h2
                          className="text-3xl tracking-tight"
                          style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                        >
                          Set your lane, then jump straight into the run.
                        </h2>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                          The round always starts approachable and ramps upward. Your difficulty choice changes how fast it climbs and how much XP each correct answer can pay out.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">Choose difficulty</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              Easy, medium, or hard
                            </p>
                          </div>
                          <Badge variant="outline" className="rounded-full border-border bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            10 sec timer
                          </Badge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          {Object.values(QUIZ_DIFFICULTY_CONFIG).map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              data-active={selectedDifficulty === option.id}
                              onClick={() => setSelectedDifficulty(option.id)}
                              className={cn(
                                "cursor-pointer rounded-[1.25rem] border p-4 text-left transition-colors duration-200",
                                option.buttonClassName,
                              )}
                            >
                              <div className={cn("mb-3 inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white", option.accentClassName)}>
                                {option.subtitle}
                              </div>
                              <h3 className="text-lg font-semibold text-inherit">{option.label}</h3>
                              <p className="mt-2 text-sm leading-6 opacity-80">{option.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Choose question count</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            From 10 to 30 questions
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {QUESTION_COUNT_OPTIONS.map((count) => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => setSelectedQuestionCount(count)}
                              className={cn(
                                "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200",
                                selectedQuestionCount === count
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white",
                              )}
                            >
                              {count} questions
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Shuffled every run
                        </span>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Progressive difficulty
                        </span>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Leaderboard tracked
                        </span>
                      </div>

                      <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              Selected setup
                            </p>
                            <p className="mt-2 text-xl font-semibold text-foreground">
                              {difficultyConfig.label} lane · {selectedQuestionCount} questions
                            </p>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                              Faster clicks keep your streak alive. Every correct answer adds XP, and the back half of the run gets tougher.
                            </p>
                          </div>

                          <Button
                            type="button"
                            onClick={() => startGame()}
                            disabled={questionsLoading}
                            className={cn(
                              "h-12 rounded-full px-7 text-sm font-semibold text-white transition-colors",
                              `bg-gradient-to-r ${difficultyConfig.accentClassName}`,
                            )}
                          >
                            {questionsLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading quiz bank
                              </>
                            ) : (
                              <>
                                Start arena run
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                          Arena snapshot
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-foreground">
                          {playerStatsLoading ? "Loading…" : `${playerStats?.total_sessions || 0} runs logged`}
                        </h3>
                      </div>
                      <Badge variant="outline" className="rounded-full border-border bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {bankStats.totalQuestions} questions live
                      </Badge>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Accuracy</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">
                          {overallAccuracy !== null ? `${overallAccuracy}%` : "—"}
                        </p>
                      </div>
                      <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Total XP</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{playerStats?.total_xp || 0}</p>
                      </div>
                      <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best streak</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{playerStats?.longest_answer_streak || 0}</p>
                      </div>
                      <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best run</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {personalBest ? `${personalBest.correct_count}/${personalBest.total_questions}` : "No run yet"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            {difficultyConfig.label} ranking
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold text-foreground">Top arena runs</h3>
                        </div>
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm", difficultyConfig.accentClassName)}>
                          <Trophy className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        {leaderboardLoading ? (
                          <div className="flex items-center gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading ranking
                          </div>
                        ) : leaderboard.length === 0 ? (
                          <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-muted-foreground">
                            No ranked runs in this lane yet. Your next finish can set the pace.
                          </div>
                        ) : (
                          leaderboard.slice(0, 5).map((entry, index) => (
                            <div
                              key={entry.id}
                              className={cn(
                                "flex items-center justify-between gap-3 rounded-[1.2rem] border p-4",
                                entry.isCurrentUser
                                  ? "border-sky-200 bg-sky-50"
                                  : "border-slate-200 bg-slate-50",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white text-sm font-semibold text-slate-700">
                                  #{index + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {entry.name}
                                    {entry.isCurrentUser ? " · You" : ""}
                                  </p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    {new Date(entry.completedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-foreground">
                                  {entry.correctCount}/{entry.totalQuestions}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                  {entry.xpEarned} XP
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/quiz")}
                    className="h-11 rounded-full border-border bg-background px-5 text-foreground hover:bg-accent"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to games
                  </Button>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-border bg-background px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {QUIZ_DIFFICULTY_CONFIG[activeSession.difficulty].label} lane
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-border bg-background px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {activeSession.questions.length} questions
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-border bg-background px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      10 sec timer
                    </Badge>
                  </div>
                </div>

                <div>
                  <Badge variant="outline" className="rounded-full border-border bg-background px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    SpotAI quiz arena
                  </Badge>
                  <h1
                    className="mt-4 text-4xl tracking-tight sm:text-[3.35rem]"
                    style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                  >
                    {activeSession.subtitle}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                    The run opens clean, gets harder as it moves, and reshuffles every time so the same order does not repeat.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {activeSession ? (
            summaryVisible ? (
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
              >
                <div className={cn("h-1.5 w-full bg-gradient-to-r", QUIZ_DIFFICULTY_CONFIG[activeSession.difficulty].accentClassName)} />
                <div className="grid gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
                  <div className="space-y-6">
                    <div>
                      <Badge variant="outline" className="rounded-full border-border bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Run complete
                      </Badge>
                      <h2
                        className="mt-4 text-4xl tracking-tight"
                        style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                      >
                        {summaryRatio >= 85 ? "Sharp finish." : summaryRatio >= 65 ? "Strong climb." : "Good warm-up."}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                        You cleared {correctCount} of {answeredQuestionCount} questions, hit a best streak of {maxStreak}, and banked {roundPoints} XP in the {QUIZ_DIFFICULTY_CONFIG[activeSession.difficulty].label.toLowerCase()} lane.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          <Target className="h-3.5 w-3.5" />
                          Accuracy
                        </div>
                        <p className="mt-2 text-3xl font-semibold text-foreground">{summaryRatio}%</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          <Flame className="h-3.5 w-3.5" />
                          Best streak
                        </div>
                        <p className="mt-2 text-3xl font-semibold text-foreground">{maxStreak}</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5" />
                          Arena XP
                        </div>
                        <p className="mt-2 text-3xl font-semibold text-foreground">{roundPoints}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={() => startGame(activeSession.difficulty, activeSession.questions.length)}
                        className={cn(
                          "h-11 rounded-full px-6 text-white",
                          `bg-gradient-to-r ${QUIZ_DIFFICULTY_CONFIG[activeSession.difficulty].accentClassName}`,
                        )}
                      >
                        Play another shuffled run
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={returnToSetup}
                        className="h-11 rounded-full border-border bg-background px-6 text-foreground hover:bg-accent"
                      >
                        Change setup
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/quiz")}
                        className="h-11 rounded-full border-border bg-background px-6 text-foreground hover:bg-accent"
                      >
                        Back to games
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Category performance
                      </p>
                      <div className="mt-4 space-y-3">
                        {categoryBreakdown.map((item) => (
                          <div key={item.label} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-foreground">{item.label}</span>
                              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                {item.correct}/{item.total}
                              </span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-slate-100">
                              <div
                                className={cn("h-full rounded-full bg-gradient-to-r", QUIZ_DIFFICULTY_CONFIG[activeSession.difficulty].accentClassName)}
                                style={{ width: `${Math.max(item.ratio * 100, 8)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Ranking preview
                      </p>
                      <div className="mt-4 space-y-3">
                        {leaderboard.slice(0, 3).map((entry, index) => (
                          <div key={entry.id} className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-white p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-foreground">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {entry.name}
                                  {entry.isCurrentUser ? " · You" : ""}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                  {entry.correctCount}/{entry.totalQuestions}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-foreground">{entry.xpEarned} XP</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : currentQuestion ? (
              <div className="space-y-6">
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={cn("rounded-full border-0 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white", `bg-gradient-to-r ${QUIZ_DIFFICULTY_CONFIG[activeSession.difficulty].accentClassName}`)}>
                            {QUIZ_DIFFICULTY_CONFIG[activeSession.difficulty].label} lane
                          </Badge>
                          <Badge variant="outline" className="rounded-full border-border bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Question {currentQuestionIndex + 1} / {activeSession.questions.length}
                          </Badge>
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            <span>Round progress</span>
                            <span>{Math.round(progressValue)}%</span>
                          </div>
                          <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                            <div
                              className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-300", QUIZ_DIFFICULTY_CONFIG[activeSession.difficulty].accentClassName)}
                              style={{ width: `${progressValue}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />
                            Timer
                          </div>
                          <p className={cn("mt-2 text-2xl font-semibold", visibleSecondsLeft <= 3 ? "text-rose-600" : "text-foreground")}>
                            {visibleSecondsLeft}s
                          </p>
                        </div>
                        <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Target className="h-3.5 w-3.5" />
                            Correct
                          </div>
                          <p className="mt-2 text-2xl font-semibold text-foreground">{correctCount}</p>
                        </div>
                        <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Flame className="h-3.5 w-3.5" />
                            Streak
                          </div>
                          <p className="mt-2 text-2xl font-semibold text-foreground">{streak}</p>
                        </div>
                        <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5" />
                            XP
                          </div>
                          <p className="mt-2 text-2xl font-semibold text-foreground">{roundPoints}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestion.id}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, y: -14 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                        className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="rounded-full border-border bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {formatCategoryLabel(currentQuestion.category)}
                          </Badge>
                          <Badge variant="outline" className="rounded-full border-border bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {currentQuestion.difficulty}
                          </Badge>
                          <Badge variant="outline" className="rounded-full border-border bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {currentQuestion.quizTitle}
                          </Badge>
                        </div>

                        <div className="mt-6">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Now playing</p>
                          <h2
                            className="mt-3 text-3xl leading-tight sm:text-[2.35rem]"
                            style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                          >
                            {currentQuestion.question}
                          </h2>
                        </div>

                        <div className="mt-8 grid gap-3">
                          {currentQuestion.options.map((option, index) => {
                            const isSelected = revealState?.selectedIndex === index;
                            const isCorrect = index === currentQuestion.correctAnswer;
                            const isSelectedCorrect = revealState && isSelected && revealState.isCorrect;
                            const isWrongPick = revealState && isSelected && !revealState.isCorrect;

                            return (
                              <button
                                key={option}
                                type="button"
                                disabled={!!revealState}
                                onClick={() => handleAnswerLocked(index)}
                                className={cn(
                                  "cursor-pointer rounded-[1.3rem] border p-4 text-left transition-colors duration-200 sm:p-5",
                                  !revealState && "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white",
                                  isSelected && "border-sky-300 bg-sky-50",
                                  revealState && isCorrect && "border-emerald-300 bg-emerald-50",
                                  isWrongPick && "border-rose-300 bg-rose-50",
                                )}
                              >
                                <div className="flex items-start gap-4">
                                  <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold",
                                    !revealState && "border-slate-200 bg-white text-slate-700",
                                    isSelectedCorrect && "border-emerald-200 bg-emerald-100 text-emerald-900",
                                    isWrongPick && "border-rose-200 bg-rose-100 text-rose-900",
                                    revealState && isCorrect && !isWrongPick && "border-emerald-200 bg-emerald-100 text-emerald-900",
                                  )}>
                                    {String.fromCharCode(65 + index)}
                                  </div>
                                  <div>
                                    <p className="text-base font-semibold text-foreground">{option}</p>
                                    {!revealState ? (
                                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">Lock answer</p>
                                    ) : isCorrect ? (
                                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-700">Correct answer</p>
                                    ) : isWrongPick ? (
                                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-rose-700">Your pick</p>
                                    ) : null}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {revealState && (
                          <div className={cn(
                            "mt-6 rounded-[1.4rem] border p-5",
                            revealState.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50/70",
                          )}>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Answer feedback</p>
                                <h3 className="mt-2 text-2xl" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                                  {revealState.timedOut ? "Time is up." : revealState.isCorrect ? "Clean hit." : "Not this one."}
                                </h3>
                              </div>
                              <div className="rounded-full border border-white/60 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                                +{revealState.pointsEarned} XP
                              </div>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-slate-600">{currentQuestion.explanation}</p>

                            {!revealState.isCorrect && (
                              <div className="mt-4 rounded-[1.1rem] border border-white/70 bg-white/80 p-4 text-sm text-slate-600">
                                Correct answer: <span className="font-semibold text-foreground">{currentQuestion.options[currentQuestion.correctAnswer]}</span>
                              </div>
                            )}

                            <div className="mt-5 flex flex-wrap gap-3">
                              <Button
                                type="button"
                                onClick={advanceRun}
                                className={cn("h-11 rounded-full px-5 text-white", `bg-gradient-to-r ${QUIZ_DIFFICULTY_CONFIG[activeSession.difficulty].accentClassName}`)}
                              >
                                {currentQuestionIndex >= activeSession.questions.length - 1 ? "View summary" : "Next question"}
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Round notes</p>
                      <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-muted-foreground">
                        The round ramps upward automatically. The timer keeps each question crisp, and every correct answer adds XP to your lane ranking.
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current streak</p>
                          <p className="mt-2 text-2xl font-semibold text-foreground">{streak}</p>
                        </div>
                        <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best streak</p>
                          <p className="mt-2 text-2xl font-semibold text-foreground">{maxStreak}</p>
                        </div>
                      </div>

                      <div className="mt-6 border-t border-slate-200 pt-6">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Live ranking</p>
                            <h3 className="mt-2 text-2xl font-semibold text-foreground">Top runs in this lane</h3>
                          </div>
                          <Trophy className="h-5 w-5 text-amber-500" />
                        </div>

                        <div className="mt-5 space-y-3">
                          {leaderboardLoading ? (
                            <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading ranking
                            </div>
                          ) : leaderboard.length === 0 ? (
                            <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-muted-foreground">
                              No ranked runs yet for this difficulty. Finish this round and you may open the board.
                            </div>
                          ) : (
                            leaderboard.slice(0, 3).map((entry, index) => (
                              <div
                                key={entry.id}
                                className={cn(
                                  "flex items-center justify-between gap-3 rounded-[1.15rem] border p-4",
                                  entry.isCurrentUser ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-slate-50",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-foreground">
                                    #{index + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">
                                      {entry.name}
                                      {entry.isCurrentUser ? " · You" : ""}
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                      {entry.correctCount}/{entry.totalQuestions}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right text-sm font-semibold text-foreground">{entry.xpEarned} XP</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null
          ) : null}
        </section>
      </div>
    </Layout>
  );
};

export default Quiz;
