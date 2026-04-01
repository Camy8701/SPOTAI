import type { ReactNode } from "react";

import PageBackLink from "@/components/ui/page-back-link";
import { cn } from "@/lib/utils";

type CatalogHeroHeaderProps = {
  title: string;
  subtitle: string;
  topLabel?: string;
  backTo?: string;
  backLabel?: string;
  backLinkClassName?: string;
  topLabelClassName?: string;
  className?: string;
  children?: ReactNode;
  topRight?: ReactNode;
};

const CatalogHeroHeader = ({
  title,
  subtitle,
  topLabel,
  backTo,
  backLabel,
  backLinkClassName,
  topLabelClassName,
  className,
  children,
  topRight,
}: CatalogHeroHeaderProps) => {
  return (
    <section className="border-b border-border bg-secondary">
      <div className={cn("mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8", className)}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <PageBackLink to={backTo} label={backLabel} className={backLinkClassName} />
          {topRight || topLabel ? (
            topRight || (
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground",
                  topLabelClassName,
                )}
              >
                {topLabel}
              </span>
            )
          ) : (
            <span className="hidden sm:block" />
          )}
        </div>

        <div className="text-center">
          <h1 className="text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
            {title}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
};

export default CatalogHeroHeader;
