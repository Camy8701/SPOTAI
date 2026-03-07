import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Download, Headphones, Search } from "lucide-react";

export default function PodcastLibrary() {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("freebies")
      .select("*")
      .eq("type", "podcast")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setPodcasts(data);
          const cats = [...new Set(data.map((item) => item.category).filter(Boolean))] as string[];
          setCategories(cats);
        }
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return podcasts.filter((podcast) => {
      const matchSearch =
        podcast.title.toLowerCase().includes(search.toLowerCase()) ||
        (podcast.description || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "all" || podcast.category === category;
      return matchSearch && matchCat;
    });
  }, [podcasts, search, category]);

  const featured = filtered[0];
  const cards = filtered.slice(1);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
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
                {categories.slice(0, 4).map((cat) => (
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
            <>
              {featured ? (
                <div className="grid overflow-hidden rounded-[2rem] border border-[#dfd8ff] bg-card lg:grid-cols-2">
                  <div className="min-h-[380px] bg-[#f2efff]">
                    {featured.cover_image ? (
                      <img
                        src={featured.cover_image}
                        alt={featured.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Headphones className="h-16 w-16 text-violet-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center px-8 py-10 text-center">
                    <span className="rounded-full border border-violet-200 bg-violet-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                      {featured.category || "Podcast"}
                    </span>
                    <h2 className="mt-5 text-4xl leading-tight tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                      {featured.title}
                    </h2>
                    <p className="mt-4 max-w-md text-muted-foreground">{featured.description || "A featured episode from the SPOTAI audio library."}</p>
                    <div className="mt-7 flex items-center gap-3">
                      <a
                        href={featured.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center rounded-full border border-violet-600 bg-violet-600 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-violet-700"
                      >
                        Listen
                      </a>
                      <a
                        href={featured.file_url}
                        download
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-violet-300 text-violet-700 transition-colors hover:bg-violet-100"
                        aria-label={`Download ${featured.title}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}

                {cards.length > 0 ? (
                  <div className="mt-12">
                    <h3 className="text-4xl leading-none tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                      Featured Podcasts
                    </h3>
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {cards.map((podcast) => (
                      <article key={podcast.id} className="overflow-hidden rounded-[1.7rem] border border-[#dfd8ff] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.05)]">
                        <div className="h-56 overflow-hidden">
                          {podcast.cover_image ? (
                            <img src={podcast.cover_image} alt={podcast.title} className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Headphones className="h-14 w-14 text-violet-600" />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                            {podcast.category || "Podcast"}
                          </span>
                          <h4 className="mt-3 text-2xl leading-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                            {podcast.title}
                          </h4>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {podcast.description || "Free audio resource from the SPOTAI library."}
                          </p>
                          <div className="mt-5 flex items-center gap-3">
                            <a
                              href={podcast.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-10 items-center rounded-full border border-violet-300 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 transition-colors hover:bg-violet-100"
                            >
                              Open
                            </a>
                            <a
                              href={podcast.file_url}
                              download
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-300 text-violet-700 transition-colors hover:bg-violet-100"
                              aria-label={`Download ${podcast.title}`}
                            >
                              <Download className="h-4 w-4" />
                            </a>
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
    </Layout>
  );
}
