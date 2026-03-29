import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Search, Flame, Compass, Clock3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type SortMode = "popular" | "explore" | "recent";

export default function ImageLibrary() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeOrientation, setActiveOrientation] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("explore");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("image_library_items")
        .select("*")
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });

      setItems(data || []);
      setLoading(false);
    };

    load();
  }, []);

  const categories = useMemo(() => {
    const all = new Set<string>();
    items.forEach((item) => {
      if (item.category) all.add(item.category);
    });
    return ["all", ...Array.from(all)];
  }, [items]);

  const visibleItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const keyword = `${item.title} ${item.description || ""} ${item.category || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
      const matchesSearch = keyword.includes(search.toLowerCase());
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const orientation = item.orientation || "landscape";
      const matchesOrientation = activeOrientation === "all" || orientation === activeOrientation;
      return matchesSearch && matchesCategory && matchesOrientation;
    });

    if (sortMode === "popular") {
      return filtered.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
    }
    if (sortMode === "explore") {
      return filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activeCategory, activeOrientation, items, search, sortMode]);

  const sortButtons = [
    { key: "popular" as const, label: "Popular", icon: Flame },
    { key: "explore" as const, label: "Explore", icon: Compass },
    { key: "recent" as const, label: "Recent", icon: Clock3 },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-sky-200 bg-[linear-gradient(180deg,#f1f8ff_0%,#e8f4ff_100%)] p-4 text-slate-900 shadow-[0_22px_40px_rgba(14,116,144,0.12)] sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${items.length.toLocaleString()} assets...`}
                    className="h-11 w-full rounded-xl border border-sky-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {sortButtons.map((button) => (
                    <button
                      key={button.key}
                      onClick={() => setSortMode(button.key)}
                      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                        sortMode === button.key
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-sky-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                      }`}
                    >
                      <button.icon className="h-3.5 w-3.5" />
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${
                      activeCategory === category
                        ? "border-sky-500 bg-sky-500 text-white"
                        : "border-sky-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {["all", "landscape", "portrait", "square"].map((orientation) => (
              <button
                key={orientation}
                onClick={() => setActiveOrientation(orientation)}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  activeOrientation === orientation
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-input bg-card text-muted-foreground hover:border-sky-300 hover:text-sky-700"
                }`}
              >
                {orientation}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="mb-4 h-64 break-inside-avoid rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="text-lg font-semibold">No images found</p>
              <p className="mt-2 text-sm text-muted-foreground">Try another search, category, or orientation.</p>
            </div>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-4 [column-fill:_balance]">
              {visibleItems.map((item) => (
                <article key={item.id} className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                  <img
                    src={item.thumbnail_url || item.image_url}
                    alt={item.title}
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="space-y-2 p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.category ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                          {item.category}
                        </span>
                      ) : null}
                      {(item.tags || []).slice(0, 2).map((tag: string) => (
                        <span key={`${item.id}-${tag}`} className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
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
