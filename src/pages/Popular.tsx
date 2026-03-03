import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { TrendingUp, Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Popular = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["popular-posts"],
    queryFn: async () => {
      const { data: allPosts, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const postsWithCounts = await Promise.all(
        (allPosts || []).map(async (post) => {
          const [{ count: likeCount }, { count: commentCount }] = await Promise.all([
            supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", post.id),
          ]);
          return { ...post, likeCount: likeCount || 0, commentCount: commentCount || 0, score: (likeCount || 0) + (commentCount || 0) };
        })
      );

      return postsWithCounts.sort((a, b) => b.score - a.score);
    },
  });

  const grouped = (posts || []).reduce((acc, post) => {
    if (!acc[post.category]) acc[post.category] = [];
    acc[post.category].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Popular</h1>
          <p className="text-muted-foreground mt-1">Trending content organized by topic</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-secondary animate-pulse rounded-xl" />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <TrendingUp className="mx-auto mb-4 opacity-40" size={48} />
            <p>No popular content yet. Be the first to create!</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, categoryPosts]) => (
            <div key={category} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-foreground capitalize">{category}</h2>
                <span className="text-sm text-muted-foreground">({categoryPosts!.length})</span>
              </div>
              <div className="space-y-3">
                {categoryPosts!.slice(0, 5).map((post, idx) => (
                  <Link to={`/post/${post.slug}`} key={post.id}>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border card-hover">
                      <span className="text-2xl font-black text-muted-foreground/40 w-8">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                        <span className="flex items-center gap-1"><Heart size={14} /> {post.likeCount}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={14} /> {post.commentCount}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default Popular;
