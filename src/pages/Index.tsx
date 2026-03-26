import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SectionNavigation from "@/components/SectionNavigation";
import AnimateInView from "@/components/AnimateInView";
import AutoScrollCarousel from "@/components/AutoScrollCarousel";
import AudioPlayer from "@/components/AudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const fetchPostsBySection = async (section: string, limit: number) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("homepage_section", section)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
};

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

const Index = () => {
  const [audio, setAudio] = useState<{ src: string; title: string } | null>(null);

  const { data: heroPosts = [] } = useQuery({
    queryKey: ["homepage", "hero"],
    queryFn: () => fetchPostsBySection("hero", 1),
    staleTime: 5 * 60 * 1000,
  });

  const { data: featuredStories = [], isLoading: storiesLoading } = useQuery({
    queryKey: ["homepage", "featured_stories"],
    queryFn: () => fetchPostsBySection("featured_stories", 10),
    staleTime: 5 * 60 * 1000,
  });

  const { data: featuredCollections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ["homepage", "featured_collections"],
    queryFn: () => fetchPostsBySection("featured_collections", 6),
    staleTime: 5 * 60 * 1000,
  });

  const { data: newsArticles = [], isLoading: newsLoading } = useQuery({
    queryKey: ["homepage", "news_articles"],
    queryFn: () => fetchPostsBySection("news_articles", 6),
    staleTime: 5 * 60 * 1000,
  });

  const { data: aiToolsPosts = [], isLoading: toolsLoading } = useQuery({
    queryKey: ["homepage", "best_ai_tools"],
    queryFn: () => fetchPostsBySection("best_ai_tools", 6),
    staleTime: 5 * 60 * 1000,
  });

  const hero = heroPosts[0];

  return (
    <Layout>
      <SectionNavigation />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-24 flex items-center justify-center bg-background">
        <div className="container mx-auto px-4 text-center">
          <AnimateInView>
            <h1 className="font-semibold text-foreground tracking-tighter leading-none uppercase text-[2rem] sm:text-[3rem] md:text-[5.2rem] lg:text-[7rem] xl:text-[8.5rem] w-full text-center">
              LATEST AI CHRONICLES
            </h1>
          </AnimateInView>
        </div>
      </section>

      {/* Featured Content - Hero Image */}
      {hero ? (
        <AnimateInView className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="relative overflow-hidden rounded-lg group" style={{ aspectRatio: '16/9', maxHeight: '52.5rem' }}>
            <img
              src={hero.featured_image || "/placeholder.svg"}
              alt={hero.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-16 sm:bottom-32 left-4 sm:left-8 right-4 sm:right-8 text-center">
              <h2 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">{hero.title}</h2>
              {hero.excerpt && <p className="text-sm sm:text-lg md:text-xl text-gray-200 drop-shadow-lg line-clamp-2">{hero.excerpt}</p>}
            </div>
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 sm:gap-4">
              <Link to={`/post/${hero.slug}`}>
                <motion.button className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-2xl" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  Read
                </motion.button>
              </Link>
              {hero.audio_url && (
                <motion.button
                  className="bg-red-500 hover:bg-red-600 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-2xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAudio({ src: hero.audio_url, title: hero.title })}
                >
                  Listen
                </motion.button>
              )}
            </div>
          </div>
        </AnimateInView>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground">
          <p>No hero post assigned yet. Assign a post to the "Hero" section from the admin dashboard.</p>
        </div>
      )}

      {/* Featured Stories Carousel */}
      <section className="py-12 sm:py-16 bg-background border-t border-border" id="featured-stories">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Featured AI Fictions</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Curated collection of outstanding AI narratives</p>
              </div>
            </div>
            {storiesLoading ? <SectionSkeleton /> : (
              <AutoScrollCarousel posts={featuredStories} speed={30} onListen={(src, title) => setAudio({ src, title })} />
            )}
          </div>
        </AnimateInView>
      </section>

      {/* Featured Collections */}
      <section className="py-12 sm:py-16 bg-secondary" id="featured-collections">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Featured Collection</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover captivating AI fictions that push the boundaries of creativity
              </p>
            </div>

            {collectionsLoading ? <SectionSkeleton /> : featuredCollections.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No posts assigned to this section yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {featuredCollections.map((post) => (
                  <div key={post.id} className="bg-card rounded-lg shadow-md overflow-hidden group cursor-pointer flex flex-col card-hover">
                    <Link to={`/post/${post.slug}`} className="block relative overflow-hidden h-48 sm:h-64">
                      <img src={post.featured_image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">{post.category}</span>
                      </div>
                    </Link>
                    <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <span>📅 {new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                          {post.reading_time_minutes && <><span>•</span><span>⏱️ {post.reading_time_minutes} min read</span></>}
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
                          <motion.button className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setAudio({ src: post.audio_url, title: post.title })}>
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

      {/* Digital Products */}
      <section className="py-12 sm:py-16 bg-background" id="digital-products">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Digital Products</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover premium digital products crafted to enhance your AI journey
              </p>
            </div>
            <div className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-lg">
              Coming soon — Digital products will be available here
            </div>
          </div>
        </AnimateInView>
      </section>

      {/* Best AI Tools */}
      <section className="py-12 sm:py-16 bg-secondary" id="best-ai-tools">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Best AI Tools</h2>
              <p className="text-muted-foreground text-sm sm:text-base">Discover the most innovative AI tools and solutions</p>
            </div>

            {toolsLoading ? <SectionSkeleton /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {aiToolsPosts.length === 0 ? (
                  <p className="col-span-full text-center text-muted-foreground py-8">No AI tools posts yet.</p>
                ) : aiToolsPosts.map((post) => (
                  <div key={post.id} className="bg-card rounded-lg shadow-md overflow-hidden flex flex-col card-hover">
                    <Link to={`/post/${post.slug}`} className="block relative h-48 overflow-hidden">
                      <img src={post.featured_image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
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
                ))}
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

      {/* News & Articles */}
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

            {newsLoading ? <SectionSkeleton /> : newsArticles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No news articles assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {newsArticles.map((article) => (
                  <div key={article.id} className="bg-card rounded-lg shadow-md overflow-hidden group flex flex-col card-hover">
                    <Link to={`/post/${article.slug}`} className="block relative overflow-hidden aspect-[4/3] h-48">
                      <img src={article.featured_image || "/placeholder.svg"} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        <span className="bg-purple-500 text-white rounded-full px-3 py-1 text-xs font-semibold">{article.category}</span>
                        <span className="text-white text-xs bg-black/50 rounded-full px-2 py-1">📅 {new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
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
                          <motion.button className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setAudio({ src: article.audio_url, title: article.title })}>
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

      {/* AI Quiz / Games Section */}
      <section className="py-12 sm:py-16 bg-background" id="ai-quiz">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Games</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Test your AI knowledge with our interactive games and quizzes
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/quiz">
                <motion.button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  Start Quiz
                </motion.button>
              </Link>
              <Link to="/quiz">
                <motion.button
                  className="inline-flex items-center gap-2 border border-border bg-card hover:bg-accent text-foreground px-8 py-4 rounded-xl font-semibold text-lg shadow-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Gamepad2 size={20} />
                  View All Games
                </motion.button>
              </Link>
            </div>
          </div>
        </AnimateInView>
      </section>

      {/* Connect With Us */}
      <section className="py-12 sm:py-16 bg-secondary" id="action-buttons">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Connect With Us</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Get in touch, support our work, or follow our latest content
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <motion.button
                className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm transition-colors hover:bg-blue-50"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="text-3xl sm:text-4xl mb-4">📧</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground">Contact Us</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Get in touch with our team</p>
              </motion.button>
              <motion.button
                className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm transition-colors hover:bg-orange-50"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.open("https://ko-fi.com/spotai", "_blank")}
              >
                <div className="text-3xl sm:text-4xl mb-4">☕</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground">Support Us</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Help us create more content</p>
              </motion.button>
              <motion.button
                className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm transition-colors hover:bg-red-50"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.open("https://www.youtube.com/channel/UC6D5mUGNBRB80j_5A-QkazA", "_blank")}
              >
                <div className="text-3xl sm:text-4xl mb-4">📺</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground">YouTube</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Watch our latest videos</p>
              </motion.button>
            </div>
          </div>
        </AnimateInView>
      </section>

      {/* Audio Player */}
      {audio && <AudioPlayer src={audio.src} title={audio.title} onClose={() => setAudio(null)} />}
    </Layout>
  );
};

export default Index;
