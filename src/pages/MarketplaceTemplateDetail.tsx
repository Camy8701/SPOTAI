import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bot, Clipboard, Code2, Compass, Crown, ExternalLink, Layers3, Sparkles } from "lucide-react";

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
  const howToUsePrompt = `I want you to recreate this website exactly from the HTML I paste below. Treat that HTML as the source of truth. Match the layout, styling, spacing, responsiveness, interactions, and overall visual behavior as closely as possible. Organize the result into clean production-ready files, and do not change the design unless I explicitly ask for a remix. The template HTML starts below:`;
  const remixPrompt = `Use this HTML as the design reference, but remix it for my project. Keep the same level of polish, responsiveness, layout quality, and premium feel. Replace the branding, color palette, copy, imagery, and sections so it fits my business, audience, and goals.`;

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
                <a
                  href="#how-to-use-template"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition-colors hover:border-violet-300 hover:bg-violet-100"
                >
                  <Compass className="h-4 w-4" />
                  How To Use
                </a>
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

          <section
            id="how-to-use-template"
            className="mt-6 overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
          >
            <div className="border-b border-black/8 bg-[radial-gradient(circle_at_top_left,#ede9fe,transparent_34%),radial-gradient(circle_at_top_right,#dbeafe,transparent_28%),linear-gradient(180deg,#ffffff,#fbfcff)] px-6 py-7 sm:px-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    How To Use This Template
                  </div>
                  <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.35rem]">
                    Use the exact code as your source, then let your AI tool replicate or remix the site cleanly.
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                    The fastest workflow is simple: copy the raw HTML, paste it into Codex, Claude Code, Manus AI, or another coding assistant, then tell the model whether you want an exact rebuild or a guided remix.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:w-[26rem]">
                  <div className="rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Best for</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">Exact website cloning</p>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Works with</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">Codex, Claude, Manus</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Use case</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">Clone first, remix later</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  {
                    icon: Clipboard,
                    title: "Step 1. Copy the template code",
                    description: isPaid
                      ? "If this template is marked paid, ask the admin to unlock it first. Once it is free, open View Code and copy the exact HTML."
                      : "Open View Code, then use the copy button to grab the full template HTML exactly as provided.",
                    accent: "border-violet-100 bg-violet-50 text-violet-700",
                  },
                  {
                    icon: Bot,
                    title: "Step 2. Paste it into your AI coding tool",
                    description:
                      "Create a new prompt in Codex, Claude Code, Manus AI, or another coding assistant, then paste the copied HTML directly into that prompt.",
                    accent: "border-sky-100 bg-sky-50 text-sky-700",
                  },
                  {
                    icon: Sparkles,
                    title: "Step 3. Tell the AI what you want",
                    description:
                      "Ask the AI to either recreate the website exactly or use it as a starting point and remix it around your brand, offer, audience, and preferred visual direction.",
                    accent: "border-emerald-100 bg-emerald-50 text-emerald-700",
                  },
                ].map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.title}
                      className="rounded-[1.6rem] border border-black/8 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${step.accent}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold leading-7 tracking-tight text-slate-950">{step.title}</h3>
                          <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="rounded-[1.7rem] border border-black/8 bg-[linear-gradient(180deg,#0f172a,#111827)] p-6 text-white shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200">Starter prompt</p>
                      <p className="mt-2 text-sm leading-7 text-white/70">
                        Paste this prompt first, then paste the copied template HTML directly below it in your AI tool.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                      <Bot className="h-3.5 w-3.5" />
                      Ready to send
                    </div>
                  </div>

                  <pre className="mt-5 overflow-auto whitespace-pre-wrap break-words rounded-[1.4rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-100">
                    <code>{howToUsePrompt}</code>
                  </pre>

                  <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white/70">
                    After this prompt, paste the full template code from the <span className="font-semibold text-white">View Code</span> page and send both together.
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.7rem] border border-black/8 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">If you want a remix</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Keep your instructions general but clear. Ask the AI to preserve the quality, responsiveness, and layout discipline, then adapt the visual identity and content to your project.
                    </p>

                    <div className="mt-4 space-y-3">
                      {[
                        "Keep the structure and polish you like from the original template.",
                        "Change branding, colors, copy, imagery, and sections to fit your business.",
                        "Add or remove blocks only if your product needs a different story flow.",
                      ].map((line, index) => (
                        <div key={line} className="flex items-start gap-3 rounded-2xl border border-black/6 bg-white px-4 py-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                            {index + 1}
                          </div>
                          <p className="text-sm leading-7 text-slate-600">{line}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.7rem] border border-violet-100 bg-[linear-gradient(180deg,#faf5ff,#f5f3ff)] p-6 shadow-[0_14px_30px_rgba(139,92,246,0.08)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-500">Remix prompt</p>
                    <pre className="mt-4 overflow-auto whitespace-pre-wrap break-words rounded-[1.2rem] border border-violet-200 bg-white/70 p-4 text-sm leading-7 text-violet-950">
                      <code>{remixPrompt}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </Layout>
  );
};

export default MarketplaceTemplateDetail;
