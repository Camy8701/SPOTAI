import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import ShowcaseCard from "@/components/ui/showcase-card";
import { Search } from "lucide-react";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";
import { digitalProducts, marketplaceFilterTabs } from "@/data/digital-products";
import { supabase } from "@/integrations/supabase/client";
import { getFreebieVisibility, getFreebieVisibilityMap } from "@/lib/freebie-visibility";

const headerBackClassName =
  "border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 hover:border-amber-300 hover:text-amber-800";

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [freebies, setFreebies] = useState<any[]>([]);
  const [visibilityMap, setVisibilityMap] = useState<Record<string, { marketplace: boolean; ebooks: boolean; homepage: boolean }>>({});

  useEffect(() => {
    setVisibilityMap(getFreebieVisibilityMap());
    supabase
      .from("freebies")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setFreebies(data);
      });
  }, []);

  const filteredItems = useMemo(() => {
    const mappedFreebies = freebies
      .filter((item) => getFreebieVisibility(item, visibilityMap).marketplace)
      .map((item) => {
        const mappedTag = item.type === "podcast" ? "Assets" : "Courses";
        return {
          id: `freebie-${item.id}`,
          title: item.title,
          subtitle: item.description || "Digital resource from the freebie library.",
          tag: mappedTag,
          coverImage: item.cover_image || "/placeholder.svg",
          keywords: [item.type, item.category, item.title, item.description].filter(Boolean).join(" ").split(" "),
          href: item.file_url as string,
        };
      });

    const collection = [...digitalProducts, ...mappedFreebies];

    return collection.filter((item) => {
      const matchesTab = activeTab === "All" || item.tag === activeTab;
      const keyword = `${item.title} ${item.subtitle} ${item.tag} ${item.keywords.join(" ")}`.toLowerCase();
      const matchesSearch = keyword.includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, freebies, search, visibilityMap]);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title="Marketplace"
          subtitle="Curated digital products for builders"
          topLabel="Explore all products"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-amber-700/75"
        >
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search marketplace products"
                className="h-12 w-full rounded-full border border-input bg-background px-5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {marketplaceFilterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-10 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                    activeTab === tab
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-input text-muted-foreground hover:border-amber-400 hover:text-amber-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </CatalogHeroHeader>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {filteredItems.length === 0 ? (
            <div className="rounded-[2rem] border border-border bg-card px-8 py-16 text-center">
              <p className="text-lg font-medium">No products matched your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              {filteredItems.map((item) => (
                <ShowcaseCard
                  key={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  tag={item.tag}
                  image={item.coverImage}
                  to={"slug" in item && item.slug ? `/marketplace/${item.slug}` : undefined}
                  href={"href" in item ? item.href : undefined}
                  className="min-h-[32rem]"
                  imageClassName="h-[21rem] bg-[#eef3ff] dark:bg-[#0f1627]"
                  imageObjectClassName="object-contain p-3"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Marketplace;
