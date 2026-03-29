import { motion } from "framer-motion";
import { ArrowRight, Flame, RotateCcw, Target, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuizModeConfig } from "@/lib/quiz-engine";

type QuizSummaryCardProps = {
  mode: QuizModeConfig;
  correctCount: number;
  totalQuestions: number;
  maxStreak: number;
  roundPoints: number;
  categoryBreakdown: Array<{ label: string; ratio: number; correct: number; total: number }>;
  onReplay: () => void;
  onReturnToHub: () => void;
};

const getHeadline = (ratio: number) => {
  if (ratio >= 0.9) return "Elite run";
  if (ratio >= 0.75) return "Strong finish";
  if (ratio >= 0.55) return "Solid momentum";
  return "Warm-up complete";
};

const QuizSummaryCard = ({
  mode,
  correctCount,
  totalQuestions,
  maxStreak,
  roundPoints,
  categoryBreakdown,
  onReplay,
  onReturnToHub,
}: QuizSummaryCardProps) => {
  const ratio = totalQuestions === 0 ? 0 : correctCount / totalQuestions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.1)]"
    >
      <div className={cn("h-1.5 w-full bg-gradient-to-r", mode.accentClassName)} />
      <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <Badge className={cn("rounded-full border-0 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white", `bg-gradient-to-r ${mode.accentClassName}`)}>
              {mode.title} complete
            </Badge>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Session verdict</p>
              <h2 className="mt-2 text-4xl text-foreground" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                {getHeadline(ratio)}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              You cleared {correctCount} of {totalQuestions} questions and pushed your best streak to {maxStreak}. Use the next run to sharpen the weak spots below.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Accuracy
              </div>
              <p className="mt-2 text-3xl font-semibold text-foreground">{Math.round(ratio * 100)}%</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Flame className="h-3.5 w-3.5" />
                Best streak
              </div>
              <p className="mt-2 text-3xl font-semibold text-foreground">{maxStreak}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Trophy className="h-3.5 w-3.5" />
                Arena XP
              </div>
              <p className="mt-2 text-3xl font-semibold text-foreground">{roundPoints}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={onReplay} className="h-11 rounded-full bg-pink-500 px-6 text-white hover:bg-pink-600">
              <RotateCcw className="h-4 w-4" />
              Play this mode again
            </Button>
            <Button type="button" onClick={onReturnToHub} variant="outline" className="h-11 rounded-full border-border bg-background px-6 text-foreground hover:bg-accent">
              Switch mode
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Mastery snapshot</p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">Category performance</h3>
          </div>
          <div className="space-y-3">
            {categoryBreakdown.map((item) => (
              <div key={item.label} className="rounded-[1.2rem] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.correct}/{item.total}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r", mode.accentClassName)}
                    style={{ width: `${Math.max(item.ratio * 100, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizSummaryCard;
