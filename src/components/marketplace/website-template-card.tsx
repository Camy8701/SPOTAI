import { Crown, Eye } from "lucide-react";
import { Link } from "react-router-dom";

import { TemplatePreviewFrame } from "@/components/marketplace/template-preview-frame";
import type { WebsiteTemplate } from "@/data/website-templates";
import type { WebsiteTemplateAccess } from "@/lib/website-template-access";

type WebsiteTemplateCardProps = {
  template: WebsiteTemplate;
  access: WebsiteTemplateAccess;
};

export function WebsiteTemplateCard({ template, access }: WebsiteTemplateCardProps) {
  return (
    <Link
      to={`/marketplace/templates/${template.slug}`}
      className="group block rounded-[2rem] border border-black/8 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1"
    >
      <TemplatePreviewFrame
        code={template.code}
        title={template.title}
        previewLabel={template.previewLabel}
        device="desktop"
        compact
        interactive={false}
      />

      <div className="flex min-h-[11.5rem] flex-col justify-between px-2 pb-2 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">
            Website Template
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              access === "paid"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {access === "paid" ? "Paid" : "Free"}
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-slate-950">{template.title}</h3>
            <p className="mt-2 text-[0.98rem] leading-7 text-slate-600">{template.shortDescription}</p>
          </div>
          <span className="mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition-colors group-hover:bg-slate-950 group-hover:text-white">
            {access === "paid" ? <Crown className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </span>
        </div>
      </div>
    </Link>
  );
}
