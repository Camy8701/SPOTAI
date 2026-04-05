import { sanitizeSlug } from "@/lib/publishing";

export type PodcastEpisode = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  episodeLabel: string;
};

export type PodcastCollection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  summary: string;
  tagLabel: string;
  category: string;
  coverImage: string;
  keywords: string[];
  episodes: PodcastEpisode[];
};

type RemotePodcastLike = {
  id: string | number;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  cover_image?: string | null;
  file_url?: string | null;
};

const agencyScalingArtwork = "/images/podcasts/agency-scaling-systems.png";

export const bundledPodcastCollections: PodcastCollection[] = [
  {
    id: "pod-series-agency-scaling-systems",
    slug: "agency-scaling-systems",
    title: "Agency Scaling Systems",
    description:
      "Three episodes on founder dependency, operator traps, and the systems required to step out of delivery without breaking growth.",
    summary:
      "A tightly focused podcast series for agency founders who want to scale with cleaner operations, better delegation, and less day-to-day founder bottleneck. Each episode tackles a different failure point in agency growth and turns it into a systems conversation.",
    tagLabel: "Podcast Series",
    category: "Agency Systems",
    coverImage: agencyScalingArtwork,
    keywords: ["agency", "systems", "delegation", "operator trap", "scale", "founder"],
    episodes: [
      {
        id: "pod-agency-scaling-systems-ep-1",
        episodeLabel: "Episode 1",
        title: "Why Your Agency Can't Scale Without You",
        description:
          "A sharp breakdown of the dependency loops that keep agency founders trapped in delivery, approvals, and day-to-day firefighting.",
        fileUrl: "/podcasts/agency-scaling-systems/ep-1-why-your-agency-cant-scale-without-you.m4a",
      },
      {
        id: "pod-agency-scaling-systems-ep-2",
        episodeLabel: "Episode 2",
        title: "How to Escape the Operator Trap Without Burning Revenue",
        description:
          "Learn how to step out of the operator seat, protect revenue, and rebuild delivery around systems instead of founder over-involvement.",
        fileUrl: "/podcasts/agency-scaling-systems/ep-2-how-to-escape-the-operator-trap-without-burning-revenue.m4a",
      },
      {
        id: "pod-agency-scaling-systems-ep-3",
        episodeLabel: "Episode 3",
        title: "If You Can't Take a Week Off This Audit Explains It",
        description:
          "A systems-focused audit for founders who want to uncover the bottlenecks, handoff gaps, and hidden dependencies blocking real freedom.",
        fileUrl: "/podcasts/agency-scaling-systems/ep-3-if-you-cant-take-a-week-off-this-audit-explains-it.m4a",
      },
    ],
  },
];

export const mapRemotePodcastToCollection = (podcast: RemotePodcastLike): PodcastCollection | null => {
  if (!podcast.file_url || !podcast.title) return null;

  const category = podcast.category?.trim() || "Podcast";

  return {
    id: `pod-remote-${podcast.id}`,
    slug: sanitizeSlug(podcast.title),
    title: podcast.title,
    description: podcast.description || "Free audio resource from the SPOTAI library.",
    summary: podcast.description || "A podcast episode from the SPOTAI audio library.",
    tagLabel: "Podcast",
    category,
    coverImage: podcast.cover_image || "",
    keywords: [podcast.title, podcast.description || "", category].join(" ").toLowerCase().split(" "),
    episodes: [
      {
        id: `pod-remote-ep-${podcast.id}`,
        episodeLabel: "Episode 1",
        title: podcast.title,
        description: podcast.description || "Audio resource from the SPOTAI library.",
        fileUrl: podcast.file_url,
      },
    ],
  };
};

export const buildPodcastCollections = (remotePodcasts: RemotePodcastLike[] = []) => [
  ...bundledPodcastCollections,
  ...remotePodcasts
    .map(mapRemotePodcastToCollection)
    .filter((collection): collection is PodcastCollection => Boolean(collection)),
];

export const getBundledPodcastCollectionBySlug = (slug: string) =>
  bundledPodcastCollections.find((collection) => collection.slug === slug) || null;
