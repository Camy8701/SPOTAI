import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

type PageBackLinkProps = {
  to?: string;
  label?: string;
  className?: string;
};

const PageBackLink = ({
  to = "/home",
  label = "Back to home",
  className,
}: PageBackLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-violet-300 hover:text-violet-700",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
};

export default PageBackLink;
