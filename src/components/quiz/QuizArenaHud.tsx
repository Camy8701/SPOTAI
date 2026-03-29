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
    <div className="rounded-[2rem] border border-black/8 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("rounded-full border-0 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white", `bg-gradient-to-r ${mode.accentClassName}`)}>
              {mode.title}
            </Badge>
            <Badge variant="outline" className="rounded-full border-black/10 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Question {Math.min(questionIndex + 1, totalQuestions)} / {totalQuestions}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span>Round progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2.5 overflow-hidden rounded-full bg-slate-100 [&>div]:bg-[linear-gradient(90deg,#ec4899,#a855f7,#3b82f6)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" />
              Correct
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{correctCount}</p>
          </div>

          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Flame className="h-3.5 w-3.5" />
              Streak
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{streak}</p>
          </div>

          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Arena XP
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{roundPoints}</p>
          </div>

          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              Lives
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{livesRemaining ?? "∞"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizArenaHud;
