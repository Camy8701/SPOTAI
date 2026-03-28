import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { QuizModeConfig } from "@/lib/quiz-engine";
import { Flame, Heart, Sparkles, Trophy } from "lucide-react";

type QuizArenaHudProps = {
  mode: QuizModeConfig;
  questionIndex: number;
  totalQuestions: number;
  correctCount: number;
  streak: number;
  livesRemaining: number | null;
  roundPoints: number;
};

const QuizArenaHud = ({
  mode,
  questionIndex,
  totalQuestions,
  correctCount,
  streak,
  livesRemaining,
  roundPoints,
}: QuizArenaHudProps) => {
  const progress = totalQuestions === 0 ? 0 : ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="rounded-[2rem] border border-white/12 bg-[rgba(7,12,28,0.82)] p-4 shadow-[0_18px_50px_rgba(5,10,25,0.35)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("rounded-full border-0 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white", `bg-gradient-to-r ${mode.accentClassName}`)}>
              {mode.title}
            </Badge>
            <Badge className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70" variant="outline">
              Question {Math.min(questionIndex + 1, totalQuestions)} / {totalQuestions}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              <span>Round progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2.5 overflow-hidden rounded-full bg-white/10 [&>div]:bg-[linear-gradient(90deg,#8b5cf6,#ec4899,#22c55e)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
              <Trophy className="h-3.5 w-3.5" />
              Correct
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{correctCount}</p>
          </div>

          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
              <Flame className="h-3.5 w-3.5" />
              Streak
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{streak}</p>
          </div>

          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
              <Sparkles className="h-3.5 w-3.5" />
              Arena XP
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{roundPoints}</p>
          </div>

          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
              <Heart className="h-3.5 w-3.5" />
              Lives
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{livesRemaining ?? "∞"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizArenaHud;
