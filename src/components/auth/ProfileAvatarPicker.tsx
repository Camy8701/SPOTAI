import { Check } from "lucide-react";
import { AnimatePresence, motion, type Variants, useReducedMotion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AvatarConfig {
  id: number;
  label: string;
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

export interface ProfileAvatarPickerProps {
  value: number;
  onChange: (avatarId: number) => void;
  className?: string;
}

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
    transition: { duration: 0.26, ease: "easeOut" },
  },
};

const AVATAR_CONFIGS: AvatarConfig[] = [
  {
    id: 1,
    label: "Neon Pop",
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
    label: "Night Shift",
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
    label: "Signal Bloom",
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
    label: "Mint Cloud",
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
    label: "Cobalt Wave",
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
    label: "Violet Flash",
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
    label: "Coral Tide",
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

const buildAvatarSvg = (config: AvatarConfig) => `
  <svg aria-label="${config.label}" fill="none" role="img" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
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

const avatarOptions = AVATAR_CONFIGS.map((config) => ({
  id: config.id,
  label: config.label,
  ringColor: config.background,
  svg: buildAvatarSvg(config),
}));

const avatarMap = new Map(avatarOptions.map((avatar) => [avatar.id, avatar]));

export const DEFAULT_AVATAR_ID = avatarOptions[0].id;

const getAvatarOption = (avatarId: number) =>
  avatarMap.get(avatarId) ?? avatarMap.get(DEFAULT_AVATAR_ID)!;

const hexToRgbChannels = (hex: string) => {
  const normalized = hex.replace("#", "");
  const chunks = normalized.length === 3
    ? normalized.split("").map((part) => part + part)
    : normalized.match(/.{1,2}/g);

  if (!chunks || chunks.length !== 3) {
    return "17, 24, 39";
  }

  const [r, g, b] = chunks.map((part) => Number.parseInt(part, 16));
  return `${r}, ${g}, ${b}`;
};

export const getAvatarDataUrlForId = (avatarId: number) => {
  const avatar = getAvatarOption(avatarId);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(avatar.svg)}`;
};

export const getAvatarIdFromDataUrl = (avatarUrl: string | null | undefined) => {
  if (!avatarUrl) return null;
  const match = avatarOptions.find((avatar) => getAvatarDataUrlForId(avatar.id) === avatarUrl);
  return match?.id ?? null;
};

function AvatarArtwork({ svg, className }: { svg: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("[&_svg]:h-full [&_svg]:w-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function ProfileAvatarPicker({ value, onChange, className }: ProfileAvatarPickerProps) {
  const shouldReduceMotion = useReducedMotion();
  const selectedAvatar = getAvatarOption(value);
  const ringRgb = hexToRgbChannels(selectedAvatar.ringColor);

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-colors dark:border-white/10 dark:bg-[#07101f] dark:shadow-[0_26px_70px_rgba(0,0,0,0.38)]",
        className,
      )}
    >
      <CardContent className="p-6 md:p-7">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <span className="inline-flex rounded-full border border-black/10 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 transition-colors dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
              Avatar selection
            </span>
            <div>
              <h3 className="text-2xl tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Pick your profile look
              </h3>
              <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
                Choose from 7 curated avatar colors for your SpotAI profile.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative h-40 w-40 md:h-44 md:w-44">
              <motion.div
                animate={{
                  boxShadow: `0 0 0 2px rgba(${ringRgb}, 0.48), 0 18px 48px rgba(${ringRgb}, 0.18)`,
                }}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full"
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.42, ease: "easeOut" }}
              />
              <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-100 transition-colors dark:bg-white/[0.06]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedAvatar.id}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0"
                    exit={{ opacity: 0, scale: 1.04 }}
                    initial={{ opacity: 0, scale: 0.96 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
                  >
                    <AvatarArtwork className="h-full w-full" svg={selectedAvatar.svg} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.span
                key={selectedAvatar.id}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300"
                exit={{ opacity: 0, y: -6 }}
                initial={{ opacity: 0, y: 6 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
              >
                {selectedAvatar.label}
              </motion.span>
            </AnimatePresence>
          </div>

          <motion.div
            animate="animate"
            className="grid grid-cols-4 gap-3 sm:grid-cols-7"
            initial="initial"
            variants={containerVariants}
          >
            {avatarOptions.map((avatar) => {
              const isSelected = avatar.id === selectedAvatar.id;

              return (
                <motion.button
                  key={avatar.id}
                  type="button"
                  aria-label={`Select ${avatar.label}`}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative flex h-14 items-center justify-center overflow-hidden rounded-2xl border bg-slate-50 transition-[opacity,transform,box-shadow,border-color,background-color] duration-200 dark:bg-white/[0.05]",
                    isSelected
                      ? "border-slate-900/15 opacity-100 ring-2 ring-slate-900/80 ring-offset-2 ring-offset-white dark:border-white/20 dark:ring-white/80 dark:ring-offset-[#07101f]"
                      : "border-black/8 opacity-65 hover:opacity-100 dark:border-white/10",
                  )}
                  onClick={() => onChange(avatar.id)}
                  variants={thumbnailVariants}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
                >
                  <AvatarArtwork className="h-full w-full" svg={avatar.svg} />
                  {isSelected && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 dark:bg-white">
                      <Check aria-hidden="true" className="h-3 w-3 text-white dark:text-slate-950" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
