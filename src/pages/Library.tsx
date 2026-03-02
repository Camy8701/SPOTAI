import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import AnimateInView from "@/components/AnimateInView";
import AudioPlayer from "@/components/AudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const SECTION_LABELS: Record<string, string> = {
  all: "All Posts",
  featured_stories: "Featured AI Fictions",
  featured_collections: "Featured Collections",
  best_ai_tools: "Best AI Tools",
  news_articles: "News & Articles",
  story: "Stories",
  news: "News",
  tutorial: "Tutorials",
  review: "Reviews",
  opinion: "Opinions",
};

const Library = () => {
  const [params] = useSearchParams();
  const section = params.get("section") || "all";
  const category = params.get("category") || "";
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [audio, setAudio] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      let q = supabase.from("blog_posts").select("*").eq("status", "published").order("created_at", { ascending: false });

      if (section !== "all" && ["featured_stories", "featured_collections", "best_ai_tools", "news_articles"].includes(section)) {
        q = q.eq("homepage_section", section);
      }
      if (category && ["story", "news", "tutorial", "review", "opinion"].includes(category)) {
        q = q.eq("category", category as any);
      }

      const { data } = await q;
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, [section, category]);

  const title = SECTION_LABELS[section] || SECTION_LABELS[category] || "Library";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <AnimateInView>
          <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground mb-10">Browse the full collection</p>
        </AnimateInView>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-muted rounded-lg h-72" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No posts found in this section yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div key={post.id} className="bg-card rounded-lg shadow-md overflow-hidden group flex flex-col card-hover">
                {post.featured_image && (
                  <div className="relative overflow-hidden h-48">
                    <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-600 text-white">{post.category}</Badge>
                    </div>
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(post.published_at || post.created_at).toLocaleDateString()}
                      {post.reading_time_minutes && ` • ${post.reading_time_minutes} min read`}
                    </p>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors">{post.title}</h3>
                    {post.excerpt && <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{post.excerpt}</p>}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Link to={`/post/${post.slug}`} className="flex-1">
                      <motion.button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        Read
                      </motion.button>
                    </Link>
                    {post.audio_url && (
                      <motion.button
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setAudio({ src: post.audio_url, title: post.title })}
                      >
                        Listen
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {audio && <AudioPlayer src={audio.src} title={audio.title} onClose={() => setAudio(null)} />}
    </Layout>
  );
};

export default Library;
