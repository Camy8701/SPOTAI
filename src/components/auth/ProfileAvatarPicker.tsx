import { Check, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, type Variants, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AvatarColorKey = "background" | "primary" | "secondary" | "feature";

export interface AvatarColors {
  background: string;
  primary: string;
  secondary: string;
  feature: string;
}

export interface AvatarSelection {
  avatarId: number;
  colors: AvatarColors;
}

interface AvatarTemplate {
  id: number;
  label: string;
  defaultColors: AvatarColors;
  render: (colors: AvatarColors) => string;
}

export interface ProfileAvatarPickerProps {
  value: AvatarSelection;
  onChange: (selection: AvatarSelection) => void;
  className?: string;
}

interface LegacyAvatarConfig {
  id: number;
  background: string;
  shape: string;
  accent: string;
  spark: string;
  eye: string;
  mouth: string;
  rotation: number;
  faceX: number;
  faceY: number;
  faceRotation: number;
  sparkleX: number;
  sparkleY: number;
  sparkleRadius: number;
}

const COLOR_SWATCHS = [
  "#0a0310",
  "#173b8f",
  "#1b7f68",
  "#4aa9ff",
  "#6f4ef6",
  "#89fcb3",
  "#d8fcb3",
  "#f6c945",
  "#ff005b",
  "#ff7d10",
  "#ff8f7a",
  "#ffd7b2",
];

const COLOR_FIELDS: Array<{ key: AvatarColorKey; label: string }> = [
  { key: "background", label: "Backdrop" },
  { key: "primary", label: "Shape" },
  { key: "secondary", label: "Accent" },
  { key: "feature", label: "Face" },
];

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const thumbnailVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: "easeOut" },
  },
};

const normalizeHexColor = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback.toUpperCase();

  const normalized = value.trim().replace("#", "");

  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    return `#${normalized
      .split("")
      .map((part) => part + part)
      .join("")
      .toUpperCase()}`;
  }

  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `#${normalized.toUpperCase()}`;
  }

  return fallback.toUpperCase();
};

const hexToRgbChannels = (hex: string) => {
  const normalized = normalizeHexColor(hex, "#111827").replace("#", "");
  const chunks = normalized.match(/.{1,2}/g);

  if (!chunks || chunks.length !== 3) {
    return "17, 24, 39";
  }

  const [r, g, b] = chunks.map((part) => Number.parseInt(part, 16));
  return `${r}, ${g}, ${b}`;
};

const serializeAvatarMetadata = (avatarId: number, colors: AvatarColors) =>
  `data-spotai-avatar="true" data-avatar-id="${avatarId}" data-color-background="${colors.background}" data-color-primary="${colors.primary}" data-color-secondary="${colors.secondary}" data-color-feature="${colors.feature}"`;

const createCircleClipId = (avatarId: number, colors: AvatarColors) =>
  `spotai-avatar-${avatarId}-${colors.background.slice(1)}-${colors.primary.slice(1)}-${colors.secondary.slice(1)}-${colors.feature.slice(1)}`;

const buildAvatarSvg = (selection: AvatarSelection) => {
  const template = getAvatarTemplate(selection.avatarId);
  const colors = normalizeAvatarColors(selection.colors, template.defaultColors);
  const clipId = createCircleClipId(template.id, colors);

  return `
    <svg
      aria-label="${template.label}"
      fill="none"
      height="36"
      role="img"
      viewBox="0 0 36 36"
      width="36"
      xmlns="http://www.w3.org/2000/svg"
      ${serializeAvatarMetadata(template.id, colors)}
    >
      <title>${template.label}</title>
      <defs>
        <clipPath id="${clipId}">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
      </defs>
      <g clip-path="url(#${clipId})">
        ${template.render(colors)}
      </g>
    </svg>
  `;
};

