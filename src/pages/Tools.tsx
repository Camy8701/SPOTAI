import { Link } from "react-router-dom";
import { ArrowRight, Calculator, FileType2, Files, Stamp, Type } from "lucide-react";
import Layout from "@/components/layout/Layout";

const tools = [
  {
    name: "Tip Calculator",
    description: "Split bills fast, adjust service quality, and get clean totals per person.",
    path: "/tip-calculator",
    icon: Calculator,
    accent: "from-emerald-500 via-teal-500 to-cyan-500",
    surface: "from-emerald-50 to-cyan-50",
  },
  {
    name: "Character Counter",
    description: "Count characters, words, reading time, and audio duration in one workspace.",
    path: "/character-counter",
    icon: Type,
    accent: "from-indigo-500 via-violet-500 to-fuchsia-500",
    surface: "from-indigo-50 to-fuchsia-50",
  },
  {
    name: "File Converter",
    description: "Convert common file types without leaving the SpotAI tool stack.",
    path: "/file-converter",
    icon: Files,
    accent: "from-orange-500 via-amber-500 to-yellow-500",
    surface: "from-orange-50 to-yellow-50",
  },
  {
    name: "PDF Brander",
    description: "Upload PDFs, add your logo, control placement, and export branded files in bulk.",
    path: "/pdf-brander",
    icon: Stamp,
    accent: "from-rose-500 via-orange-500 to-amber-500",
    surface: "from-rose-50 to-amber-50",
  },
];

const Tools = () => {
  return (
    <Layout>
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_35%),linear-gradient(180deg,#f8fbff_0%,#ffffff_60%)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground shadow-sm">
              <FileType2 className="h-3.5 w-3.5 text-[hsl(var(--spotai-blue))]" />
              SpotAI Utilities
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              All tools in one place.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Open the calculators, counters, converters, and PDF brander from a single tools hub instead of hunting through the app.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-10 sm:py-12">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {tools.map((tool) => (
            <article
              key={tool.name}
              className={`overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br ${tool.surface} p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]`}
            >
              <div className="flex h-full flex-col">
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.accent} text-white shadow-lg`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">{tool.name}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground sm:text-base">
                  {tool.description}
                </p>
                <Link
                  to={tool.path}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-92"
                >
                  Open tool
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Tools;
