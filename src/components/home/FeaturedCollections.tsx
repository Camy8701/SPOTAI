import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import AnimateInView from "@/components/AnimateInView";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  category: string;
  published_at: string | null;
  created_at: string;
  reading_time_minutes: number | null;
  audio_url: string | null;
}

interface Props {
  posts: Post[];
  loading: boolean;
  onListen: (src: string, title: string) => void;
}

const SectionSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-lg overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="p-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const FeaturedCollections = ({ posts, loading, onListen }: Props) => (
  <section className="py-12 sm:py-16 bg-secondary" id="featured-collections">
    <AnimateInView>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">AI Stories</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover captivating AI fictions that push the boundaries of creativity
          </p>
        </div>

        {loading ? (
          <SectionSkeleton />
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No posts assigned to this section yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <div key={post.id} className="bg-card rounded-lg shadow-md overflow-hidden group cursor-pointer flex flex-col card-hover">
                <Link to={`/post/${post.slug}`} className="block relative overflow-hidden h-48 sm:h-64 cursor-pointer">
                  <img src={post.featured_image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">{post.category}</span>
                  </div>
                </Link>
                <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>📅 {new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                      {post.reading_time_minutes && (
                        <>
                          <span>•</span>
                          <span>⏱️ {post.reading_time_minutes} min read</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold group-hover:text-blue-600 transition-colors text-foreground mb-3">{post.title}</h3>
                    {post.excerpt && <p className="text-muted-foreground line-clamp-3 text-sm sm:text-base">{post.excerpt}</p>}
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Link to={`/post/${post.slug}`} className="flex-1">
                      <motion.button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-xl font-medium shadow-lg" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                        Read
                      </motion.button>
                    </Link>
                    {post.audio_url && (
                      <motion.button className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => onListen(post.audio_url!, post.title)}>
                        Listen
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 sm:mt-16 text-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/library?section=featured_collections" className="inline-flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold hover:text-green-600 transition-colors">
              <span>Explore All Stories</span>
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                <ArrowRight size={20} />
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>
    </AnimateInView>
  </section>
);

export default FeaturedCollections;
