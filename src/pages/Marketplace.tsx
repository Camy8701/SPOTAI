import { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import ShowcaseCard from "@/components/ui/showcase-card";
import { Search } from "lucide-react";

const marketplaceItems = [
  {
    title: "Prompt Atlas Pro",
    subtitle: "Prompt packs, templates, workflows",
    tag: "Templates",
    image:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Creator Stack Kit",
    subtitle: "Brand kits, content systems, dashboards",
    tag: "Assets",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Agent Launch Playbook",
    subtitle: "Step-by-step growth and launch guides",
    tag: "Courses",
    image:
      "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Automation Bundle",
    subtitle: "No-code flows, scripts, and presets",
    tag: "AI Tools",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
  },
];

const filterTabs = ["All", "Templates", "Assets", "Courses", "AI Tools"];

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filteredItems = useMemo(() => {
    return marketplaceItems.filter((item) => {
      const matchesTab = activeTab === "All" || item.tag === activeTab;
      const keyword = `${item.title} ${item.subtitle} ${item.tag}`.toLowerCase();
      const matchesSearch = keyword.includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Marketplace
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Curated digital products for builders
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 md:flex-row">
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
                {filterTabs.map((tab) => (
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
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {filteredItems.length === 0 ? (
            <div className="rounded-[2rem] border border-border bg-card px-8 py-16 text-center">
              <p className="text-lg font-medium">No products matched your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              {filteredItems.map((item) => (
                <ShowcaseCard
                  key={item.title}
                  title={item.title}
                  subtitle={item.subtitle}
                  tag={item.tag}
                  image={item.image}
                  className="min-h-[32rem]"
                  imageClassName="h-[21rem]"
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
