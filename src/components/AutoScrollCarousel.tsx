import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";

interface CarouselPost {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  audio_url?: string | null;
  excerpt?: string | null;
}

type StorySlide =
  | {
      type: "add-post";
      id: string;
      title: string;
      subtitle: string;
      to: string;
    }
  | {
      type: "post";
      id: string;
      title: string;
      slug: string;
      featured_image: string | null;
      audio_url?: string | null;
      excerpt?: string | null;
    }
  | {
      type: "placeholder";
      id: string;
      title: string;
      subtitle: string;
      eyebrow: string;
      accent: string;
      image: string;
      listenable: boolean;
    };

interface AutoScrollCarouselProps {
  posts: CarouselPost[];
  className?: string;
  onListen?: (src: string, title: string) => void;
}

const cardBaseClass =
  "group relative flex-none overflow-hidden rounded-[30px] border border-slate-200 bg-white snap-start";

const CARD_WIDTH = 300;
const CARD_HEIGHT = 420;
const MEDIA_HEIGHT = 308;
const FOOTER_HEIGHT = 112;
const CARD_GAP = 20; // Tailwind `gap-5`
const AUTO_SCROLL_MS = 5000;
const mediaPaneClass = "relative overflow-hidden";
const footerPaneClass = "flex flex-col justify-end bg-white px-4 pb-4 pt-3";
const placeholderImage = "/placeholder.svg";

function ReadButton({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[hsl(var(--spotai-blue))] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[hsl(var(--spotai-blue))]/90"
    >
      <BookOpenText className="h-4 w-4" />
      Read
    </Link>
  );
}

