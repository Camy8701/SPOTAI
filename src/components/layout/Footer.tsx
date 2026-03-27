import { Link } from "react-router-dom";

const Footer = () => {
  const handleFooterNavigate = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="overflow-hidden border-t border-border bg-secondary pt-20 text-foreground">
      <div
        className="mb-16 w-full px-4 text-center"
        style={{
          maskImage: "linear-gradient(180deg, transparent, black 0%, black 58%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 0%, black 58%, transparent)",
        }}
      >
        <Link to="/home" className="inline-block" onClick={handleFooterNavigate}>
          <h2 className="spotai-wordmark select-none text-[18vw] font-bold leading-[0.72] tracking-[-0.08em] opacity-35 md:scale-y-110">
            SpotAI
          </h2>
        </Link>
      </div>

      <div className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-12 border-r-0 border-border p-8 md:p-16 lg:border-r">
          <div className="flex flex-col gap-6">
            <Link
              to="/library"
              onClick={handleFooterNavigate}
              className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Story Library
            </Link>
            <Link
              to="/popular"
              onClick={handleFooterNavigate}
              className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Trending
            </Link>
            <Link
              to="/marketplace"
              onClick={handleFooterNavigate}
              className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Marketplace
            </Link>
            <Link
              to="/create-post"
              onClick={handleFooterNavigate}
              className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Create
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            <Link
              to="/communities"
              onClick={handleFooterNavigate}
              className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Communities
            </Link>
            <Link
              to="/groups"
              onClick={handleFooterNavigate}
              className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Groups
            </Link>
            <Link
              to="/freebies/ebooks"
              onClick={handleFooterNavigate}
              className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Free Ebooks
            </Link>
            <Link
              to="/freebies/podcasts"
              onClick={handleFooterNavigate}
              className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Podcasts
            </Link>
          </div>
        </div>

        <div className="relative flex h-56 items-center justify-center overflow-hidden border-t border-border lg:h-auto lg:border-t-0">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(234,88,12,0.1),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(139,92,246,0.08),transparent_35%)]" />
          <svg
            viewBox="0 0 420 140"
            className="spotai-network h-[170px] w-[780px] max-w-[calc(100%-2rem)] text-slate-500/60"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <path d="M50 95 L130 45 L210 80 L290 38 L370 72" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M50 55 L130 45 L210 80 L290 98 L370 72" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.45" />

            <g transform="translate(28 72)">
              <rect x="0" y="0" width="44" height="32" rx="8" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M9 11 H35" stroke="currentColor" strokeWidth="1" />
              <path d="M9 18 H27" stroke="currentColor" strokeWidth="1" opacity="0.7" />
            </g>

            <g transform="translate(108 22)">
              <circle cx="22" cy="22" r="22" stroke="currentColor" strokeWidth="1" fill="none" />
              <circle cx="22" cy="22" r="6" className="spotai-node-core" fill="currentColor" />
              <circle cx="22" cy="22" r="12" className="spotai-node-ring" stroke="currentColor" strokeWidth="1" fill="none" />
            </g>

            <g transform="translate(184 58)">
              <rect x="0" y="0" width="52" height="36" rx="10" stroke="currentColor" strokeWidth="1" fill="none" />
              <path
                className="spotai-wave-line"
                d="M9 22 C15 14, 21 30, 28 22 S41 14, 45 18"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </g>

            <g transform="translate(266 14)">
              <rect x="0" y="0" width="48" height="48" rx="14" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M14 17 H34" stroke="currentColor" strokeWidth="1" />
              <path d="M14 25 H28" stroke="currentColor" strokeWidth="1" opacity="0.7" />
              <path d="M14 33 H31" stroke="currentColor" strokeWidth="1" opacity="0.45" />
            </g>

            <g transform="translate(346 48)">
              <circle cx="22" cy="22" r="22" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M15 28 L22 14 L29 28" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M18 23 H26" stroke="currentColor" strokeWidth="1" />
            </g>
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-6 border-t border-border px-8 py-8 text-[10px] font-medium tracking-[0.22em] text-muted-foreground md:flex-row md:px-16">
        <div>{new Date().getFullYear()} ALL RIGHTS RESERVED</div>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          <Link to="/auth" className="transition-colors hover:text-foreground" onClick={handleFooterNavigate}>
            Sign In
          </Link>
          <Link to="/messages" className="transition-colors hover:text-foreground" onClick={handleFooterNavigate}>
            Messages
          </Link>
          <Link to="/dashboard" className="transition-colors hover:text-foreground" onClick={handleFooterNavigate}>
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
