import { videoPrompts } from "@/data/loop-promptlibrary/prompts";
import { videos } from "@/data/loop-promptlibrary/videos";
import { Database } from "@/integrations/supabase/types";

type PromptLibraryRow = Database["public"]["Tables"]["prompt_library_items"]["Row"];

type PromptSource = "SpotAI" | "Loop" | "Metrics Mule";

export type PromptLibraryItem = {
  id: string;
  title: string;
  description: string | null;
  prompt_text: string;
  category: string;
  difficulty: string;
  model: string;
  tags: string[];
  is_featured: boolean;
  source: PromptSource;
  source_label: string;
  source_url?: string;
  connectors: string[];
  sort_order: number;
  created_at: string;
};

const METRICS_MULE_SOURCE_URL = "https://metricsmule.com/ai/realistic-ai-image-prompts/";

const PREFERRED_CATEGORY_ORDER = [
  "All",
  "Beginner",
  "AI Agents",
  "SaaS",
  "Automation",
  "Prompting",
  "Business",
  "AI Voice",
  "Video AI",
  "E-commerce",
  "Business Tools",
  "AI Chat",
  "AI",
  "AI Tools",
  "AI Integration",
  "Advanced",
  "Mobile",
  "AI Images",
];

const dedupe = (items: (string | null | undefined)[]) => {
  return Array.from(
    new Set(
      items
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item)),
    ),
  );
};

const formatLabel = (value: string | null | undefined, fallback = "Flexible") => {
  if (!value) return fallback;
  return value
    .split(/[-_\s/]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
};

const detectConnectors = (...segments: (string | null | undefined)[]) => {
  const haystack = segments.filter(Boolean).join(" ").toLowerCase();
  const connectorMatchers = [
    ["Lovable", /lovable/],
    ["Supabase", /supabase/],
    ["Apify", /apify/],
    ["Stripe", /stripe/],
    ["Zendesk", /zendesk/],
    ["Mem0", /mem0/],
    ["YouTube", /youtube/],
    ["Instagram", /instagram/],
    ["Shopify", /shopify/],
    ["Gmail", /gmail/],
    ["Slack", /slack/],
    ["Airtable", /airtable/],
    ["Midjourney", /midjourney/],
    ["Flux", /\bflux\b/],
    ["Leonardo AI", /leonardo/],
    ["OpenAI", /openai|chatgpt/],
    ["GitHub", /github/],
    ["Bitbucket", /bitbucket/],
    ["GitLab", /gitlab/],
  ] as const;

  return connectorMatchers
    .filter(([, matcher]) => matcher.test(haystack))
    .map(([label]) => label)
    .slice(0, 4);
};

const loopVideoById = Object.fromEntries(videos.map((video) => [video.id, video]));

const mapLoopDifficulty = (quality: string | null | undefined) => {
  const normalized = quality?.toLowerCase() ?? "";
  if (normalized.includes("advanced")) return "Advanced";
  if (normalized.includes("4k")) return "Intermediate";
  return "Beginner";
};

const normalizeDbPrompt = (item: PromptLibraryRow): PromptLibraryItem => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    prompt_text: item.prompt_text,
    category: item.category || "AI",
    difficulty: formatLabel(item.difficulty),
    model: item.model || "SpotAI",
    tags: item.tags || [],
    is_featured: item.is_featured,
    source: "SpotAI",
    source_label: "SpotAI library",
    source_url: undefined,
    connectors: detectConnectors(item.prompt_text, item.description, item.model, ...(item.tags || [])),
    sort_order: item.sort_order ?? 0,
    created_at: item.created_at,
  };
};

