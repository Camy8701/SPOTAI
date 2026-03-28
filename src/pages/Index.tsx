import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SectionNavigation from "@/components/SectionNavigation";
import AnimateInView from "@/components/AnimateInView";
import AutoScrollCarousel from "@/components/AutoScrollCarousel";
import AudioPlayer from "@/components/AudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import DigitalProducts from "@/components/home/DigitalProducts";
import BestAiTools from "@/components/home/BestAiTools";
import NewsArticles from "@/components/home/NewsArticles";
import GamesSection from "@/components/home/GamesSection";
import ConnectSection from "@/components/home/ConnectSection";

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

const StoryStripSkeleton = () => (
  <div className="overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div className="flex min-w-max gap-5">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="w-[320px] shrink-0">
          <Skeleton className="h-[380px] w-full rounded-[28px]" />
        </div>
      ))}
    </div>
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
  const handleListen = (src: string, title: string) => setAudio({ src, title });

  return (
    <Layout>
      <SectionNavigation />

      {/* Story Strip Carousel */}
      <section className="bg-background py-6 sm:py-8" id="featured-stories">
        <AnimateInView>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {storiesLoading ? (
              <StoryStripSkeleton />
            ) : (
              <AutoScrollCarousel posts={featuredStories} onListen={handleListen} />
            )}
          </div>
        </AnimateInView>
      </section>

      {/* Hero */}
      {hero ? (
        <HeroSection hero={hero} onListen={handleListen} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground">
          <p>No hero post assigned yet. Assign a post to the "Hero" section from the admin dashboard.</p>
        </div>
      )}

      <FeaturedCollections posts={featuredCollections} loading={collectionsLoading} onListen={handleListen} />
      <DigitalProducts />
      <BestAiTools posts={aiToolsPosts} loading={toolsLoading} />
      <NewsArticles posts={newsArticles} loading={newsLoading} onListen={handleListen} />
      <GamesSection />
      <ConnectSection />

      {audio && <AudioPlayer src={audio.src} title={audio.title} onClose={() => setAudio(null)} />}
    </Layout>
  );
};

export default Index;
