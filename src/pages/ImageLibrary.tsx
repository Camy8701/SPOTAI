import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Search, Flame, Compass, Clock3, Download, X } from "lucide-react";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";
import { supabase } from "@/integrations/supabase/client";

type SortMode = "popular" | "explore" | "recent";
type DataSource = "supabase" | "local" | "none";

type ImageLibraryItem = {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  thumbnail_url?: string | null;
  category?: string | null;
  collection?: string | null;
  orientation?: string | null;
  tags?: string[] | null;
  is_featured?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
};

const headerBackClassName =
  "border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:border-sky-300 hover:text-sky-800";

export default function ImageLibrary() {
  const [items, setItems] = useState<ImageLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<DataSource>("none");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeOrientation, setActiveOrientation] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("explore");
  const [selectedItem, setSelectedItem] = useState<ImageLibraryItem | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let nextItems: ImageLibraryItem[] = [];
      let source: DataSource = "none";

      try {
        const { data, error } = await supabase
          .from("image_library_items")
          .select("*")
          .order("sort_order", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          nextItems = data as ImageLibraryItem[];
          source = "supabase";
        }
      } catch {
        // Uses local manifest fallback below when backend is unavailable.
      }

      if (nextItems.length === 0) {
        try {
          const response = await fetch("/images/original-library/manifest.json", { cache: "no-store" });
          if (response.ok) {
            const localItems = (await response.json()) as ImageLibraryItem[];
            if (Array.isArray(localItems) && localItems.length > 0) {
              nextItems = localItems;
              source = "local";
            }
          }
        } catch {
          // Keep empty state if local manifest is missing.
        }
      }

      setItems(nextItems);
      setDataSource(source);
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedItem(null);
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedItem]);

  const categories = useMemo(() => {
    const all = new Set<string>();
    items.forEach((item) => {
      if (item.category) all.add(item.category.toLowerCase());
    });
    return ["all", ...Array.from(all)];
  }, [items]);

  const visibleItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const keyword = `${item.title} ${item.description || ""} ${item.category || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
      const matchesSearch = keyword.includes(search.toLowerCase());
      const category = (item.category || "").toLowerCase();
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const orientation = `${item.orientation || "landscape"}`.toLowerCase();
      const matchesOrientation = activeOrientation === "all" || orientation === activeOrientation;
      return matchesSearch && matchesCategory && matchesOrientation;
    });

    if (sortMode === "popular") {
      return filtered.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
    }

    if (sortMode === "explore") {
      return filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [activeCategory, activeOrientation, items, search, sortMode]);

  const viewerTags = useMemo(() => {
    if (!selectedItem) return [];
    const tags = new Set<string>();
    (selectedItem.tags || []).forEach((tag) => tags.add(tag));
    if (selectedItem.category) tags.add(selectedItem.category);
    if (selectedItem.collection) tags.add(selectedItem.collection);
    if (selectedItem.orientation) tags.add(selectedItem.orientation);
    return Array.from(tags).slice(0, 10);
  }, [selectedItem]);

  const sortButtons = [
    { key: "popular" as const, label: "Popular", icon: Flame },
    { key: "explore" as const, label: "Explore", icon: Compass },
    { key: "recent" as const, label: "Recent", icon: Clock3 },
  ];

  const getQuickDescription = (item: ImageLibraryItem) => {
    const description = (item.description || "").trim();
    if (description.length > 0) return description;
    return "High-quality visual asset ready for posts, product pages, and creative campaigns.";
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title="Image Library"
          subtitle="Curated image assets for builders"
          topLabel="Explore all images"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-sky-700/75"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${items.length} assets...`}
                  className="h-12 w-full rounded-full border border-input bg-background px-5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-sky-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {sortButtons.map((button) => (
                  <button
                    key={button.key}
                    onClick={() => setSortMode(button.key)}
                    className={`inline-flex h-10 items-center gap-2 rounded-full border px-5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                      sortMode === button.key
                        ? "border-sky-500 bg-sky-500 text-white"
                        : "border-input text-muted-foreground hover:border-sky-400 hover:text-sky-600"
                    }`}
                  >
                    <button.icon className="h-3.5 w-3.5" />
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`h-10 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                    activeCategory === category
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-input text-muted-foreground hover:border-sky-400 hover:text-sky-600"
                  }`}
                >
                  {category}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <select
                  value={activeOrientation}
                  onChange={(event) => setActiveOrientation(event.target.value)}
                  className="h-10 rounded-full border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors hover:border-sky-300 focus:border-sky-500"
                >
                  <option value="all">All Ratios</option>
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                  <option value="square">Square</option>
                </select>
              </div>
            </div>
          </div>
        </CatalogHeroHeader>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {visibleItems.length} asset{visibleItems.length === 1 ? "" : "s"} found
            </p>
            {dataSource === "local" ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                Local Library Mode
              </span>
            ) : null}
          </div>

          {loading ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
              {Array.from({ length: 10 }).map((_, idx) => (
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
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="group relative mb-4 w-full break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_24px_rgba(15,23,42,0.08)] text-left"
                >
                  <img
                    src={item.thumbnail_url || item.image_url}
                    alt={item.title}
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedItem ? (
          <div
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="mx-auto flex h-full w-full max-w-[1480px] flex-col gap-3 p-3 lg:flex-row lg:gap-4 lg:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-700 bg-black/70">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="h-full w-full object-contain"
                />
              </div>

              <aside className="relative w-full rounded-2xl border border-slate-700 bg-[#0c1018] p-4 text-slate-100 lg:max-w-[360px]">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-[#111826] text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
                  aria-label="Close viewer"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="pr-10">
                  <h3 className="text-base font-semibold text-white">{selectedItem.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {getQuickDescription(selectedItem)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {viewerTags.map((tag) => (
                      <span
                        key={`${selectedItem.id}-${tag}`}
                        className="rounded-full border border-slate-600 bg-[#111826] px-2 py-0.5 text-[10px] font-medium text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={selectedItem.image_url}
                    download
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
                  >
                    <Download className="h-4 w-4" />
                    Download Image
                  </a>
                </div>
              </aside>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
