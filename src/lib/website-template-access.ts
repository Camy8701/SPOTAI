export type WebsiteTemplateAccess = "free" | "paid";

const STORAGE_KEY = "spotai.websiteTemplateAccessMap.v1";

export const getWebsiteTemplateAccessMap = (): Record<string, WebsiteTemplateAccess> => {
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

export const setWebsiteTemplateAccessMap = (value: Record<string, WebsiteTemplateAccess>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

export const getWebsiteTemplateAccess = (
  template: { id: string; access?: WebsiteTemplateAccess },
  map?: Record<string, WebsiteTemplateAccess>,
): WebsiteTemplateAccess => {
  const localMap = map || getWebsiteTemplateAccessMap();
  return localMap[template.id] || template.access || "free";
};

export const upsertWebsiteTemplateAccess = (id: string, access: WebsiteTemplateAccess) => {
  const current = getWebsiteTemplateAccessMap();
  current[id] = access;
  setWebsiteTemplateAccessMap(current);
};
