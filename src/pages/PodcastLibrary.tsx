import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Headphones, Play, Search } from "lucide-react";
import ShowcaseCard from "@/components/ui/showcase-card";
import { buildPodcastCollections } from "@/data/podcast-library";

export default function PodcastLibrary() {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("freebies")
      .select("*")
      .eq("type", "podcast")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPodcasts(data);
        setLoading(false);
      });
  }, []);

  const libraryItems = useMemo(() => {
    return buildPodcastCollections(podcasts);
  }, [podcasts]);

  const categories = useMemo(() => {
    return [...new Set(libraryItems.map((item) => item.category).filter(Boolean))] as string[];
  }, [libraryItems]);

  const filtered = useMemo(() => {
    return libraryItems.filter((podcast) => {
      const matchSearch =
        podcast.title.toLowerCase().includes(search.toLowerCase()) ||
        podcast.description.toLowerCase().includes(search.toLowerCase()) ||
        podcast.summary.toLowerCase().includes(search.toLowerCase()) ||
        podcast.keywords.some((keyword) => keyword.includes(search.toLowerCase()));
      const matchCat = category === "all" || podcast.category === category;
      return matchSearch && matchCat;
    });
  }, [libraryItems, search, category]);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700/75">
                Explore all podcasts
              </span>
            </div>

            <div className="text-center">
              <h1 className="text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Free Podcasts
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Listen and download from the SPOTAI vault
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search podcasts"
                  className="h-12 w-full rounded-full border border-input bg-background px-5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-violet-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setCategory("all")}
                  className={`h-10 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                    category === "all"
                      ? "border-violet-500 bg-violet-500 text-white"
                      : "border-input text-muted-foreground hover:border-violet-400 hover:text-violet-600"
                  }`}
                >
                  All
                </button>
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`h-10 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                      category === cat
                        ? "border-violet-500 bg-violet-500 text-white"
                        : "border-input text-muted-foreground hover:border-violet-400 hover:text-violet-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <div className="rounded-[2rem] border border-border bg-card px-8 py-16 text-center text-lg">
              Loading podcasts...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[2rem] border border-border bg-card px-8 py-16 text-center">
              <Headphones className="mx-auto mb-4 h-12 w-12 text-violet-600" />
              <p className="text-xl font-semibold">No podcasts found</p>
              <p className="mt-2 text-muted-foreground">Try another search or category.</p>
            </div>
          ) : (
            <div>
              <h3 className="text-4xl leading-none tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Featured Podcasts
              </h3>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Audio-first episodes presented with the same marketplace card system used across digital products.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-2">
                {filtered.map((podcast) => (
                  <ShowcaseCard
                    key={podcast.id}
                    title={podcast.title}
                    subtitle={`${podcast.episodes.length} episode${podcast.episodes.length > 1 ? "s" : ""}. ${podcast.description}`}
                    tag={podcast.tagLabel}
                    image={podcast.coverImage || undefined}
                    to={`/freebies/podcasts/${podcast.slug}`}
                    className="min-h-[32rem]"
                    imageClassName="h-[21rem] bg-[#f2efff] dark:bg-[#101425]"
                    imageObjectClassName="object-cover"
                    imageOverlay={
                      <>
                        <div className="pointer-events-none flex h-full items-center justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white shadow-[0_18px_30px_rgba(15,23,42,0.28)] backdrop-blur">
                            <Play className="ml-1 h-6 w-6 fill-current" />
                          </div>
                        </div>
                        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 shadow-sm">
                          {podcast.episodes.length} Episode{podcast.episodes.length > 1 ? "s" : ""}
                        </div>
                      </>
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