const loopPromptSeeds: PromptLibraryItem[] = videoPrompts.map((prompt) => {
  const video = loopVideoById[prompt.video_id];
  const description = prompt.note || prompt.context || video?.description || "Imported from the loop prompt library.";
  const titleSeed = `${video?.title || "Loop build"} ${prompt.title}`.toLowerCase();
  const shouldFeature =
    prompt.number === 1 ||
    titleSeed.includes("initial") ||
    titleSeed.includes("setup") ||
    titleSeed.includes("enable cloud");

  return {
    id: `loop-${prompt.id}`,
    title: prompt.title,
    description,
    prompt_text: prompt.prompt,
    category: video?.category || "AI",
    difficulty: mapLoopDifficulty(video?.quality || null),
    model: "Lovable",
    tags: dedupe([
      "Loop",
      video?.category,
      prompt.context ? "Context" : null,
      prompt.note ? "Workflow" : null,
    ]),
    is_featured: shouldFeature,
    source: "Loop",
    source_label: video?.title || "Loop prompt library",
    source_url:
      video?.video_id && video.video_id.length === 11 ? `https://www.youtube.com/watch?v=${video.video_id}` : undefined,
    connectors: detectConnectors(prompt.prompt, prompt.context, JSON.stringify(video?.external_resources || []), video?.title),
    sort_order: shouldFeature ? 80 - prompt.number : 30 - prompt.number,
    created_at: prompt.created_at,
  };
});

