import { DESIGNER_PORTFOLIO_TEMPLATE_CODE } from "@/data/template-sources/designer-portfolio";
import { FORGE_TRAINING_TEMPLATE_CODE } from "@/data/template-sources/forge-training";
import type { WebsiteTemplateAccess } from "@/lib/website-template-access";

export type WebsiteTemplateDevice = "desktop" | "tablet" | "mobile";

export type WebsiteTemplate = {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  summary: string;
  author: string;
  authorBadge?: string;
  viewsLabel: string;
  remixLabel: string;
  previewLabel: string;
  code: string;
  access: WebsiteTemplateAccess;
  tags: string[];
};

export const websiteTemplates: WebsiteTemplate[] = [
  {
    id: "tpl-designer-portfolio",
    slug: "designer-portfolio-template",
    title: "Designer Portfolio Website Template",
    category: "Landing Page",
    shortDescription: "A bold purple designer portfolio with immersive hero typography, layered case-study blocks, and premium agency-style sections.",
    summary: "A cinematic UI/UX portfolio template with a dominant editorial hero, testimonial walls, service showcases, and a contact system designed for product designers and creative studios.",
    author: "Meng To",
    authorBadge: "Pro",
    viewsLabel: "3.4k views",
    remixLabel: "102 remixes",
    previewLabel: "ui-ux-designer.aura.build",
    code: DESIGNER_PORTFOLIO_TEMPLATE_CODE,
    access: "free",
    tags: ["portfolio", "designer", "landing page", "purple", "creative", "agency"],
  },
  {
    id: "tpl-forge-training",
    slug: "forge-training-template",
    title: "Forge Training Website Template",
    category: "Landing Page",
    shortDescription:
      "A dark cinematic fitness landing page with high-impact hero copy, coach cards, program blocks, and premium performance-tech sections.",
    summary:
      "A polished athletic brand template built around immersive photography, glassy interface treatments, coach showcases, training-program modules, and performance-driven messaging for fitness, sports, and coaching products.",
    author: "SPOTAI Studio",
    authorBadge: "Pro",
    viewsLabel: "New template",
    remixLabel: "0 remixes",
    previewLabel: "forge-training.aura.build",
    code: FORGE_TRAINING_TEMPLATE_CODE,
    access: "free",
    tags: ["fitness", "sports", "training", "coaching", "dark", "landing page"],
  },
];

export const getWebsiteTemplateBySlug = (slug: string) =>
  websiteTemplates.find((template) => template.slug === slug);
