import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Headphones,
  Play,
  Radio,
  Sparkles,
  Waves,
} from "lucide-react";

import AudioPlayer from "@/components/AudioPlayer";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { buildPodcastCollections, getBundledPodcastCollectionBySlug, type PodcastCollection, type PodcastEpisode } from "@/data/podcast-library";
import { supabase } from "@/integrations/supabase/client";

const PodcastCollectionDetail = () => {
  const { slug = "" } = useParams();
  const bundled = getBundledPodcastCollectionBySlug(slug);
  const [collection, setCollection] = useState<PodcastCollection | null>(bundled);
  const [loading, setLoading] = useState(!bundled);
  const [activeEpisodeId, setActiveEpisodeId] = useState(bundled?.episodes[0]?.id || "");
  const [audio, setAudio] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    if (bundled) {
      setCollection(bundled);
      setActiveEpisodeId(bundled.episodes[0]?.id || "");
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("freebies")
      .select("*")
      .eq("type", "podcast")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const resolved = buildPodcastCollections(data || []).find((item) => item.slug === slug) || null;
        setCollection(resolved);
        setActiveEpisodeId(resolved?.episodes[0]?.id || "");
        setLoading(false);
      });
  }, [bundled, slug]);

  const activeEpisode = useMemo(() => {
    if (!collection) return null;
    return collection.episodes.find((episode) => episode.id === activeEpisodeId) || collection.episodes[0] || null;
  }, [activeEpisodeId, collection]);

  const playEpisode = (episode: PodcastEpisode) => {
    if (!collection) return;
    setActiveEpisodeId(episode.id);
    setAudio({
      src: episode.fileUrl,
      title: `${collection.title} — ${episode.title}`,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card p-10 text-center text-lg">
            Loading podcast...
          </div>
        </div>
      </Layout>
    );
  }

  if (!collection) {
    return (
      <Layout>
        <div className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card p-10 text-center">
            <h1 className="text-4xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
              Podcast not found
            </h1>
            <p className="mt-3 text-muted-foreground">
              This podcast series is missing or no longer available.
            </p>
            <div className="mt-7 flex justify-center">
              <Button asChild className="rounded-full">
                <Link to="/freebies/podcasts">Back to podcast library</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="overflow-hidden border-b border-border bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <Link
              to="/freebies/podcasts"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-violet-300 hover:text-violet-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to podcasts
            </Link>

            <div className="mt-7 grid gap-8 lg:grid-cols-[1fr,22rem]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                    {collection.tagLabel}
                  </span>
                  <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                    {collection.episodes.length} Episode{collection.episodes.length > 1 ? "s" : ""}
                  </span>
                  <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                    Audio
                  </span>
                </div>
                <h1
                  className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight text-foreground md:text-6xl"
                  style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                >
                  {collection.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                  {collection.summary}
                </p>

                <div className="mt-8 flex flex-wrap gap-8 text-foreground">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-medium">Series type</span>
                    <span className="text-sm text-muted-foreground">{collection.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-medium">Episodes</span>
                    <span className="text-sm text-muted-foreground">{collection.episodes.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Waves className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-medium">Format</span>
                    <span className="text-sm text-muted-foreground">Streaming audio</span>
                  </div>
                </div>
              </div>

              <div className="self-end rounded-3xl border border-border bg-white p-5">
                <div className="overflow-hidden rounded-2xl border border-border bg-muted/35">
                  {collection.coverImage ? (
                    <img src={collection.coverImage} alt={collection.title} className="h-52 w-full object-cover" />
                  ) : (
                    <div className="flex h-52 items-center justify-center">
                      <Headphones className="h-16 w-16 text-violet-600" />
                    </div>
                  )}
                </div>
                {activeEpisode ? (
                  <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                      Now selected
                    </p>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                      {activeEpisode.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{activeEpisode.description}</p>
                  </div>
                ) : null}
                <div className="mt-4 space-y-3">
                  {activeEpisode ? (
                    <>
                      <button
                        type="button"
                        onClick={() => playEpisode(activeEpisode)}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ef4a3d] text-sm font-semibold text-white transition-colors hover:bg-[#dc3f34]"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Play episode
                      </button>
                      <a
                        href={activeEpisode.fileUrl}
                        download
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground transition hover:border-violet-300 hover:bg-violet-50"
                      >
                        <Download className="h-4 w-4" />
                        Download audio
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr,22rem] lg:items-start">
            <div className="space-y-7">
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">Series overview</p>
                <p className="mt-4 text-[1.05rem] leading-8 text-slate-700 dark:text-slate-200">
                  {collection.description}
                </p>
              </div>

              <div>
                <h2 className="text-4xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  Episodes
                </h2>
                <div className="mt-5 space-y-4">
                  {collection.episodes.map((episode, index) => {
                    const isActive = activeEpisode?.id === episode.id;
                    return (
                      <article
                        key={episode.id}
                        className={`rounded-[1.7rem] border bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,0.05)] transition-colors ${
                          isActive
                            ? "border-violet-300 bg-violet-50/60"
                            : "border-border"
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                                {episode.episodeLabel}
                              </span>
                              {isActive ? (
                                <span className="rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                                  Selected
                                </span>
                              ) : null}
                            </div>
                            <h3
                              className="mt-3 text-2xl leading-tight text-foreground"
                              style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                            >
                              {episode.title}
                            </h3>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                              {episode.description}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <button
                              type="button"
                              onClick={() => playEpisode(episode)}
                              className="inline-flex h-10 items-center rounded-full border border-violet-300 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 transition-colors hover:bg-violet-100"
                            >
                              <Play className="mr-2 h-4 w-4 fill-current" />
                              Play
                            </button>
                            <a
                              href={episode.fileUrl}
                              download
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-300 text-violet-700 transition-colors hover:bg-violet-100"
                              aria-label={`Download ${episode.title}`}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-5 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-2xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  This series covers
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {collection.keywords.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 text-[#ef4a3d]" />
                      <span className="capitalize">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-2xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  Listening format
                </h3>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>Series size</span>
                    <span className="font-semibold text-foreground">{collection.episodes.length} episodes</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Delivery</span>
                    <span className="font-semibold text-foreground">Streaming + download</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Format</span>
                    <span className="font-semibold text-foreground">M4A audio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {audio ? <AudioPlayer src={audio.src} title={audio.title} onClose={() => setAudio(null)} /> : null}
      </div>
    </Layout>
  );
};

export default PodcastCollectionDetail;
