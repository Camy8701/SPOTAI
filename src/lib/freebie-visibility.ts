export type FreebieVisibility = {
  marketplace: boolean;
  ebooks: boolean;
  homepage: boolean;
};

export type FreebieLike = {
  id?: string;
  type?: string | null;
  category?: string | null;
  show_in_marketplace?: boolean | null;
  show_in_ebooks?: boolean | null;
  show_on_homepage?: boolean | null;
};

const STORAGE_KEY = "spotai.freebieVisibilityMap.v1";

const DEFAULT_VISIBILITY: FreebieVisibility = {
  marketplace: false,
  ebooks: true,
  homepage: false,
};

export const getFreebieVisibilityMap = (): Record<string, FreebieVisibility> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

export const setFreebieVisibilityMap = (value: Record<string, FreebieVisibility>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

export const getFreebieVisibility = (
  item: FreebieLike,
  map?: Record<string, FreebieVisibility>,
): FreebieVisibility => {
  const localMap = map || getFreebieVisibilityMap();
  const key = item.id || "";
  const local = key ? localMap[key] : undefined;

  // Prefer explicit DB flags when available, then fallback to local map, then defaults.
  return {
    marketplace:
      typeof item.show_in_marketplace === "boolean"
        ? item.show_in_marketplace
        : (local?.marketplace ?? DEFAULT_VISIBILITY.marketplace),
    ebooks:
      typeof item.show_in_ebooks === "boolean"
        ? item.show_in_ebooks
        : (local?.ebooks ?? DEFAULT_VISIBILITY.ebooks),
    homepage:
      typeof item.show_on_homepage === "boolean"
        ? item.show_on_homepage
        : (local?.homepage ?? DEFAULT_VISIBILITY.homepage),
  };
};

export const upsertFreebieVisibility = (id: string, value: FreebieVisibility) => {
  const current = getFreebieVisibilityMap();
  current[id] = value;
  setFreebieVisibilityMap(current);
};
