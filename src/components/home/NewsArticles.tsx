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

const NewsArticles = ({ posts, loading, onListen }: Props) => (
  <section className="py-12 sm:py-16 bg-secondary" id="news-articles">
    <AnimateInView>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">News & Articles</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Latest insights and updates from the AI world</p>
          </div>
          <Link to="/library?section=news_articles" className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors relative group">
            View all news
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        {loading ? (
          <SectionSkeleton />
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No news articles assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((article) => (
              <div key={article.id} className="bg-card rounded-lg shadow-md overflow-hidden group flex flex-col card-hover">
                <Link to={`/post/${article.slug}`} className="block relative overflow-hidden aspect-[4/3] h-48 cursor-pointer">
                  <img src={article.featured_image || "/placeholder.svg"} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <span className="bg-purple-500 text-white rounded-full px-3 py-1 text-xs font-semibold">{article.category}</span>
                    <span className="text-white text-xs bg-black/50 rounded-full px-2 py-1">📅 {new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
                <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold group-hover:text-purple-600 transition-colors text-foreground line-clamp-2">{article.title}</h3>
                    {article.excerpt && <p className="text-muted-foreground line-clamp-3 mt-2 text-sm sm:text-base">{article.excerpt}</p>}
                    {article.reading_time_minutes && <div className="text-sm text-muted-foreground mt-2">{article.reading_time_minutes} min read</div>}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Link to={`/post/${article.slug}`} className="flex-1">
                      <motion.button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 rounded-xl font-medium" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                        Read
                      </motion.button>
                    </Link>
                    {article.audio_url && (
                      <motion.button className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => onListen(article.audio_url!, article.title)}>
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
            <Link to="/library?section=news_articles" className="inline-flex items-center gap-3 text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 transition-colors">
              <span>Explore all news & articles</span>
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

export default NewsArticles;
