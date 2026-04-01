import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { TrendingUp, Heart, MessageCircle, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";

const topicColors: Record<string, string> = {
  story: "from-blue-500 to-cyan-500",
  news: "from-red-500 to-orange-500",
  tutorial: "from-green-500 to-emerald-500",
  review: "from-purple-500 to-violet-500",
  opinion: "from-amber-500 to-yellow-500",
};

const getTimeDecayBonus = (publishedAt: string | null, createdAt: string) => {
  const date = new Date(publishedAt || createdAt);
  const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  // Posts < 24h get max bonus of 10, decays over 7 days
  if (hoursAgo < 24) return 10;
  if (hoursAgo < 72) return 7;
  if (hoursAgo < 168) return 3;
  return 0;
};
const headerBackClassName =
  "border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 hover:border-orange-300 hover:text-orange-800";

const Popular = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["popular-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_popular_posts");

      if (error) throw error;

      return (data || []).map((post) => {
        const likes = Number(post.like_count) || 0;
        const comments = Number(post.comment_count) || 0;
        const recencyBonus = getTimeDecayBonus(post.published_at, post.created_at);
        const score = (likes * 2) + (comments * 3) + recencyBonus;
        const isTrending = recencyBonus >= 7 && (likes + comments) >= 1;
        return { ...post, likeCount: likes, commentCount: comments, score, isTrending };
      }).sort((a, b) => b.score - a.score);
    },
  });

  // Group by category
  const grouped = (posts || []).reduce((acc, post) => {
    if (!acc[post.category]) acc[post.category] = [];
    acc[post.category].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title="Popular"
          subtitle="Trending content organized by topic"
          topLabel="Trending right now"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-orange-700/75"
        />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <TrendingUp className="text-white" size={24} />
            </div>
            <p className="text-sm font-medium">Freshly ranked using likes, comments, and recency.</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-secondary" />
              ))}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <TrendingUp className="mx-auto mb-4 opacity-40" size={48} />
              <p>No popular content yet. Be the first to create!</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, categoryPosts]) => (
              <div key={category} className="mb-10">
                <div className="mb-4 flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${topicColors[category] || "from-gray-400 to-gray-500"}`} />
                  <h2 className="text-xl font-bold capitalize text-foreground">{category}</h2>
                  <span className="text-sm text-muted-foreground">({categoryPosts!.length})</span>
                </div>
                <div className="space-y-3">
                  {categoryPosts!.slice(0, 5).map((post, idx) => (
                    <Link to={`/post/${post.slug}`} key={post.id}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                      >
                        <span className="w-8 text-2xl font-black text-muted-foreground/40">#{idx + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-semibold text-foreground">{post.title}</h3>
                            {post.isTrending && (
                              <Badge className="shrink-0 gap-1 border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                <Flame size={12} /> Trending
                              </Badge>
                            )}
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{post.excerpt}</p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Heart size={14} /> {post.likeCount}</span>
                          <span className="flex items-center gap-1"><MessageCircle size={14} /> {post.commentCount}</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Popular;