const metricsMuleSeeds: PromptLibraryItem[] = [
  {
    id: "metrics-space-pilot",
    title: "Photoreal Space Pilot Portrait",
    description: "A fashion-led sci-fi portrait designed for clean realism, strong lens metadata, and minimal neon contrast.",
    prompt_text:
      "Create a hyper-real portrait of a futuristic space pilot wearing dark visor sunglasses on a black backdrop with restrained neon lighting. Use an 85mm lens look at f/2.0, rich skin detail, believable reflections, documentary-grade sharpness, subtle imperfections, and a cinematic black studio atmosphere.",
    category: "AI Images",
    difficulty: "Intermediate",
    model: "Midjourney / Flux",
    tags: ["portrait", "cinematic", "sci-fi", "realism"],
    is_featured: true,
    source: "Metrics Mule",
    source_label: "Metrics Mule realism guide",
    source_url: METRICS_MULE_SOURCE_URL,
    connectors: ["Midjourney", "Flux", "Leonardo AI"],
    sort_order: 120,
    created_at: "2026-03-29T00:00:00.000Z",
  },
  {
    id: "metrics-raindrop-tokyo",
    title: "Tokyo Through a Raindrop",
    description: "A surreal but realistic city image framed through a single reflective raindrop over a neon street.",
    prompt_text:
      "Generate a first-person macro shot from the perspective of a falling raindrop above a neon Tokyo street at night. The city should appear upside down and warped inside the curved droplet surface, with realistic street glow, wet asphalt reflections, sharp environmental detail, and a strong sense of cinematic motion.",
    category: "AI Images",
    difficulty: "Advanced",
    model: "Midjourney / Flux",
    tags: ["macro", "city", "neon", "reflection"],
    is_featured: true,
    source: "Metrics Mule",
    source_label: "Metrics Mule realism guide",
    source_url: METRICS_MULE_SOURCE_URL,
    connectors: ["Midjourney", "Flux"],
    sort_order: 119,
    created_at: "2026-03-29T00:00:00.000Z",
  },
  {
    id: "metrics-imax-beauty",
    title: "IMAX Beauty With a City in the Iris",
    description: "A premium editorial beauty prompt that mixes fashion portraiture with large-format cinema realism.",
    prompt_text:
      "Create a close-up beauty portrait of a young fashion model with dark hair, green eyes, metallic eyeshadow, and soft curls. Inside each pupil, reveal a glowing future megacity. Render it like an IMAX-grade still using Sony Venice 2 and ARRI Alexa 65 references, cinematic falloff, halation, soft skin texture, and natural imperfections.",
    category: "AI Images",
    difficulty: "Advanced",
    model: "Midjourney / Flux",
    tags: ["editorial", "beauty", "imax", "fashion"],
    is_featured: true,
    source: "Metrics Mule",
    source_label: "Metrics Mule realism guide",
    source_url: METRICS_MULE_SOURCE_URL,
    connectors: ["Midjourney", "Flux", "Leonardo AI"],
    sort_order: 118,
    created_at: "2026-03-29T00:00:00.000Z",
  },
  {
    id: "metrics-miniature-mouth",
    title: "Miniature Future Inside a Smile",
    description: "A surreal prompt structure for product-style storytelling with symmetry and controlled whimsy.",
    prompt_text:
      "Create a surreal cinematic close-up of a woman's mouth, showing only the lower teeth like a white fence. Inside the open mouth, reveal a miniature future world beneath a blue sky with a distant megacity. Compose the frame symmetrically with pastel tones, soft depth of field, hyper-detailed textures, and a whimsical film-set mood.",
    category: "AI Images",
    difficulty: "Intermediate",
    model: "Midjourney / Flux",
    tags: ["surreal", "symmetry", "miniature", "cinematic"],
    is_featured: false,
    source: "Metrics Mule",
    source_label: "Metrics Mule realism guide",
    source_url: METRICS_MULE_SOURCE_URL,
    connectors: ["Midjourney", "Flux"],
    sort_order: 112,
    created_at: "2026-03-29T00:00:00.000Z",
  },
  {
    id: "metrics-documentary-booster",
    title: "Documentary Realism Booster",
    description: "A reusable meta-prompt for upgrading any subject into a sharper, more believable documentary image.",
    prompt_text:
      "Take the subject I provide and rewrite it as a documentary-grade realism prompt. Add only believable texture, natural imperfections, award-level photography cues, and one camera/lens reference. Favor grounded lighting, unedited RAW realism, and subtle human detail over glossy AI polish.",
    category: "Prompting",
    difficulty: "Intermediate",
    model: "ChatGPT / Claude",
    tags: ["generator", "realism", "photography"],
    is_featured: false,
    source: "Metrics Mule",
    source_label: "Metrics Mule realism guide",
    source_url: METRICS_MULE_SOURCE_URL,
    connectors: ["OpenAI"],
    sort_order: 111,
    created_at: "2026-03-29T00:00:00.000Z",
  },
  {
    id: "metrics-ultra-realism-generator",
    title: "Ultra Realism Prompt Generator",
    description: "A generator prompt that expands a bare subject into a polished photoreal image prompt with camera and lighting cues.",
    prompt_text:
      "You are an ultra-realism prompt generator. The user gives you only a subject. Expand it into a photoreal image prompt that adds grounded subject detail, 2 realism triggers, 2 camera or lens cues, one lighting setup, believable texture, and natural imperfections. Keep the final prompt tight, cinematic, and usable in Midjourney, Leonardo, or Flux.",
    category: "Prompting",
    difficulty: "Advanced",
    model: "ChatGPT / Claude",
    tags: ["generator", "images", "workflow"],
    is_featured: true,
    source: "Metrics Mule",
    source_label: "Metrics Mule realism guide",
    source_url: METRICS_MULE_SOURCE_URL,
    connectors: ["OpenAI", "Midjourney", "Flux"],
    sort_order: 117,
    created_at: "2026-03-29T00:00:00.000Z",
  },
  {
    id: "metrics-variation-engine",
    title: "Realism Variations Test Engine",
    description: "A compare-style generator that creates multiple realism-driven versions of the same image concept.",
    prompt_text:
      "You are a realism variation engine. Given one subject, generate 10 distinct photoreal image prompts. Each prompt must use a different realism trigger, 2 to 3 camera cues, one lighting setup, and a clear cinematic scene description. Optimize for variety without losing realism, texture, or physical believability.",
    category: "Prompting",
    difficulty: "Advanced",
    model: "ChatGPT / Claude",
    tags: ["generator", "comparison", "images"],
    is_featured: true,
    source: "Metrics Mule",
    source_label: "Metrics Mule realism guide",
    source_url: METRICS_MULE_SOURCE_URL,
    connectors: ["OpenAI", "Midjourney", "Flux"],
    sort_order: 116,
    created_at: "2026-03-29T00:00:00.000Z",
  },
  {
    id: "metrics-biotech-city",
    title: "Bioluminescent Vertical Forest City",
    description: "A worldbuilding prompt for a living skyscraper ecosystem rendered with grounded environmental realism.",
    prompt_text:
      "Render a vertical city grown from colossal bioluminescent trees, with living bridges made of ivy and bone-white wood connecting each tower. Make the architecture feel believable, the night lighting atmospheric, and the texture of bark, mist, and luminous leaves physically convincing. Treat it like a high-end environmental still rather than a fantasy matte painting.",
    category: "AI Images",
    difficulty: "Advanced",
    model: "Midjourney / Flux",
    tags: ["worldbuilding", "environment", "night", "bioluminescent"],
    is_featured: false,
    source: "Metrics Mule",
    source_label: "Metrics Mule realism guide",
    source_url: METRICS_MULE_SOURCE_URL,
    connectors: ["Midjourney", "Flux"],
    sort_order: 108,
    created_at: "2026-03-29T00:00:00.000Z",
  },
];