const AVATAR_TEMPLATES: AvatarTemplate[] = [
  {
    id: 1,
    label: "Neon Pop",
    defaultColors: {
      background: "#FF005B",
      primary: "#FFB238",
      secondary: "#FFE5C6",
      feature: "#0A0310",
    },
    render: (colors) => `
      <rect width="36" height="36" fill="${colors.background}" />
      <rect x="8" y="-2" width="28" height="28" rx="7" transform="rotate(28 18 18)" fill="${colors.primary}" />
      <path d="M2 29.5C7.5 24.5 12.75 22.5 18 24C23.5 25.7 29 22.8 34 16.8V36H2V29.5Z" fill="${colors.secondary}" opacity="0.9" />
      <g transform="translate(0 -1) rotate(8 18 18)">
        <rect x="10.2" y="13.2" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <rect x="23.8" y="13.2" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <path d="M14.6 19.2C16.5 20.7 19.5 20.7 21.4 19.2" stroke="${colors.feature}" stroke-linecap="round" stroke-width="1.5" />
      </g>
    `,
  },
  {
    id: 2,
    label: "Night Shift",
    defaultColors: {
      background: "#FF7D10",
      primary: "#0A0310",
      secondary: "#FFD7B2",
      feature: "#FFFFFF",
    },
    render: (colors) => `
      <rect width="36" height="36" fill="${colors.background}" />
      <rect x="2" y="0" width="34" height="34" rx="8" transform="rotate(55 18 18)" fill="${colors.primary}" />
      <circle cx="7.5" cy="28" r="5" fill="${colors.secondary}" opacity="0.85" />
      <path d="M26 3L28 7.3L32 9.2L28 11L26 15.2L24 11L20 9.2L24 7.3L26 3Z" fill="${colors.secondary}" opacity="0.85" />
      <g transform="translate(0 -1)">
        <rect x="13.7" y="13.6" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <rect x="20.5" y="13.6" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <path d="M14.4 20.7C16.4 21.6 19.6 21.6 21.6 20.7" stroke="${colors.feature}" stroke-linecap="round" stroke-width="1.4" />
      </g>
    `,
  },
  {
    id: 3,
    label: "Signal Bloom",
    defaultColors: {
      background: "#0A0310",
      primary: "#FF005B",
      secondary: "#FFC5DF",
      feature: "#FFFFFF",
    },
    render: (colors) => `
      <rect width="36" height="36" fill="${colors.background}" />
      <circle cx="21" cy="17" r="15" fill="${colors.primary}" />
      <path d="M0 23C6.5 18 12.5 17 18 18.5C23.5 20.3 29.5 18.2 36 11V36H0V23Z" fill="${colors.secondary}" opacity="0.9" />
      <g transform="translate(-1 2) rotate(7 18 18)">
        <rect x="12" y="11.6" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <rect x="22.2" y="11.6" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <path d="M13.6 18.7C15 21.4 21 21.4 22.4 18.7" fill="${colors.feature}" />
      </g>
    `,
  },
  {
    id: 4,
    label: "Mint Cloud",
    defaultColors: {
      background: "#D8FCB3",
      primary: "#89FCB3",
      secondary: "#EEFCE4",
      feature: "#0A0310",
    },
    render: (colors) => `
      <rect width="36" height="36" fill="${colors.background}" />
      <rect x="7" y="2" width="25" height="25" rx="8" transform="rotate(218 18 18)" fill="${colors.primary}" />
      <path d="M5 28C7 24.1 10.5 22 15.2 22C19.8 22 23.2 20.1 25.4 16.6C28.3 17.1 30.7 19.5 31 22.6C33 23.4 34.5 25.5 34.5 28C34.5 31.3 31.8 34 28.5 34H11C7.7 34 5 31.3 5 28Z" fill="${colors.secondary}" opacity="0.95" />
      <g transform="translate(0 -1) rotate(5 18 18)">
        <rect x="10.4" y="13.1" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <rect x="23.6" y="13.1" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <path d="M14.8 19.2C16.4 20.3 19.6 20.3 21.2 19.2" stroke="${colors.feature}" stroke-linecap="round" stroke-width="1.5" />
      </g>
    `,
  },
  {
    id: 5,
    label: "Cobalt Wave",
    defaultColors: {
      background: "#4AA9FF",
      primary: "#173B8F",
      secondary: "#C9EBFF",
      feature: "#FFFFFF",
    },
    render: (colors) => `
      <rect width="36" height="36" fill="${colors.background}" />
      <path d="M3 12C7 4.5 16 1 26 3.8C31.5 5.4 34.5 8.4 36 11V36H3V12Z" fill="${colors.primary}" />
      <path d="M0 25.2C4.7 21.6 9.4 20.3 14.2 21.2C19.4 22.2 24 20.7 27.8 16.8C31 18.3 33.7 20.8 36 24.3V36H0V25.2Z" fill="${colors.secondary}" opacity="0.92" />
      <g transform="translate(1 -1)">
        <circle cx="12.8" cy="13.5" r="1.2" fill="${colors.feature}" />
        <circle cx="23.2" cy="13.5" r="1.2" fill="${colors.feature}" />
        <path d="M13.7 19.6C15.4 20.9 20.6 20.9 22.3 19.6" stroke="${colors.feature}" stroke-linecap="round" stroke-width="1.5" />
      </g>
    `,
  },
  {
    id: 6,
    label: "Violet Flash",
    defaultColors: {
      background: "#8D5CFF",
      primary: "#F7A8FF",
      secondary: "#FCE0FF",
      feature: "#22163F",
    },
    render: (colors) => `
      <rect width="36" height="36" fill="${colors.background}" />
      <rect x="9" y="1" width="18" height="32" rx="9" fill="${colors.primary}" />
      <path d="M18 5L20.3 10.2L26 11.2L21.8 15.1L22.8 20.8L18 18L13.2 20.8L14.2 15.1L10 11.2L15.7 10.2L18 5Z" fill="${colors.secondary}" opacity="0.78" />
      <g transform="translate(0 1)">
        <rect x="13.2" y="12.9" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <rect x="21" y="12.9" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <path d="M14 20.8C16.4 22 19.6 22 22 20.8" stroke="${colors.feature}" stroke-linecap="round" stroke-width="1.5" />
      </g>
    `,
  },
  {
    id: 7,
    label: "Coral Tide",
    defaultColors: {
      background: "#FF8F7A",
      primary: "#0B8C88",
      secondary: "#FFE0D9",
      feature: "#FFFFFF",
    },
    render: (colors) => `
      <rect width="36" height="36" fill="${colors.background}" />
      <path d="M-2 18C4 4.5 14 0 27 2.6C31.4 3.5 34.4 5 38 8V36H-2V18Z" fill="${colors.primary}" />
      <circle cx="8" cy="28" r="8" fill="${colors.secondary}" opacity="0.92" />
      <circle cx="28" cy="28" r="8" fill="${colors.secondary}" opacity="0.72" />
      <g transform="translate(0 0.5) rotate(7 18 18)">
        <rect x="11.2" y="13.1" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <path d="M22.6 13.8L24.8 13.2L23.5 15.4" stroke="${colors.feature}" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" />
        <path d="M14.2 20.3C16.2 21.4 19.8 21.4 21.8 20.3" stroke="${colors.feature}" stroke-linecap="round" stroke-width="1.5" />
      </g>
    `,
  },
  {
    id: 8,
    label: "Solar Split",
    defaultColors: {
      background: "#F6C945",
      primary: "#1B7F68",
      secondary: "#FFF1BE",
      feature: "#0A0310",
    },
    render: (colors) => `
      <rect width="36" height="36" fill="${colors.background}" />
      <path d="M18 0H36V36H18C11 31 8.5 24.5 8.5 18C8.5 11.5 11 5 18 0Z" fill="${colors.primary}" />
      <path d="M0 28C5 24.2 10.3 22.7 15.4 23.7C20.5 24.7 25.2 23.1 29.4 18.9C32 20.2 34.1 22.3 36 25.5V36H0V28Z" fill="${colors.secondary}" opacity="0.86" />
      <g transform="translate(-0.5 -1)">
        <rect x="11.2" y="13.6" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <rect x="22.8" y="13.6" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <path d="M13.9 19.8H22.1" stroke="${colors.feature}" stroke-linecap="round" stroke-width="1.5" />
      </g>
    `,
  },
  {
    id: 9,
    label: "Orbit Buddy",
    defaultColors: {
      background: "#101B3A",
      primary: "#89FCB3",
      secondary: "#D6FFF0",
      feature: "#0A0310",
    },
    render: (colors) => `
      <rect width="36" height="36" fill="${colors.background}" />
      <circle cx="18" cy="18" r="12" fill="${colors.primary}" />
      <circle cx="18" cy="18" r="16.5" stroke="${colors.secondary}" stroke-width="2.2" opacity="0.7" />
      <circle cx="6.2" cy="10" r="3.3" fill="${colors.secondary}" opacity="0.95" />
      <g transform="translate(0 0.4)">
        <circle cx="14" cy="15" r="1.1" fill="${colors.feature}" />
        <circle cx="22" cy="15" r="1.1" fill="${colors.feature}" />
        <path d="M14.2 20C15.9 21.8 20.1 21.8 21.8 20" stroke="${colors.feature}" stroke-linecap="round" stroke-width="1.5" />
      </g>
    `,
  },
  {
    id: 10,
    label: "Pixel Beam",
    defaultColors: {
      background: "#F5EFE6",
      primary: "#111827",
      secondary: "#FF6B8A",
      feature: "#111827",
    },
    render: (colors) => `
      <rect width="36" height="36" fill="${colors.background}" />
      <rect x="7" y="7" width="22" height="22" rx="7" transform="rotate(45 18 18)" fill="${colors.primary}" />
      <rect x="2" y="22.5" width="32" height="6.2" rx="3.1" fill="${colors.secondary}" opacity="0.9" />
      <g transform="translate(0 -1)">
        <rect x="12.3" y="13.2" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <rect x="21.9" y="13.2" width="1.8" height="2.1" rx="0.9" fill="${colors.feature}" />
        <path d="M14.2 19.8C16.2 21 19.8 21 21.8 19.8" stroke="${colors.feature}" stroke-linecap="round" stroke-width="1.5" />
      </g>
    `,
  },
];

