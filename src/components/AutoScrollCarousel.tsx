import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { BookOpenText, ChevronLeft, ChevronRight, Headphones, Sparkles } from "lucide-react";

interface CarouselPost {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  audio_url?: string | null;
  excerpt?: string | null;
}

interface AutoScrollCarouselProps {
  posts: CarouselPost[];
  speed?: number;
  className?: string;
  onListen?: (src: string, title: string) => void;
}

export default function AutoScrollCarousel({
  posts,
  className = "",
  onListen,
}: AutoScrollCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: posts.length > 3,
    dragFree: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(posts.length > 1);
  const [isHovered, setIsHovered] = useState(false);

  const updateControls = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateControls();
    emblaApi.on("select", updateControls);
    emblaApi.on("reInit", updateControls);
    return () => {
      emblaApi.off("select", updateControls);
      emblaApi.off("reInit", updateControls);
    };
  }, [emblaApi, updateControls]);

  useEffect(() => {
    if (!emblaApi || posts.length < 2 || isHovered) return;
    const interval = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 4800);

    return () => window.clearInterval(interval);
  }, [emblaApi, isHovered, posts.length]);

  if (posts.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No featured stories yet.</p>;
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: index * 0.04 }}
              whileHover={{ y: -4 }}
              className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_320px]"
            >
              <div className="group overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
                <Link to={`/post/${post.slug}`} className="block">
                  <div className="relative h-[320px] overflow-hidden">
                    <img
                      src={post.featured_image || "/placeholder.svg"}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/0" />

                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <div className="rounded-full bg-white/92 p-[2px] shadow-lg">
                        <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-[hsl(var(--spotai-blue))]">
                          <img
                            src={post.featured_image || "/placeholder.svg"}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="rounded-full bg-white/14 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                        Featured fiction
                      </div>
                    </div>

                    {post.audio_url ? (
                      <div className="absolute right-4 top-4 rounded-full bg-white/92 p-2 text-slate-700 shadow-lg">
                        <Headphones className="h-4 w-4" />
                      </div>
                    ) : null}

                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-white/16 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                        <Sparkles className="h-3 w-3" />
                        SpotAI picks
                      </div>
                      <h3 className="line-clamp-2 text-2xl font-semibold leading-tight drop-shadow-lg">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-sm text-white/82">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-3 border-t border-border/60 bg-white p-4">
                  <Link
                    to={`/post/${post.slug}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[hsl(var(--spotai-blue))] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[hsl(var(--spotai-blue))]/90"
                  >
                    <BookOpenText className="h-4 w-4" />
                    Read
                  </Link>
                  {post.audio_url && onListen ? (
                    <button
                      type="button"
                      onClick={() => onListen(post.audio_url!, post.title)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
                    >
                      <Headphones className="h-4 w-4" />
                      Listen
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canScrollPrev}
        className="absolute left-2 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-[0_18px_38px_rgba(15,23,42,0.18)] backdrop-blur transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 sm:left-4 sm:h-14 sm:w-14"
        aria-label="Previous stories"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canScrollNext}
        className="absolute right-2 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-[0_18px_38px_rgba(15,23,42,0.18)] backdrop-blur transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 sm:right-4 sm:h-14 sm:w-14"
        aria-label="Next stories"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
