import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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

export default function AutoScrollCarousel({ posts, speed = 20, className = "", onListen }: AutoScrollCarouselProps) {
  const [duplicated, setDuplicated] = useState<CarouselPost[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (posts.length > 0) {
      setDuplicated([...posts, ...posts, ...posts]);
    }
  }, [posts]);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.scrollWidth - containerRef.current.offsetWidth);
    }
  }, [duplicated]);

  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No featured stories yet.</p>;
  }

  return (
    <div className={`overflow-hidden ${className}`} ref={containerRef}>
      <motion.div
        className="flex gap-6"
        animate={{ x: [-width / 3, (-width * 2) / 3] }}
        transition={{ x: { duration: speed, repeat: Infinity, repeatType: "loop", ease: "linear" } }}
      >
        {duplicated.map((post, index) => (
          <motion.div
            key={`${post.id}-${index}`}
            className="min-w-[560px] h-[400px] relative rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-r from-blue-600 to-red-600 p-[2px]"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Link to={`/post/${post.slug}`} className="absolute inset-0 bg-black rounded-lg overflow-hidden m-[1px] cursor-pointer group/img block">
              <img
                src={post.featured_image || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-300" />
              {/* Overlay with title and buttons */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg line-clamp-2">{post.title}</h3>
                {post.excerpt && <p className="text-gray-300 text-sm mb-3 line-clamp-1">{post.excerpt}</p>}
                <div className="flex gap-3">
                  <motion.button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read
                  </motion.button>
                  {post.audio_url && onListen && (
                    <motion.button
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium text-sm shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); onListen(post.audio_url!, post.title); }}
                    >
                      Listen
                    </motion.button>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
