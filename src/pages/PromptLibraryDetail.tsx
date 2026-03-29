import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  PromptLibraryItem,
  formatDifficulty,
  getPromptBlocks,
  getPromptById,
  getPromptMetrics,
  getRelatedPrompts,
  mergePromptLibraryItems,
} from "@/lib/prompt-library";
import { supabase } from "@/integrations/supabase/client";

const PromptLibraryDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<PromptLibraryItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<PromptLibraryItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setItem(null);
        setRelatedItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from("prompt_library_items")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });

      const merged = mergePromptLibraryItems(data || []);
      const found = getPromptById(merged, id);
      setItem(found);
      setRelatedItems(found ? getRelatedPrompts(merged, found) : []);
      setLoading(false);
    };

    load();
  }, [id]);

  const promptBlocks = useMemo(() => (item ? getPromptBlocks(item.prompt_text) : []), [item]);
  const metrics = useMemo(() => (item ? getPromptMetrics(item) : null), [item]);

  const handleCopy = async () => {
    if (!item) return;

    await navigator.clipboard.writeText(item.prompt_text);
    setCopied(true);
    toast({ title: "Prompt copied", description: `"${item.title}" is ready to paste.` });
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white text-slate-900">
        <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6fbff_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Link to="/prompt-library" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to prompt library
            </Link>

            {loading ? (
              <div className="mt-8 h-32 rounded-[32px] bg-slate-100 animate-pulse" />
            ) : !item ? (
              <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-lg font-semibold">Prompt not found</p>
                <p className="mt-2 text-sm text-slate-500">This library entry is missing or no longer available.</p>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-4xl">
                  <h1 className="text-4xl tracking-tight text-slate-900 md:text-6xl" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                    {item.title}
                  </h1>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>Share this prompt</span>
                  <button className="rounded-full border border-slate-200 px-3 py-1.5 text-violet-700 transition hover:border-violet-300">X</button>
                  <button className="rounded-full border border-slate-200 px-3 py-1.5 text-violet-700 transition hover:border-violet-300">in</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {item ? (
          <>
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[2rem] font-semibold tracking-tight text-slate-900">{item.title} prompt</h2>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="mt-4 rounded-[26px] bg-[#f4efe4] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    {promptBlocks.map((block, index) => (
                      <p key={`${item.id}-block-${index}`} className={`${index > 0 ? "mt-5" : ""} whitespace-pre-wrap text-[1.1rem] leading-9 text-[#3d372f]`}>
                        {block}
                      </p>
                    ))}
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-medium text-slate-500">
                      Already building inside SpotAI? Copy this prompt and drop it into your workflow.
                    </p>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{item.title} description</h3>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                      {item.description || "A structured prompt entry curated for quick copying, adjustment, and reuse."}
                    </p>
                  </div>
                </div>

                <div className="border-l border-slate-200 pl-0 lg:pl-10">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">Suited for:</h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-700">{item.category}</span>
                        <span className="rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">{item.model}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">Connectors:</h4>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {item.connectors.length > 0 ? (
                          item.connectors.map((connector) => (
                            <span
                              key={`${item.id}-${connector}`}
                              className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_4px_12px_rgba(139,92,246,0.08)]"
                            >
                              {connector}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">No specific connectors attached.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">Prompt stats:</h4>
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Words</div>
                          <div className="mt-2 text-2xl font-semibold text-slate-900">{metrics?.words ?? 0}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Sections</div>
                          <div className="mt-2 text-2xl font-semibold text-slate-900">{metrics?.sections ?? 0}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Tags</div>
                          <div className="mt-2 text-2xl font-semibold text-slate-900">{metrics?.tags ?? 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] bg-[#9fd1ff] p-8 text-center shadow-[0_18px_40px_rgba(59,130,246,0.15)]">
                      <h4 className="text-[2rem] font-semibold leading-tight text-[#2c2cff]">Need more prompts like this?</h4>
                      <p className="mt-3 text-sm leading-7 text-[#31507a]">
                        Browse the library, copy the ones that fit your workflow, and keep building from the patterns that already work.
                      </p>
                      <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <Button onClick={handleCopy} className="rounded-full bg-[#d7ff3f] px-6 text-sm font-semibold text-slate-900 hover:bg-[#ebff86]">
                          {copied ? "Copied" : "Copy Prompt"}
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm leading-7 text-slate-500">
                      <div><span className="font-semibold text-slate-700">Difficulty:</span> {formatDifficulty(item.difficulty)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {relatedItems.length > 0 ? (
              <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                <h2 className="text-4xl tracking-tight text-slate-900" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  Other related prompts
                </h2>
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {relatedItems.map((related) => (
                    <Link key={related.id} to={`/prompt-library/${related.id}`} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-sm">
                      <h3 className="text-[1.75rem] font-semibold leading-[1.05] tracking-tight text-slate-900">{related.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{related.description}</p>
                      <div className="mt-6">
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{related.category}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </Layout>
  );
};

export default PromptLibraryDetail;
