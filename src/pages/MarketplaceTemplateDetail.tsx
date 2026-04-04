import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Code2, Crown, ExternalLink, Layers3 } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { TemplatePreviewFrame } from "@/components/marketplace/template-preview-frame";
import { Button } from "@/components/ui/button";
import { getWebsiteTemplateBySlug } from "@/data/website-templates";
import type { WebsiteTemplateDevice } from "@/data/website-templates";
import { getWebsiteTemplateAccess, getWebsiteTemplateAccessMap } from "@/lib/website-template-access";
import { openTemplateInNewTab } from "@/lib/template-preview";

const MarketplaceTemplateDetail = () => {
  const { slug = "" } = useParams();
  const template = getWebsiteTemplateBySlug(slug);
  const [device, setDevice] = useState<WebsiteTemplateDevice>("desktop");
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
              Template not found
            </h1>
            <p className="mt-3 text-muted-foreground">The website template you requested is missing.</p>
            <div className="mt-7 flex justify-center">
              <Button asChild className="rounded-full">
                <Link to="/marketplace?mode=templates">Back to templates</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isPaid = access === "paid";

  return (
    <Layout>
      <div className="min-h-screen bg-[#f6f7fb] text-slate-950">
        <section className="border-b border-black/6 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link
                  to="/marketplace?mode=templates"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-violet-300 hover:text-violet-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to templates
                </Link>

                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                  {template.title}
                </h1>
                <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-500">{template.shortDescription}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <TemplatePreviewFrame
            code={template.code}
            title={template.title}
            previewLabel={template.previewLabel}
            device={device}
            onDeviceChange={setDevice}
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isPaid}
                  onClick={() => openTemplateInNewTab(template.code)}
                  className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                    isPaid
                      ? "cursor-not-allowed bg-slate-100 text-slate-400"
                      : "bg-white text-slate-900 shadow-sm ring-1 ring-black/8 hover:bg-slate-50"
                  }`}
                >
                  {isPaid ? <Crown className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                  Preview Full
                </button>
                <Link
                  to={isPaid ? "#" : `/marketplace/templates/${template.slug}/code`}
                  onClick={(event) => {
                    if (isPaid) event.preventDefault();
                  }}
                  className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                    isPaid
                      ? "cursor-not-allowed bg-slate-100 text-slate-400"
                      : "bg-[#111111] text-white hover:bg-black"
                  }`}
                >
                  {isPaid ? <Crown className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                  View Code
                </Link>
              </div>
            }
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,20rem]">
            <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">Template overview</p>
              <p className="mt-4 text-lg leading-8 text-slate-600">{template.shortDescription}</p>
              <p className="mt-4 text-base leading-8 text-slate-500">{template.summary}</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Template access</p>
                    <p className="text-sm text-slate-500">{isPaid ? "Paid" : "Free"}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-500">
                  {isPaid
                    ? "This template can be previewed inside the marketplace, but full live preview and code access are locked until it is marked free."
                    : "This template is currently free, so full live preview and code copy are both enabled."}
                </p>
              </div>

              <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Included tags</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/8 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default MarketplaceTemplateDetail;
