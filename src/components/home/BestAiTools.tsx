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
}

interface Props {
  posts: Post[];
  loading: boolean;
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

const BestAiTools = ({ posts, loading }: Props) => (
  <section className="py-12 sm:py-16 bg-secondary" id="best-ai-tools">
    <AnimateInView>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Best AI Tools</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Discover the most innovative AI tools and solutions</p>
        </div>

        {loading ? (
          <SectionSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">No AI tools posts yet.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-card rounded-lg shadow-md overflow-hidden flex flex-col card-hover">
                  <Link to={`/post/${post.slug}`} className="block relative h-48 overflow-hidden cursor-pointer group">
                    <img src={post.featured_image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </Link>
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="bg-secondary text-muted-foreground rounded-full px-3 py-1 text-sm font-medium self-start mb-3">{post.category}</span>
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-1">{post.excerpt || ""}</p>
                    <div className="flex gap-3 mt-auto">
                      <Link to={`/post/${post.slug}`} className="flex-1">
                        <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg">Read</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-10 sm:mt-16 text-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/library?section=best_ai_tools" className="inline-flex items-center gap-3 text-green-600 dark:text-green-400 font-semibold hover:text-green-700 transition-colors">
              <span>Explore all AI tools</span>
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

export default BestAiTools;
