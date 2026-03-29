export type AdminPostKind = "blog_post" | "ai_story" | "news_article" | "ai_tool";

export type HomepagePlacementChoice =
  | "auto"
  | "dedicated_only"
  | "hero"
  | "featured_stories"
  | "featured_collections"
  | "best_ai_tools"
  | "news_articles";

export type PublicPostLike = {
  post_kind?: string | null;
  category?: string | null;
  homepage_section?: string | null;
  tags?: string[] | null;
  excerpt?: string | null;
  content?: string | null;
  title?: string | null;
};

type PostKindConfig = {
  label: string;
  description: string;
  category: "story" | "news" | "tutorial" | "review" | "opinion";
  defaultSection: Exclude<HomepagePlacementChoice, "auto" | "dedicated_only">;
  supportsAudio: boolean;
  homepageLabel: string;
};

export const ADMIN_POST_KIND_CONFIG: Record<AdminPostKind, PostKindConfig> = {
  blog_post: {
    label: "Blog post",
    description: "Long-form platform content, explainers, essays, or editorial updates.",
    category: "tutorial",
    defaultSection: "featured_collections",
    supportsAudio: true,
    homepageLabel: "Featured collections",
  },
  ai_story: {
    label: "AI story",
    description: "Fiction, narrative experiments, and story-driven content for the carousel strip.",
    category: "story",
    defaultSection: "featured_stories",
    supportsAudio: true,
    homepageLabel: "Featured AI fiction carousel",
  },
  news_article: {
    label: "News & article",
    description: "Breaking updates, explainers, and commentary for the editorial feed.",
    category: "news",
    defaultSection: "news_articles",
    supportsAudio: false,
    homepageLabel: "News & Articles",
  },
  ai_tool: {
    label: "AI tool post",
    description: "Reviews, tool breakdowns, and builder-focused recommendations.",
    category: "review",
    defaultSection: "best_ai_tools",
    supportsAudio: false,
    homepageLabel: "Best AI Tools",
  },
};

const DEFAULT_KIND: AdminPostKind = "blog_post";

const sanitize = (value?: string | null) => (value || "").trim().toLowerCase();

export const sanitizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const deriveExcerpt = (content: string, maxLength = 170) => {
  const collapsed = content.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) return collapsed;
  return `${collapsed.slice(0, maxLength).trimEnd()}...`;
};

export const inferPostKind = (post: PublicPostLike): AdminPostKind => {
  const explicitKind = sanitize(post.post_kind);
  if (explicitKind in ADMIN_POST_KIND_CONFIG) {
    return explicitKind as AdminPostKind;
  }

  const section = sanitize(post.homepage_section);
  const category = sanitize(post.category);
  const tags = (post.tags || []).map((tag) => sanitize(tag));

  if (section === "featured_stories" || category === "story" || tags.includes("ai-story")) {
    return "ai_story";
  }
  if (section === "news_articles" || category === "news" || tags.includes("news-article")) {
    return "news_article";
  }
  if (section === "best_ai_tools" || tags.includes("ai-tool")) {
    return "ai_tool";
  }

  return DEFAULT_KIND;
};

export const resolvePlacementChoice = (post: PublicPostLike): HomepagePlacementChoice => {
  const section = sanitize(post.homepage_section);

  if (!section) return "dedicated_only";
  if (section === "hero") return "hero";
  if (
    section === "featured_stories" ||
    section === "featured_collections" ||
    section === "best_ai_tools" ||
    section === "news_articles"
  ) {
    return section as HomepagePlacementChoice;
  }

  return "dedicated_only";
};

export const normalizeHomepagePlacement = (
  kind: AdminPostKind,
  choice: HomepagePlacementChoice,
): string | null => {
  if (choice === "dedicated_only") return null;
  if (choice === "hero") return "hero";
  if (choice === "auto") return ADMIN_POST_KIND_CONFIG[kind].defaultSection;

  const requested = choice;

  if (kind === "ai_story") {
    return requested === "featured_stories" || requested === "featured_collections"
      ? requested
      : ADMIN_POST_KIND_CONFIG[kind].defaultSection;
  }

  if (kind === "news_article") {
    return requested === "news_articles" ? requested : ADMIN_POST_KIND_CONFIG[kind].defaultSection;
  }

  if (kind === "ai_tool") {
    return requested === "best_ai_tools" ? requested : ADMIN_POST_KIND_CONFIG[kind].defaultSection;
  }

  return requested === "featured_collections" ? requested : ADMIN_POST_KIND_CONFIG[kind].defaultSection;
};

export const getPlacementOptions = (kind: AdminPostKind) => {
  const sharedOptions: Array<{ value: HomepagePlacementChoice; label: string; description: string }> = [
    {
      value: "auto",
      label: "Automatic",
      description: `Recommended for ${ADMIN_POST_KIND_CONFIG[kind].label.toLowerCase()} posts.`,
    },
    {
      value: "hero",
      label: "Main hero",
      description: "Place this item in the large homepage hero slot.",
    },
    {
      value: "dedicated_only",
      label: "Dedicated page only",
      description: "Keep it off the homepage and show it only in its full listing page.",
    },
  ];

  if (kind === "ai_story") {
    sharedOptions.splice(2, 0, {
      value: "featured_stories",
      label: "Carousel strip",
      description: "Send it to the featured AI fiction carousel.",
    });
    sharedOptions.splice(3, 0, {
      value: "featured_collections",
      label: "Featured collections",
      description: "Keep it in the larger story collection cards.",
    });
    return sharedOptions;
  }

  const defaultSection = ADMIN_POST_KIND_CONFIG[kind].defaultSection;

  sharedOptions.splice(2, 0, {
    value: defaultSection,
    label: ADMIN_POST_KIND_CONFIG[kind].homepageLabel,
    description: `Show it in the ${ADMIN_POST_KIND_CONFIG[kind].homepageLabel.toLowerCase()} homepage section.`,
  });

  return sharedOptions;
};

export const getResolvedPlacementLabel = (section: string | null, kind: AdminPostKind) => {
  if (!section) return "Dedicated page only";
  if (section === "hero") return "Homepage hero";
  if (section === "featured_stories") return "Featured AI fiction carousel";
  if (section === "featured_collections") return kind === "ai_story" ? "Featured collections" : "Featured collections section";
  if (section === "best_ai_tools") return "Best AI Tools section";
  if (section === "news_articles") return "News & Articles section";
  return "Dedicated page only";
};

export const shouldShowPostInLibrarySection = (
  post: PublicPostLike,
  section: string,
  category = "",
) => {
  const kind = inferPostKind(post);
  const normalizedSection = sanitize(section);
  const normalizedCategory = sanitize(category);
  const postCategory = sanitize(post.category);

  const matchesCategory = !normalizedCategory || postCategory === normalizedCategory;
  if (!matchesCategory) return false;

  if (normalizedSection === "all") return true;
  if (normalizedSection === "news_articles") {
    return kind === "news_article" || sanitize(post.homepage_section) === "news_articles";
  }
  if (normalizedSection === "best_ai_tools") {
    return kind === "ai_tool" || sanitize(post.homepage_section) === "best_ai_tools";
  }
  if (normalizedSection === "featured_stories") {
    return kind === "ai_story" || sanitize(post.homepage_section) === "featured_stories";
  }
  if (normalizedSection === "featured_collections") {
    return kind === "blog_post" || sanitize(post.homepage_section) === "featured_collections";
  }

  return postCategory === normalizedSection;
};
