import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
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
  const isNewsView = section === "news_articles" || category === "news";
  const [newsSearch, setNewsSearch] = useState("");

  const visiblePosts = useMemo(() => {
    if (!isNewsView) return posts;
    return posts.filter((post) => {
      const text = `${post.title} ${post.excerpt || ""} ${post.category || ""}`.toLowerCase();
      return text.includes(newsSearch.toLowerCase());
    });
  }, [isNewsView, posts, newsSearch]);

  const featuredNews = isNewsView ? visiblePosts[0] : null;
  const secondaryNews = isNewsView ? visiblePosts.slice(1) : [];

  return (
    <Layout>
      {isNewsView ? (
        <div className="min-h-screen bg-background text-foreground">
          <section className="border-b border-border bg-secondary">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  News & Articles
                </h1>
                <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  SPOTAI editorial stream
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    placeholder="Search articles"
                    className="h-12 w-full rounded-full border border-input bg-background px-5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-orange-500"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { label: "All", to: "/library?section=news_articles" },
                    { label: "News", to: "/library?section=news_articles&category=news" },
                    { label: "Opinion", to: "/library?section=news_articles&category=opinion" },
                    { label: "Review", to: "/library?section=news_articles&category=review" },
                  ].map((tab) => {
                    const isActive =
                      (tab.label === "All" && !category) ||
                      category.toLowerCase() === tab.label.toLowerCase();

                    return (
                      <Link
                        key={tab.label}
                        to={tab.to}
                        className={`inline-flex h-10 items-center rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                          isActive
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-input text-muted-foreground hover:border-orange-400 hover:text-orange-600"
                        }`}
                      >
                        {tab.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} /> Back to home
            </Link>

            {loading ? (
              <div className="rounded-[2rem] border border-border bg-card px-8 py-16 text-center text-lg">
                Loading articles...
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="rounded-[2rem] border border-border bg-card px-8 py-16 text-center">
                <p className="text-xl font-semibold">No articles found</p>
                <p className="mt-2 text-muted-foreground">Try another category or keyword.</p>
              </div>
            ) : (
              <>
                {featuredNews ? (
                  <div className="grid overflow-hidden rounded-[2rem] border border-[#ffe0cf] bg-card lg:grid-cols-2">
                    <div className="min-h-[420px] bg-[#fff3ec]">
                      <img
                        src={featuredNews.featured_image || "/placeholder.svg"}
                        alt={featuredNews.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center px-8 py-10 text-center">
                      <span className="rounded-full border border-orange-200 bg-orange-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                        {featuredNews.category || "News"}
                      </span>
                      <h2 className="mt-5 text-4xl leading-tight tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                        {featuredNews.title}
                      </h2>
                      <p className="mt-4 max-w-md text-muted-foreground">
                        {featuredNews.excerpt || "Featured story from the SPOTAI editorial team."}
                      </p>
                      <div className="mt-7 flex items-center gap-3">
                        <Link
                          to={`/post/${featuredNews.slug}`}
                          className="inline-flex h-11 items-center rounded-full border border-orange-500 bg-orange-500 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-orange-600"
                        >
                          Read
                        </Link>
                        {featuredNews.audio_url ? (
                          <button
                            onClick={() => setAudio({ src: featuredNews.audio_url, title: featuredNews.title })}
                            className="inline-flex h-11 items-center rounded-full border border-orange-300 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 transition-colors hover:bg-orange-100"
                          >
                            Listen
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {secondaryNews.length > 0 ? (
                  <div className="mt-12">
                    <h3 className="text-4xl leading-none tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                      Featured Articles
                    </h3>
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {secondaryNews.map((post) => (
                        <article key={post.id} className="overflow-hidden rounded-[1.7rem] border border-[#ffe0cf] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.05)]">
                          <div className="h-56 overflow-hidden">
                            <img
                              src={post.featured_image || "/placeholder.svg"}
                              alt={post.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-5">
                            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700">
                              {post.category || "News"}
                            </span>
                            <h4 className="mt-3 text-2xl leading-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                              {post.title}
                            </h4>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {post.excerpt || "Latest news and editorial insights from SPOTAI."}
                            </p>
                            <div className="mt-5 flex items-center gap-3">
                              <Link
                                to={`/post/${post.slug}`}
                                className="inline-flex h-10 items-center rounded-full border border-orange-300 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 transition-colors hover:bg-orange-100"
                              >
                                Read
                              </Link>
                              {post.audio_url ? (
                                <button
                                  onClick={() => setAudio({ src: post.audio_url, title: post.title })}
                                  className="inline-flex h-10 items-center rounded-full border border-orange-300 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 transition-colors hover:bg-orange-100"
                                >
                                  Listen
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      ) : (
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
      )}

      {audio && <AudioPlayer src={audio.src} title={audio.title} onClose={() => setAudio(null)} />}
    </Layout>
  );
};

export default Library;
