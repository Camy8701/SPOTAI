import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Headphones, Sparkles } from "lucide-react";

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
}: AutoScrollCarouselProps) {
  if (posts.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No featured stories yet.</p>;
  }

  return (
    <div className={`overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      <div className="flex min-w-max gap-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: index * 0.04 }}
            whileHover={{ y: -4 }}
            className="w-[142px] shrink-0"
          >
            <Link
              to={`/post/${post.slug}`}
              className="group block cursor-pointer overflow-hidden rounded-[24px] border border-border/70 bg-card shadow-[0_18px_50px_rgba(15,23,42,0.10)]"
            >
              <div className="relative h-[232px] overflow-hidden">
                <img
                  src={post.featured_image || "/placeholder.svg"}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/5" />

                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <div className="rounded-full bg-white/90 p-[2px] shadow-lg">
                    <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-[hsl(var(--spotai-blue))]">
                      <img
                        src={post.featured_image || "/placeholder.svg"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {post.audio_url ? (
                  <div className="absolute right-3 top-3 rounded-full bg-white/92 p-2 text-slate-700 shadow-lg">
                    <Headphones className="h-4 w-4" />
                  </div>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/16 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                    <Sparkles className="h-3 w-3" />
                    AI fiction
                  </div>
                  <h3 className="line-clamp-3 text-base font-semibold leading-[1.15] drop-shadow-lg">
                    {post.title}
                  </h3>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
