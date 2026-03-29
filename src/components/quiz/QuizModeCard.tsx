import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuizModeConfig } from "@/lib/quiz-engine";

type QuizModeCardProps = {
  mode: QuizModeConfig;
  icon: LucideIcon;
  isSelected: boolean;
  statLabel: string;
  onSelect: () => void;
};

const QuizModeCard = ({ mode, icon: Icon, isSelected, statLabel, onSelect }: QuizModeCardProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className={cn(
      "relative overflow-hidden rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-colors",
      mode.surfaceClassName,
      isSelected && "ring-2 ring-pink-300/70",
    )}
  >
    <div className={cn("absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r", mode.accentClassName)} />

    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", mode.accentClassName)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{mode.subtitle}</p>
          <h3 className="mt-2 text-2xl text-foreground" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
            {mode.title}
          </h3>
        </div>
      </div>
      <Badge className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {statLabel}
      </Badge>
    </div>

    <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
      {mode.description}
    </p>

    <Button
      type="button"
      onClick={onSelect}
      className={cn(
        "mt-6 h-11 w-full rounded-full border text-sm font-semibold transition-colors",
        isSelected
          ? "border-pink-500 bg-pink-500 text-white hover:bg-pink-600"
          : "border-border bg-background text-foreground hover:bg-accent",
      )}
    >
      {isSelected ? "Play recommended mode" : "Play this mode"}
    </Button>
  </motion.div>
);

export default QuizModeCard;
