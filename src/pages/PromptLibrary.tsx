import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Search, Sparkles, Copy, Check, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PromptLibrary() {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeModel, setActiveModel] = useState("all");
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
      setPrompts(data || []);
      setLoading(false);
    };

    load();
  }, []);

  const categories = useMemo(() => {
    const all = new Set<string>();
    prompts.forEach((item) => {
      if (item.category) all.add(item.category);
    });
    return ["all", ...Array.from(all)];
  }, [prompts]);

  const models = useMemo(() => {
    const all = new Set<string>();
    prompts.forEach((item) => {
      if (item.model) all.add(item.model);
    });
    return ["all", ...Array.from(all)];
  }, [prompts]);

  const visiblePrompts = useMemo(() => {
    return prompts.filter((item) => {
      const text = `${item.title} ${item.description || ""} ${item.prompt_text || ""} ${item.category || ""} ${item.model || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesModel = activeModel === "all" || item.model === activeModel;
      return matchesSearch && matchesCategory && matchesModel;
    });
  }, [activeCategory, activeModel, prompts, search]);

  const copyPrompt = async (item: any) => {
    await navigator.clipboard.writeText(item.prompt_text);
    setCopiedId(item.id);
    toast({ title: "Prompt copied", description: `"${item.title}" copied to clipboard.` });
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                <Sparkles className="h-4 w-4" />
                Prompt Hub
              </div>
              <h1 className="text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Prompt Library
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Curated prompts for creators and builders
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search prompts by title, use case, model..."
                  className="h-12 w-full rounded-full border border-input bg-background pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-violet-500"
                />
              </div>
              <div className="inline-flex h-12 items-center gap-2 rounded-full border border-input bg-background px-4 text-sm text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                {visiblePrompts.length} result{visiblePrompts.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                      activeCategory === category
                        ? "border-violet-500 bg-violet-500 text-white"
                        : "border-input bg-background text-muted-foreground hover:border-violet-300 hover:text-violet-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {models.map((model) => (
                  <button
                    key={model}
                    onClick={() => setActiveModel(model)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                      activeModel === model
                        ? "border-sky-500 bg-sky-500 text-white"
                        : "border-input bg-background text-muted-foreground hover:border-sky-300 hover:text-sky-700"
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-56 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : visiblePrompts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="text-lg font-semibold">No prompts found</p>
              <p className="mt-2 text-sm text-muted-foreground">Try another search or filter combination.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {visiblePrompts.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold leading-tight">{item.title}</h2>
                      {item.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      ) : null}
                    </div>
                    <button
                      onClick={() => copyPrompt(item)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:border-violet-300 hover:text-violet-700"
                      aria-label={`Copy ${item.title}`}
                    >
                      {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary p-3">
                    <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{item.prompt_text}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {item.category ? (
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700">
                        {item.category}
                      </span>
                    ) : null}
                    {item.model ? (
                      <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700">
                        {item.model}
                      </span>
                    ) : null}
                    {(item.tags || []).slice(0, 3).map((tag: string) => (
                      <span key={`${item.id}-${tag}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                        #{tag}
                      </span>
                    ))}
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
