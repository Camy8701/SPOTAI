import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Files, Search, Stamp, Type } from "lucide-react";
import Layout from "@/components/layout/Layout";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";

const tools = [
  {
    name: "Tip Calculator",
    description: "Split bills fast, adjust service quality, and get clean totals per person.",
    path: "/tip-calculator",
    icon: Calculator,
    tag: "Calculators",
    accent: "from-emerald-500 via-teal-500 to-cyan-500",
    surface: "from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/20",
    border: "border-emerald-100/80 dark:border-emerald-500/15",
  },
  {
    name: "Character Counter",
    description: "Count characters, words, reading time, and audio duration in one workspace.",
    path: "/character-counter",
    icon: Type,
    tag: "Writing",
    accent: "from-indigo-500 via-violet-500 to-fuchsia-500",
    surface: "from-indigo-50 to-fuchsia-50 dark:from-indigo-950/30 dark:to-fuchsia-950/20",
    border: "border-indigo-100/80 dark:border-indigo-500/15",
  },
  {
    name: "File Converter",
    description: "Convert common file types without leaving the SpotAI tool stack.",
    path: "/file-converter",
    icon: Files,
    tag: "Converters",
    accent: "from-orange-500 via-amber-500 to-yellow-500",
    surface: "from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-amber-950/20",
    border: "border-orange-100/80 dark:border-orange-500/15",
  },
  {
    name: "PDF Brander",
    description: "Upload PDFs, add your logo, control placement, and export branded files in bulk.",
    path: "/pdf-brander",
    icon: Stamp,
    tag: "Branding",
    accent: "from-rose-500 via-orange-500 to-amber-500",
    surface: "from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-orange-950/20",
    border: "border-rose-100/80 dark:border-rose-500/15",
  },
];

const filterTabs = ["All", "Calculators", "Writing", "Converters", "Branding"];
const headerBackClassName =
  "border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 hover:border-cyan-300 hover:text-cyan-800";

const Tools = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesTab = activeTab === "All" || tool.tag === activeTab;
      const keyword = `${tool.name} ${tool.description} ${tool.tag}`.toLowerCase();
      const matchesSearch = keyword.includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title="Tools"
          subtitle="Practical utilities for everyday work"
          topLabel="Explore all tools"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-cyan-700/75"
        >
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools"
                className="h-12 w-full rounded-full border border-input bg-background px-5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-10 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                    activeTab === tab
                      ? "border-cyan-500 bg-cyan-500 text-white"
                      : "border-input text-muted-foreground hover:border-cyan-400 hover:text-cyan-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </CatalogHeroHeader>

        <section className="bg-background py-10 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {filteredTools.length === 0 ? (
              <div className="rounded-[2rem] border border-border bg-card px-8 py-16 text-center">
                <p className="text-lg font-medium text-foreground">No tools matched your search.</p>
                <p className="mt-2 text-sm text-muted-foreground">Try a broader keyword or switch filters.</p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {filteredTools.map((tool) => (
                  <article
                    key={tool.name}
                    className={`overflow-hidden rounded-[28px] border bg-gradient-to-br ${tool.surface} ${tool.border} p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]`}
                  >
                    <div className="flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.accent} text-white shadow-lg`}>
                          <tool.icon className="h-6 w-6" />
                        </div>
                        <span className="rounded-full border border-white/50 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                          {tool.tag}
                        </span>
                      </div>
                      <h2 className="text-2xl font-semibold text-foreground">{tool.name}</h2>
                      <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground sm:text-base">
                        {tool.description}
                      </p>
                      <Link
                        to={tool.path}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-92 dark:bg-white dark:text-slate-950"
                      >
                        Open tool
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Tools;
