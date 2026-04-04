import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Crown, FileCode2, Sparkles } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { getWebsiteTemplateBySlug } from "@/data/website-templates";
import { getWebsiteTemplateAccess, getWebsiteTemplateAccessMap } from "@/lib/website-template-access";
import { copyTemplateCode } from "@/lib/template-preview";

const MarketplaceTemplateCode = () => {
  const { slug = "" } = useParams();
  const template = getWebsiteTemplateBySlug(slug);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [access, setAccess] = useState(template ? getWebsiteTemplateAccess(template) : "free");

  useEffect(() => {
    if (!template) return;
    const sync = () => setAccess(getWebsiteTemplateAccess(template, getWebsiteTemplateAccessMap()));
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [template]);

  if (!template) {
    return (
      <Layout>
        <div className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card p-10 text-center">
            <h1 className="text-4xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
              Code page unavailable
            </h1>
            <p className="mt-3 text-muted-foreground">The website template you requested is missing.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isPaid = access === "paid";

  const handleCopy = async () => {
    try {
      await copyTemplateCode(template.code);
      setCopied(true);
      toast({ title: "Code copied", description: "The full template HTML is now on your clipboard." });
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      toast({ title: "Copy failed", description: "The template code could not be copied.", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f6f7fb] text-slate-950">
        <section className="border-b border-black/6 bg-[radial-gradient(circle_at_top_left,#ede9fe,transparent_30%),linear-gradient(180deg,#ffffff,#fbfcff)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
            <div>
              <Link
                to={`/marketplace/templates/${template.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-violet-300 hover:text-violet-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to template
              </Link>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{template.title} Code</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                This is the exact HTML source for the template. Copy it as-is, then paste it into your coding assistant or development workflow.
              </p>
            </div>

            {isPaid ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                <Crown className="h-4 w-4" />
                Paid template
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {isPaid ? (
            <div className="rounded-[2rem] border border-amber-200 bg-white p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Code is locked</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                This template is currently marked as paid in the admin controls, so the raw code cannot be copied from this page.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <div className="border-b border-black/8 bg-[linear-gradient(135deg,#f5f3ff,#ffffff_52%,#eef2ff)] px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Exact template HTML</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      No abstraction layer. No transformed export. This is the raw source you can copy and use directly.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <FileCode2 className="h-3.5 w-3.5" />
                    Source of truth
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-black/8 bg-[#fbfcff] px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Use it for</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">Exact replication in Codex, Claude Code, Manus AI, or your own project</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-violet-100 bg-violet-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                      <p className="text-sm leading-7 text-violet-900">
                        Copy the code exactly first. If you want design changes, ask your AI tool to remix after it has recreated the original structure.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-[#fcfcfe] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#d6d8dd]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#d6d8dd]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#d6d8dd]" />
                    </div>
                  </div>

                  <pre className="max-h-[72vh] overflow-auto bg-[#fcfcfe] p-6 text-sm leading-7 text-slate-700">
                    <code>{template.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default MarketplaceTemplateCode;
