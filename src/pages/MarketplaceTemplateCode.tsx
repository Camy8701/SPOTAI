import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Crown } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
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
      <div className="min-h-screen bg-[#0c0d10] text-white">
        <section className="border-b border-white/10 bg-[#101116]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
            <div>
              <Link
                to={`/marketplace/templates/${template.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to template
              </Link>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">{template.title} Code</h1>
            </div>

            {isPaid ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
                <Crown className="h-4 w-4" />
                Paid template
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {isPaid ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">Code is locked</h2>
              <p className="mt-3 text-sm leading-7 text-white/60">
                This template is currently marked as paid in the admin controls, so the raw code cannot be copied from this page.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#090a0d] shadow-[0_18px_60px_rgba(0,0,0,0.4)]">
              <div className="border-b border-white/10 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.2em] text-white/45">
                Exact template HTML
              </div>
              <pre className="max-h-[70vh] overflow-auto p-6 text-sm leading-7 text-[#d8dbe3]">
                <code>{template.code}</code>
              </pre>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default MarketplaceTemplateCode;