const avatarTemplateMap = new Map(AVATAR_TEMPLATES.map((template) => [template.id, template]));

export const DEFAULT_AVATAR_ID = AVATAR_TEMPLATES[0].id;

const getAvatarTemplate = (avatarId: number) =>
  avatarTemplateMap.get(avatarId) ?? avatarTemplateMap.get(DEFAULT_AVATAR_ID)!;

const normalizeAvatarColors = (colors: Partial<AvatarColors> | undefined, fallback: AvatarColors): AvatarColors => ({
  background: normalizeHexColor(colors?.background, fallback.background),
  primary: normalizeHexColor(colors?.primary, fallback.primary),
  secondary: normalizeHexColor(colors?.secondary, fallback.secondary),
  feature: normalizeHexColor(colors?.feature, fallback.feature),
});

export const getDefaultAvatarSelection = (avatarId = DEFAULT_AVATAR_ID): AvatarSelection => {
  const template = getAvatarTemplate(avatarId);

  return {
    avatarId: template.id,
    colors: { ...template.defaultColors },
  };
};

export const DEFAULT_AVATAR_SELECTION = getDefaultAvatarSelection();

export const getAvatarDataUrl = (selection: AvatarSelection) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildAvatarSvg(selection))}`;

export const getAvatarDataUrlForId = (avatarId: number) => getAvatarDataUrl(getDefaultAvatarSelection(avatarId));

const LEGACY_AVATAR_CONFIGS: LegacyAvatarConfig[] = [
  {
    id: 1,
    background: "#ff005b",
    shape: "#ffb238",
    accent: "#fde6c8",
    spark: "#2a1025",
    eye: "#0a0310",
    mouth: "#0a0310",
    rotation: 28,
    faceX: 0,
    faceY: -1,
    faceRotation: 6,
    sparkleX: 29,
    sparkleY: 8,
    sparkleRadius: 4,
  },
  {
    id: 2,
    background: "#ff7d10",
    shape: "#0a0310",
    accent: "#ffffff",
    spark: "#ffd7b2",
    eye: "#ffffff",
    mouth: "#ffffff",
    rotation: 52,
    faceX: 1,
    faceY: -4,
    faceRotation: -7,
    sparkleX: 9,
    sparkleY: 28,
    sparkleRadius: 4,
  },
  {
    id: 3,
    background: "#0a0310",
    shape: "#ff005b",
    accent: "#ffc2de",
    spark: "#ffffff",
    eye: "#ffffff",
    mouth: "#ffffff",
    rotation: 224,
    faceX: -3,
    faceY: 3,
    faceRotation: 9,
    sparkleX: 26,
    sparkleY: 9,
    sparkleRadius: 3.5,
  },
  {
    id: 4,
    background: "#d8fcb3",
    shape: "#89fcb3",
    accent: "#eefce4",
    spark: "#0f2b20",
    eye: "#0a0310",
    mouth: "#0a0310",
    rotation: 216,
    faceX: 0,
    faceY: -1,
    faceRotation: 7,
    sparkleX: 8,
    sparkleY: 8,
    sparkleRadius: 3.5,
  },
  {
    id: 5,
    background: "#4aa9ff",
    shape: "#173b8f",
    accent: "#c9ebff",
    spark: "#f4f8ff",
    eye: "#ffffff",
    mouth: "#ffffff",
    rotation: 196,
    faceX: 1,
    faceY: 0,
    faceRotation: -4,
    sparkleX: 27,
    sparkleY: 26,
    sparkleRadius: 4,
  },
  {
    id: 6,
    background: "#8d5cff",
    shape: "#f7a8ff",
    accent: "#fce0ff",
    spark: "#22163f",
    eye: "#22163f",
    mouth: "#22163f",
    rotation: 34,
    faceX: -1,
    faceY: -2,
    faceRotation: -10,
    sparkleX: 30,
    sparkleY: 11,
    sparkleRadius: 3.5,
  },
  {
    id: 7,
    background: "#ff8f7a",
    shape: "#0b8c88",
    accent: "#ffe0d9",
    spark: "#fef8f6",
    eye: "#ffffff",
    mouth: "#ffffff",
    rotation: 142,
    faceX: 1,
    faceY: -2,
    faceRotation: 8,
    sparkleX: 7,
    sparkleY: 10,
    sparkleRadius: 4,
  },
];

const buildLegacyAvatarSvg = (config: LegacyAvatarConfig) => `
  <svg aria-label="Legacy Avatar ${config.id}" fill="none" role="img" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="${config.background}" />
    <rect
      x="6"
      y="3.5"
      width="24"
      height="24"
      rx="8"
      transform="rotate(${config.rotation} 18 18)"
      fill="${config.shape}"
    />
    <path
      d="M4 29.25C8.5 23.75 13.75 22 18.5 23.75C23.25 25.5 28 22.75 32 16.25V36H4V29.25Z"
      fill="${config.accent}"
      opacity="0.9"
    />
    <circle cx="${config.sparkleX}" cy="${config.sparkleY}" r="${config.sparkleRadius}" fill="${config.spark}" opacity="0.92" />
    <path d="M10 8.25L12.1 12.75L16.6 14.85L12.1 16.95L10 21.45L7.9 16.95L3.4 14.85L7.9 12.75L10 8.25Z" fill="${config.spark}" opacity="0.45" />
    <g transform="translate(${config.faceX} ${config.faceY}) rotate(${config.faceRotation} 18 18)">
      <rect x="11.4" y="13.2" width="1.9" height="2.2" rx="1" fill="${config.eye}" />
      <rect x="22.8" y="13.2" width="1.9" height="2.2" rx="1" fill="${config.eye}" />
      <path d="M14.1 20.1C16.3 21.7 19.7 21.7 21.9 20.1" stroke="${config.mouth}" stroke-linecap="round" stroke-width="1.5" />
    </g>
  </svg>