const seedPromptItems = [...metricsMuleSeeds, ...loopPromptSeeds];

export const mergePromptLibraryItems = (dbItems: PromptLibraryRow[] | null | undefined) => {
  const merged = new Map<string, PromptLibraryItem>();

  seedPromptItems.forEach((item) => merged.set(item.id, item));
  (dbItems || []).map(normalizeDbPrompt).forEach((item) => merged.set(item.id, item));

  return Array.from(merged.values()).sort((left, right) => {
    if (left.is_featured !== right.is_featured) return left.is_featured ? -1 : 1;
    if (left.sort_order !== right.sort_order) return right.sort_order - left.sort_order;
    return left.title.localeCompare(right.title);
  });
};

export const getPromptCategories = (items: PromptLibraryItem[]) => {
  const seen = new Set(items.map((item) => item.category));
  const ordered = PREFERRED_CATEGORY_ORDER.filter((category) => category === "All" || seen.has(category));
  const remaining = Array.from(seen)
    .filter((category) => !ordered.includes(category))
    .sort((left, right) => left.localeCompare(right));
  return ["All", ...ordered.filter((category) => category !== "All"), ...remaining];
};

export const getPromptExcerpt = (text: string, maxLength = 120) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
};

export const getPromptBlocks = (text: string) => {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  return blocks.length > 0 ? blocks : [text.trim()];
};

export const formatDifficulty = (difficulty: string | null | undefined) => {
  return formatLabel(difficulty);
};

export const getPromptMetrics = (item: Pick<PromptLibraryItem, "prompt_text" | "tags">) => {
  const words = item.prompt_text.trim().split(/\s+/).filter(Boolean).length;
  const sections = getPromptBlocks(item.prompt_text).length;
  return {
    words,
    sections,
    tags: item.tags.length,
  };
};

export const getPromptById = (items: PromptLibraryItem[], id: string) => {
  return items.find((item) => item.id === id) || null;
};

export const getRelatedPrompts = (items: PromptLibraryItem[], activeItem: PromptLibraryItem) => {
  return items
    .filter((item) => item.id !== activeItem.id)
    .sort((left, right) => {
      const leftScore = Number(left.category === activeItem.category) + Number(left.source === activeItem.source);
      const rightScore = Number(right.category === activeItem.category) + Number(right.source === activeItem.source);
      if (leftScore !== rightScore) return rightScore - leftScore;
      if (left.is_featured !== right.is_featured) return left.is_featured ? -1 : 1;
      return left.title.localeCompare(right.title);
    })
    .slice(0, 4);
};
