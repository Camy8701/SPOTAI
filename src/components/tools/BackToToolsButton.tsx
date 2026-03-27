import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackToToolsButtonProps {
  className?: string;
}

const BackToToolsButton = ({ className }: BackToToolsButtonProps) => {
  return (
    <Link
      to="/tools"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-secondary",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Tools
    </Link>
  );
};

export default BackToToolsButton;