function ListenButton({
  onClick,
  disabled = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  if (disabled || !onClick) {
    return (
      <div
        aria-disabled="true"
        className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-3 text-sm font-semibold text-white opacity-55"
      >
        <Headphones className="h-4 w-4" />
        Listen
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
    >
      <Headphones className="h-4 w-4" />
      Listen
    </button>
  );
}

function StoryCard({
  slide,
  onListen,
}: {
  slide: StorySlide;
  onListen?: (src: string, title: string) => void;
}) {
  if (slide.type === "add-post") {
    return (
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className={cardBaseClass}
        style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH, maxWidth: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <div
          className={cn(mediaPaneClass, "bg-[radial-gradient(circle_at_50%_28%,rgba(83,143,255,0.26),transparent_34%),linear-gradient(180deg,#f6f8fc_0%,#e8eef7_100%)]")}
          style={{ height: MEDIA_HEIGHT }}
        >
          <img
            src={placeholderImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,244,252,0.04)_0%,rgba(15,23,42,0.18)_100%)]" />
          <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[hsl(var(--spotai-blue))] bg-white text-[hsl(var(--spotai-blue))]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
              <Sparkles className="h-3.5 w-3.5" />
              Admin shortcut
            </div>
            <h3 className="text-[1.85rem] font-semibold leading-tight">{slide.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/82">{slide.subtitle}</p>
          </div>
        </div>

        <div className={footerPaneClass} style={{ height: FOOTER_HEIGHT }}>
          <Link
            to={slide.to}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--spotai-blue))] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[hsl(var(--spotai-blue))]/90"
          >
            <Plus className="h-4 w-4" />
            Add post
          </Link>
        </div>
      </motion.article>
    );
  }

  if (slide.type === "placeholder") {
    return (
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className={cardBaseClass}
        style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH, maxWidth: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <div className={cn(mediaPaneClass, slide.accent)} style={{ height: MEDIA_HEIGHT }}>
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.5)_100%)]" />
          <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[hsl(var(--spotai-blue))] bg-white text-[hsl(var(--spotai-blue))]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
              <Sparkles className="h-3.5 w-3.5" />
              {slide.eyebrow}
            </div>
            <h3 className="text-[1.85rem] font-semibold leading-tight">{slide.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/82">{slide.subtitle}</p>
          </div>
        </div>

        <div className={footerPaneClass} style={{ height: FOOTER_HEIGHT }}>
          <div className="flex items-center gap-3">
            <div className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[hsl(var(--spotai-blue))] px-4 py-3 text-sm font-semibold text-white">
              <BookOpenText className="h-4 w-4" />
              Read
            </div>
            <ListenButton disabled={!slide.listenable} />
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className={cardBaseClass}
      style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH, maxWidth: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      <div className={mediaPaneClass} style={{ height: MEDIA_HEIGHT }}>
        <img
          src={slide.featured_image || "/placeholder.svg"}
          alt={slide.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        <div className="absolute left-4 top-4 h-12 w-12 overflow-hidden rounded-full border-2 border-[hsl(var(--spotai-blue))] bg-white">
          <img
            src={slide.featured_image || "/placeholder.svg"}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        {slide.audio_url ? (
          <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-800">
            <Headphones className="h-4 w-4" />
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
            <Sparkles className="h-3.5 w-3.5" />
            Featured fiction
          </div>
          <h3 className="line-clamp-2 text-[1.85rem] font-semibold leading-tight">{slide.title}</h3>
          {slide.excerpt ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/82">{slide.excerpt}</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-white/78">Open the story to read the full release.</p>
          )}
        </div>
      </div>

      <div className={footerPaneClass} style={{ height: FOOTER_HEIGHT }}>
        <div className="flex items-center gap-3">
          <ReadButton to={`/post/${slide.slug}`} />
          <ListenButton
            onClick={slide.audio_url && onListen ? () => onListen(slide.audio_url!, slide.title) : undefined}
            disabled={!slide.audio_url || !onListen}
          />
        </div>
      </div>
    </motion.article>
  );
}

export default function AutoScrollCarousel({
  posts,
  className,
  onListen,
}: AutoScrollCarouselProps) {
  const { isAdmin, permissions } = useRole();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const slides = React.useMemo<StorySlide[]>(() => {
    const mappedPosts: StorySlide[] = posts.map((post) => ({
      type: "post",
      ...post,
    }));

    const maxPostCount = isAdmin && permissions.manage_posts ? 6 : 7;
    const trimmedPosts = mappedPosts.slice(0, maxPostCount);

    const withAdminCard =
      isAdmin && permissions.manage_posts
        ? (() => {
            const addCard = {
              type: "add-post" as const,
              id: "carousel-add-post",
              title: "ADD POST",
              subtitle: "Create a carousel story from here or from the admin dashboard.",
              to: "/admin?tab=posts&create=1&kind=ai_story&placement=featured_stories&status=published",
            };

            if (trimmedPosts.length === 0) return [addCard];
            return [trimmedPosts[0], addCard, ...trimmedPosts.slice(1)];
          })()
        : trimmedPosts;

    const placeholderPool: Array<Omit<Extract<StorySlide, { type: "placeholder" }>, "id">> = [
      {
        type: "placeholder" as const,
        title: "Featured story",
        subtitle: "A new fiction drop can live here.",
        eyebrow: "Homepage picks",
        image:
          "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=1200&q=80",
        accent:
          "bg-[radial-gradient(circle_at_70%_32%,rgba(108,214,255,0.26),transparent_22%),linear-gradient(180deg,#26335b_0%,#0b1320_100%)]",
        listenable: true,
      },
      {
        type: "placeholder" as const,
        title: "Audio story",
        subtitle: "Use this slot for a text and voice release.",
        eyebrow: "Voice enabled",
        image:
          "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
        accent:
          "bg-[radial-gradient(circle_at_72%_34%,rgba(97,196,255,0.2),transparent_24%),linear-gradient(180deg,#1e2a4f_0%,#0a111c_100%)]",
        listenable: true,
      },
      {
        type: "placeholder" as const,
        title: "New release",
        subtitle: "Pin your next carousel story here.",
        eyebrow: "Editor choice",
        image:
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
        accent:
          "bg-[radial-gradient(circle_at_68%_36%,rgba(111,219,255,0.18),transparent_22%),linear-gradient(180deg,#223053_0%,#09111c_100%)]",
        listenable: false,
      },
      {
        type: "placeholder" as const,
        title: "Story preview",
        subtitle: "Keep this slot warm for the next publish.",
        eyebrow: "SpotAI fiction",
        image:
          "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1200&q=80",
        accent:
          "bg-[radial-gradient(circle_at_75%_28%,rgba(98,206,255,0.18),transparent_22%),linear-gradient(180deg,#202c50_0%,#0a1019_100%)]",
        listenable: false,
      },
    ];

    const result = [...withAdminCard];
    let placeholderIndex = 0;

    while (result.length < 7) {
      const placeholder = placeholderPool[placeholderIndex % placeholderPool.length];
      result.push({
        type: "placeholder",
        id: `story-placeholder-${placeholderIndex}`,
        ...placeholder,
      });
      placeholderIndex += 1;
    }

    return result.slice(0, 7);
  }, [isAdmin, permissions.manage_posts, posts]);

  const loopedSlides = React.useMemo(() => [...slides, ...slides], [slides]);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const stepSize = CARD_WIDTH + CARD_GAP;
    const intervalId = window.setInterval(() => {
      if (isHovered) return;
      const current = scrollContainerRef.current;
      if (!current) return;

      const resetPoint = current.scrollWidth / 2;
      if (current.scrollLeft >= resetPoint - stepSize / 2) {
        current.scrollLeft -= resetPoint;
      }

      // Positive scroll value makes cards travel left on screen.
      current.scrollBy({
        left: stepSize,
        behavior: "smooth",
      });
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(intervalId);
  }, [isHovered, loopedSlides.length]);

  const scroll = React.useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.82;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  return (
    <div
      className={cn("relative w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:left-1"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto overflow-y-visible px-10 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {loopedSlides.map((slide, index) => (
          <StoryCard
            key={`${slide.id}-${index}`}
            slide={slide}
            onListen={onListen}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:right-1"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
