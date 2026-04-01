import { useEffect, useState } from "react";
import { Brain, Globe, Star, Trophy, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type QuizTrack = {
  id: string;
  title: string;
  description: string;
  level: string;
  image: string;
  to: string;
  cardGradient: string;
  buttonGradient: string;
};

const quizTracks: QuizTrack[] = [
  {
    id: "easy",
    title: "AI Fundamentals",
    description: "Test your core knowledge of AI concepts, history, and practical terms.",
    level: "Beginner",
    image: "/images/games/ai-knowledge-quiz.png",
    to: "/quiz/arena?difficulty=easy&count=10&autostart=1",
    cardGradient: "from-indigo-500/80 to-violet-500/70",
    buttonGradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "medium",
    title: "AI Intermediate",
    description: "Dive into machine learning workflows, neural networks, and product use-cases.",
    level: "Intermediate",
    image: "/images/original-library/futuristic-ai-assistant-with-data-analytics-dashboard.jpeg",
    to: "/quiz/arena?difficulty=medium&count=15&autostart=1",
    cardGradient: "from-emerald-500/80 to-blue-500/80",
    buttonGradient: "from-emerald-500 to-blue-500",
  },
  {
    id: "hard",
    title: "AI Advanced",
    description: "Master model architecture, alignment, and advanced technical AI concepts.",
    level: "Advanced",
    image: "/images/original-library/futuristic-3d-data-analytics-dashboard-illustration.webp",
    to: "/quiz/arena?difficulty=hard&count=20&autostart=1",
    cardGradient: "from-violet-500/85 to-pink-500/80",
    buttonGradient: "from-violet-500 to-pink-500",
  },
];

const headerBackClassName =
  "border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:border-indigo-300 hover:text-indigo-800";

const Games = () => {
  const [stats, setStats] = useState({
    completions: 0,
    learners: 0,
    topics: 3,
    rating: 4.8,
  });

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      const [completionsRes, learnersRes, topicsRes] = await Promise.all([
        supabase.from("quiz_sessions").select("id", { count: "exact", head: true }),
        supabase.from("quiz_player_stats").select("user_id", { count: "exact", head: true }),
        supabase.from("quiz_questions").select("category"),
      ]);

      if (!mounted) return;

      const topicCount = new Set(
        (topicsRes.data || [])
          .map((row) => (row.category || "").trim().toLowerCase())
          .filter(Boolean),
      ).size;

      setStats({
        completions: completionsRes.count ?? 0,
        learners: learnersRes.count ?? 0,
        topics: topicCount || 3,
        rating: 4.8,
      });
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title="Games"
          subtitle="Play, learn, and level up your AI knowledge."
          topLabel="Explore all games"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-indigo-700/75"
        >
          <div className="mx-auto max-w-2xl text-center text-sm text-muted-foreground">
            Three curated quiz lanes with fast rounds, instant feedback, and stored progress.
          </div>
        </CatalogHeroHeader>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="inline-flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              <Brain className="h-7 w-7 text-indigo-500" />
              AI Knowledge Quiz
              <Zap className="h-6 w-6 text-amber-500" />
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Challenge yourself with comprehensive AI quizzes across three difficulty levels.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 rounded-3xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-5 text-white sm:grid-cols-4 sm:gap-4 sm:p-7">
            <div className="text-center">
              <Trophy className="mx-auto h-5 w-5 text-white/95" />
              <p className="mt-2 text-3xl font-black leading-none">{stats.completions}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/80">Quiz completions</p>
            </div>
            <div className="text-center">
              <Users className="mx-auto h-5 w-5 text-white/95" />
              <p className="mt-2 text-3xl font-black leading-none">{stats.learners}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/80">Active learners</p>
            </div>
            <div className="text-center">
              <Globe className="mx-auto h-5 w-5 text-white/95" />
              <p className="mt-2 text-3xl font-black leading-none">{stats.topics}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/80">Quiz topics</p>
            </div>
            <div className="text-center">
              <Star className="mx-auto h-5 w-5 text-white/95" />
              <p className="mt-2 text-3xl font-black leading-none">{stats.rating}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/80">Average rating</p>
            </div>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {quizTracks.map((track) => (
              <article
                key={track.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={track.image}
                    alt={track.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className={cn("absolute inset-0 bg-gradient-to-br", track.cardGradient)} />
                  <span className="absolute right-3 top-3 rounded-full bg-white/22 px-3 py-1 text-[11px] font-semibold text-white">
                    {track.level}
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div className="text-center">
                    <h3 className="text-3xl font-black tracking-tight text-slate-900">{track.title}</h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">{track.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                    <span>40 questions</span>
                    <span>10s per question</span>
                  </div>

                  <Button
                    asChild
                    className={cn(
                      "h-11 w-full rounded-xl bg-gradient-to-r text-base font-semibold text-white",
                      track.buttonGradient,
                    )}
                  >
                    <Link to={track.to}>Start Quiz</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Ready to challenge yourself? Pick a difficulty lane and start learning.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">10 random questions per quiz</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">Instant feedback & explanations</span>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">Global leaderboard ranking</span>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Games;