`;

const legacyAvatarUrlMap = new Map(
  LEGACY_AVATAR_CONFIGS.map((config) => [
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildLegacyAvatarSvg(config))}`,
    config.id,
  ]),
);

const decodeAvatarSvgFromUrl = (avatarUrl: string | null | undefined) => {
  if (!avatarUrl?.startsWith("data:image/svg+xml")) return null;

  const encoded = avatarUrl.slice(avatarUrl.indexOf(",") + 1);

  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
};

const extractMetadataValue = (svg: string, name: string) => {
  const match = svg.match(new RegExp(`${name}="([^"]+)"`));
  return match?.[1] ?? null;
};

export const getAvatarSelectionFromDataUrl = (avatarUrl: string | null | undefined) => {
  const decodedSvg = decodeAvatarSvgFromUrl(avatarUrl);

  if (decodedSvg?.includes('data-spotai-avatar="true"')) {
    const avatarIdValue = extractMetadataValue(decodedSvg, "data-avatar-id");
    const avatarId = Number.parseInt(avatarIdValue || "", 10);
    const template = getAvatarTemplate(Number.isNaN(avatarId) ? DEFAULT_AVATAR_ID : avatarId);

    return {
      avatarId: template.id,
      colors: normalizeAvatarColors(
        {
          background: extractMetadataValue(decodedSvg, "data-color-background"),
          primary: extractMetadataValue(decodedSvg, "data-color-primary"),
          secondary: extractMetadataValue(decodedSvg, "data-color-secondary"),
          feature: extractMetadataValue(decodedSvg, "data-color-feature"),
        },
        template.defaultColors,
      ),
    };
  }

  const legacyId = avatarUrl ? legacyAvatarUrlMap.get(avatarUrl) : null;

  if (legacyId) {
    return getDefaultAvatarSelection(legacyId);
  }

  return null;
};

