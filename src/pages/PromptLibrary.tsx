import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ArrowLeft, ArrowRight, Check, Copy, Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  PromptLibraryItem,
  formatDifficulty,
  getPromptCategories,
  getPromptExcerpt,
  mergePromptLibraryItems,
} from "@/lib/prompt-library";

export default function PromptLibrary() {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<PromptLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("prompt_library_items")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
      setPrompts(mergePromptLibraryItems(data || []));
      setLoading(false);
    };

    load();
  }, []);

  const categories = useMemo(() => getPromptCategories(prompts), [prompts]);

  const visiblePrompts = useMemo(() => {
    return prompts.filter((item) => {
      const text = `${item.title} ${item.description || ""} ${item.prompt_text || ""} ${item.category || ""} ${item.model || ""} ${item.source_label || ""} ${item.connectors.join(" ")} ${item.tags.join(" ")}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, prompts, search]);

  const copyPrompt = async (item: PromptLibraryItem) => {
    await navigator.clipboard.writeText(item.prompt_text);
    setCopiedId(item.id);
    toast({ title: "Prompt copied", description: `"${item.title}" copied to clipboard.` });
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f7fbff] text-slate-900">
        <section className="border-b border-[#d6e3ef] bg-[linear-gradient(180deg,#dceeff_0%,#edf5ff_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="max-w-4xl">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-semibold text-violet-700 shadow-[0_10px_24px_rgba(139,92,246,0.06)] transition hover:border-violet-300 hover:text-violet-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">
                <Sparkles className="h-4 w-4" />
                Prompt Hub
              </div>
              <h1 className="mt-5 text-5xl tracking-tight text-slate-900" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Prompt Library
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                Create and discover prompts that unlock more powerful ways to build, automate, design, and generate with AI.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/create-post"
                className="inline-flex items-center rounded-full border border-violet-400/50 bg-white/75 px-5 py-2.5 text-sm font-semibold text-violet-700 shadow-[0_10px_24px_rgba(139,92,246,0.08)] transition hover:border-violet-500 hover:text-violet-800"
              >
                Request a prompt
              </Link>
            </div>

            <div className="mt-10 rounded-[36px] border border-violet-200 bg-[linear-gradient(180deg,#f4efff_0%,#ede7ff_100%)] p-6 shadow-[0_20px_60px_rgba(139,92,246,0.12)]">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search videos and prompts..."
                    className="h-14 w-full rounded-2xl border border-violet-200 bg-white pl-14 pr-4 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                  />
                </div>
                <div className="inline-flex h-14 items-center justify-center rounded-2xl border border-violet-200 bg-white px-5 text-sm font-semibold text-violet-700">
                  {visiblePrompts.length} prompt{visiblePrompts.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeCategory === category
                        ? "border-violet-500 bg-violet-500 text-white shadow-[0_10px_24px_rgba(139,92,246,0.22)]"
                        : "border-violet-200 bg-white/90 text-slate-700 hover:border-violet-300 hover:text-violet-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-500">
              {visiblePrompts.length} prompt{visiblePrompts.length === 1 ? "" : "s"} available
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="h-8 w-24 rounded-full bg-slate-100 animate-pulse" />
                  <div className="mt-4 h-16 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="mt-3 h-20 rounded-2xl bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : visiblePrompts.length === 0 ? (
            <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-semibold">No prompts found</p>
              <p className="mt-2 text-sm text-slate-500">Try another search or filter combination.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {visiblePrompts.map((item) => (
                <article
                  key={item.id}
                  className="group flex h-full min-h-[21rem] flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.1)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                        {item.category}
                      </span>
                    </div>
                    <button
                      onClick={() => copyPrompt(item)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
                      aria-label={`Copy ${item.title}`}
                    >
                      {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="mt-5 flex-1">
                    <Link to={`/prompt-library/${item.id}`} className="block">
                      <h2 className="line-clamp-2 min-h-[3.7rem] text-[1.6rem] font-semibold leading-[1.08] tracking-tight text-slate-900 transition group-hover:text-violet-700">
                        {item.title}
                      </h2>
                      <p className="mt-3 line-clamp-4 min-h-[7rem] text-sm leading-7 text-slate-600">
                        {item.description || getPromptExcerpt(item.prompt_text, 120)}
                      </p>
                    </Link>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                        {formatDifficulty(item.difficulty)}
                      </span>
                      {item.tags.slice(0, 1).map((tag) => (
                        <span key={`${item.id}-${tag}`} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={`/prompt-library/${item.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-800"
                    >
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
