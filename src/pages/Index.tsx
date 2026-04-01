import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SectionNavigation from "@/components/SectionNavigation";
import AnimateInView from "@/components/AnimateInView";
import AutoScrollCarousel from "@/components/AutoScrollCarousel";
import AudioPlayer from "@/components/AudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import DigitalProducts from "@/components/home/DigitalProducts";
import BestAiTools from "@/components/home/BestAiTools";
import NewsArticles from "@/components/home/NewsArticles";
import GamesSection from "@/components/home/GamesSection";
import ConnectSection from "@/components/home/ConnectSection";
import { NEURALINK_STORY, addNeuralinkLead } from "@/data/fallback/neuralinkStory";

const getFallbackForSection = (section: string, limit: number) => {
  if (section === "hero") return [NEURALINK_STORY];
  if (section === "featured_stories") return addNeuralinkLead([], limit);
  if (section === "featured_collections") return addNeuralinkLead([], limit);
  return [];
};

const fetchPostsBySection = async (section: string, limit: number) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .is("community_id", null)
    .is("group_id", null)
    .eq("homepage_section", section)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Failed to fetch homepage section "${section}"`, error);
    return getFallbackForSection(section, limit);
  }

  const rows = data ?? [];

  if (section === "hero") {
    return addNeuralinkLead(rows, 1);
  }

  if (section === "featured_stories" || section === "featured_collections") {
    return addNeuralinkLead(rows, limit);
  }

  return rows;
};

const Index = () => {
  const [audio, setAudio] = useState<{ src: string; title: string } | null>(null);

  const { data: heroPosts = [] } = useQuery({
    queryKey: ["homepage", "hero"],
    queryFn: () => fetchPostsBySection("hero", 1),
    staleTime: 5 * 60 * 1000,
  });

  const { data: featuredStories = [] } = useQuery({
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
      <section className="py-6 sm:py-8" id="featured-stories">
        <AnimateInView>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AutoScrollCarousel posts={featuredStories} onListen={handleListen} />
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
