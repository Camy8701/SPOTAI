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
      "relative overflow-hidden rounded-[2rem] border p-6 shadow-[0_18px_60px_rgba(10,14,39,0.18)] transition-colors",
      "bg-[linear-gradient(155deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] backdrop-blur-sm",
      mode.surfaceClassName,
      isSelected ? "ring-2 ring-white/60" : "border-white/10 hover:border-white/25",
    )}
  >
    <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", mode.accentClassName)} />
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", mode.accentClassName)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">{mode.subtitle}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
            {mode.title}
          </h3>
        </div>
      </div>
      <Badge className="rounded-full border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80" variant="outline">
        {statLabel}
      </Badge>
    </div>

    <p className="mt-5 max-w-sm text-sm leading-6 text-slate-200/78">
      {mode.description}
    </p>

    <Button
      type="button"
      onClick={onSelect}
      className={cn(
        "mt-6 h-11 w-full rounded-full border-0 text-sm font-semibold text-slate-950 transition-opacity",
        "bg-white hover:bg-white/90",
        isSelected && "shadow-[0_10px_30px_rgba(255,255,255,0.2)]",
      )}
    >
      {isSelected ? "Selected mode" : "Choose mode"}
    </Button>
  </motion.div>
);

export default QuizModeCard;