export const getAvatarIdFromDataUrl = (avatarUrl: string | null | undefined) =>
  getAvatarSelectionFromDataUrl(avatarUrl)?.avatarId ?? null;

function AvatarArtwork({ svg, className }: { svg: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("[&_svg]:h-full [&_svg]:w-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (nextColor: string) => void;
}) {
  return (
    <div className="rounded-[1.1rem] border border-black/8 bg-slate-50/80 p-3 transition-colors dark:border-white/10 dark:bg-white/[0.045]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{label}</span>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-300">{value}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="grid flex-1 grid-cols-6 gap-1.5">
          {COLOR_SWATCHS.map((swatch) => {
            const isSelected = normalizeHexColor(value, swatch) === normalizeHexColor(swatch, swatch);

            return (
              <button
                key={`${label}-${swatch}`}
                type="button"
                aria-label={`${label} ${swatch}`}
                onClick={() => onChange(swatch)}
                className={cn(
                  "h-6 w-6 rounded-full border transition-transform duration-150 hover:scale-105",
                  isSelected
                    ? "border-slate-900 ring-2 ring-slate-900/70 ring-offset-2 ring-offset-white dark:border-white dark:ring-white/80 dark:ring-offset-[#07101f]"
                    : "border-black/10 dark:border-white/10",
                )}
                style={{ backgroundColor: swatch }}
              />
            );
          })}
        </div>
        <label
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition-colors hover:border-slate-900/20 dark:border-white/10 dark:bg-[#07101f] dark:hover:border-white/20"
          style={{ color: value }}
        >
          <span className="h-4 w-4 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: value }} />
          <input
            className="sr-only"
            type="color"
            aria-label={`${label} custom color`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export function ProfileAvatarPicker({ value, onChange, className }: ProfileAvatarPickerProps) {
  const shouldReduceMotion = useReducedMotion();
  const selectedAvatar = getAvatarTemplate(value?.avatarId);
  const selection = {
    avatarId: selectedAvatar.id,
    colors: normalizeAvatarColors(value?.colors, selectedAvatar.defaultColors),
  };
  const ringRgb = hexToRgbChannels(selection.colors.background);
  const selectedSvg = buildAvatarSvg(selection);
  const hasCustomColors = COLOR_FIELDS.some(
    ({ key }) => selection.colors[key] !== selectedAvatar.defaultColors[key],
  );

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-colors dark:border-white/10 dark:bg-[#07101f] dark:shadow-[0_26px_70px_rgba(0,0,0,0.38)]",
        className,
      )}
    >
      <CardContent className="p-6 md:p-7">
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-2xl tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
              Choose your avatar
            </h3>
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              Pick a template first, then make light color adjustments if you want a custom look.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-black/8 bg-slate-50/70 p-4 transition-colors dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                  <motion.div
                    animate={{
                      boxShadow: `0 0 0 2px rgba(${ringRgb}, 0.5), 0 14px 34px rgba(${ringRgb}, 0.18)`,
                    }}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full"
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.42, ease: "easeOut" }}
                  />
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-white transition-colors dark:bg-[#0a1324]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${selection.avatarId}-${selection.colors.background}-${selection.colors.primary}-${selection.colors.secondary}-${selection.colors.feature}`}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0"
                        exit={{ opacity: 0, scale: 1.04 }}
                        initial={{ opacity: 0, scale: 0.96 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
                      >
                        <AvatarArtwork className="h-full w-full" svg={selectedSvg} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`${selection.avatarId}-label`}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-semibold text-slate-950 dark:text-white"
                      exit={{ opacity: 0, y: -6 }}
                      initial={{ opacity: 0, y: 6 }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
                    >
                      {selectedAvatar.label}
                    </motion.p>
                  </AnimatePresence>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Start from this template, then adjust only the colors you care about.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasCustomColors}
                onClick={() => onChange(getDefaultAvatarSelection(selection.avatarId))}
                className="rounded-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset colors
              </Button>
            </div>
          </div>

          <motion.div
            animate="animate"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
            initial="initial"
            variants={containerVariants}
          >
            {AVATAR_TEMPLATES.map((template) => {
              const isSelected = template.id === selection.avatarId;
              const previewSvg = buildAvatarSvg(getDefaultAvatarSelection(template.id));

              return (
                <motion.button
                  key={template.id}
                  type="button"
                  aria-label={`Select ${template.label}`}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative overflow-hidden rounded-[1.1rem] border bg-slate-50 px-3 py-3 text-left transition-[opacity,transform,box-shadow,border-color,background-color] duration-200 dark:bg-white/[0.05]",
                    isSelected
                      ? "border-slate-900/15 opacity-100 ring-2 ring-slate-900/80 ring-offset-2 ring-offset-white dark:border-white/20 dark:ring-white/80 dark:ring-offset-[#07101f]"
                      : "border-black/8 opacity-75 hover:opacity-100 dark:border-white/10",
                  )}
                  onClick={() => onChange(getDefaultAvatarSelection(template.id))}
                  variants={thumbnailVariants}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] dark:bg-[#0a1324]">
                      <AvatarArtwork className="h-full w-full" svg={previewSvg} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{template.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Template {template.id}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 dark:bg-white">
                      <Check aria-hidden="true" className="h-3 w-3 text-white dark:text-slate-950" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          <div className="rounded-[1.5rem] border border-black/8 bg-slate-50/70 p-4 transition-colors dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Color tweaks</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Keep it simple: tap a swatch or use the color dot for a custom value.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {COLOR_FIELDS.map((field) => (
                <ColorField
                  key={field.key}
                  label={field.label}
                  value={selection.colors[field.key]}
                  onChange={(nextColor) =>
                    onChange({
                      avatarId: selection.avatarId,
                      colors: {
                        ...selection.colors,
                        [field.key]: normalizeHexColor(nextColor, selection.colors[field.key]),
                      },
                    })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
