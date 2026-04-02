import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BookOpen, Download, Headphones, Search } from "lucide-react";
import { digitalProducts } from "@/data/digital-products";
import { getFreebieVisibility, getFreebieVisibilityMap } from "@/lib/freebie-visibility";

export default function EbooksLibrary() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibilityMap, setVisibilityMap] = useState<Record<string, { marketplace: boolean; ebooks: boolean; homepage: boolean }>>({});

  useEffect(() => {
    setVisibilityMap(getFreebieVisibilityMap());
  }, []);

  useEffect(() => {
    supabase
      .from("freebies")
      .select("*")
      .eq("type", "ebook")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setEbooks(data);
          const cats = [...new Set(data.map((item) => item.category).filter(Boolean))] as string[];
          setCategories(cats);
        }
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return ebooks.filter((ebook) => {
      const visibility = getFreebieVisibility(ebook, visibilityMap);
      if (!visibility.ebooks) return false;
      const matchSearch =
        ebook.title.toLowerCase().includes(search.toLowerCase()) ||
        (ebook.description || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "all" || category === "free" || ebook.category === category;
      return matchSearch && matchCat;
    });
  }, [ebooks, search, category, visibilityMap]);

  const marketplaceCollection = useMemo(() => {
    return digitalProducts.filter((item) => {
      const text = `${item.title} ${item.subtitle} ${item.summary} ${item.tag} ${item.keywords.join(" ")}`.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const normalizedCategory = category.toLowerCase();
      const matchCat =
        category === "all" ||
        category === "free" ||
        item.tag.toLowerCase().includes(normalizedCategory) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedCategory));
      return matchSearch && matchCat;
    });
  }, [search, category]);

  const featured = filtered[0];
  const cards = filtered.slice(1);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700/75">
                Explore all ebooks
              </span>
            </div>

            <div className="text-center">
              <h1 className="text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Ebooks Library
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Curated reading library
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ebooks"
                  className="h-12 w-full rounded-full border border-input bg-background px-5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setCategory("all")}
                  className={`h-10 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                    category === "all"
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-input text-muted-foreground hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCategory("free")}
                  className={`h-10 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                    category === "free"
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-input text-muted-foreground hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  Free
                </button>
                {categories.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`h-10 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                      category === cat
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-input text-muted-foreground hover:border-blue-400 hover:text-blue-600"
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
              Loading ebooks...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[2rem] border border-border bg-card px-8 py-16 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <p className="text-xl font-semibold">No ebooks found</p>
              <p className="mt-2 text-muted-foreground">Try another search or category.</p>
            </div>
          ) : (
            <>
              {featured ? (
                <div className="grid overflow-hidden rounded-[2rem] border border-[#d6e2ff] bg-card dark:border-blue-500/15 lg:grid-cols-2">
                  <div className="min-h-[380px] bg-[#eef3ff] dark:bg-[#0f1627]">
                    {featured.cover_image ? (
                      <img
                        src={featured.cover_image}
                        alt={featured.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-16 w-16 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center px-8 py-10 text-center">
                    <span className="rounded-full border border-blue-200 bg-blue-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                      {featured.category || "Ebook"}
                    </span>
                    <h2 className="mt-5 text-4xl leading-tight tracking-tight text-foreground" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                      {featured.title}
                    </h2>
                    <p className="mt-4 max-w-md text-muted-foreground">{featured.description || "A featured ebook from the SPOTAI freebies library."}</p>
                    <div className="mt-7 flex items-center gap-3">
                      <a
                        href={featured.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center rounded-full border border-blue-600 bg-blue-600 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-blue-700"
                      >
                        Read
                      </a>
                      <a
                        href={featured.file_url}
                        download
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-blue-300 text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/25 dark:text-blue-200 dark:hover:bg-blue-500/10"
                        aria-label={`Download ${featured.title}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {featured.audio_url ? (
                        <a
                          href={featured.audio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 items-center rounded-full border border-blue-300 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/25 dark:text-blue-200 dark:hover:bg-blue-500/10"
                        >
                          <Headphones className="mr-2 h-4 w-4" />
                          Listen
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

                {cards.length > 0 ? (
                  <div className="mt-12">
                    <h3 className="text-4xl leading-none tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                      Featured Ebooks
                    </h3>
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {cards.map((ebook) => (
                      <article key={ebook.id} className="overflow-hidden rounded-[1.7rem] border border-[#d6e2ff] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.05)] dark:border-blue-500/15 dark:bg-[#0f1728]">
                        <div className="h-56 overflow-hidden">
                          {ebook.cover_image ? (
                            <img src={ebook.cover_image} alt={ebook.title} className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen className="h-14 w-14 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                            {ebook.category || "Ebook"}
                          </span>
                          <h4 className="mt-3 text-2xl leading-tight text-foreground" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                            {ebook.title}
                          </h4>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {ebook.description || "Free resource from the SPOTAI library."}
                          </p>
                          <div className="mt-5 flex items-center gap-3">
                            <a
                              href={ebook.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-10 items-center rounded-full border border-blue-300 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/25 dark:text-blue-200 dark:hover:bg-blue-500/10"
                            >
                              Open
                            </a>
                            <a
                              href={ebook.file_url}
                              download
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-300 text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/25 dark:text-blue-200 dark:hover:bg-blue-500/10"
                              aria-label={`Download ${ebook.title}`}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            {ebook.audio_url ? (
                              <a
                                href={ebook.audio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-10 items-center rounded-full border border-blue-300 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/25 dark:text-blue-200 dark:hover:bg-blue-500/10"
                              >
                                <Headphones className="mr-2 h-4 w-4" />
                                Listen
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {marketplaceCollection.length > 0 ? (
                <div className="mt-12">
                  <h3 className="text-4xl leading-none tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                    Marketplace Collection
                  </h3>
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {marketplaceCollection.map((item) => (
                      <article key={item.id} className="overflow-hidden rounded-[1.7rem] border border-[#d6e2ff] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.05)] dark:border-blue-500/15 dark:bg-[#0f1728]">
                        <div className="h-56 overflow-hidden">
                          <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <div className="p-5">
                          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                            {item.tag}
                          </span>
                          <h4 className="mt-3 text-2xl leading-tight text-foreground" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                            {item.title}
                          </h4>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {item.subtitle}
                          </p>
                          <div className="mt-5 flex items-center gap-3">
                            <Link
                              to={`/marketplace/${item.slug}`}
                              className="inline-flex h-10 items-center rounded-full border border-blue-300 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/25 dark:text-blue-200 dark:hover:bg-blue-500/10"
                            >
                              Open
                            </Link>
                            <a
                              href={item.fileUrl || "#"}
                              download={Boolean(item.fileUrl)}
                              onClick={(event) => {
                                if (!item.fileUrl) event.preventDefault();
                              }}
                              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                                item.fileUrl
                                  ? "border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-500/25 dark:text-blue-200 dark:hover:bg-blue-500/10"
                                  : "cursor-not-allowed border-border text-muted-foreground"
                              }`}
                              aria-label={`Download ${item.title}`}
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
