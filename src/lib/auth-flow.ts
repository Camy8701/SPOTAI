import type { User } from "@supabase/supabase-js";

export type GoogleAuthIntent = "login" | "signup";

const GOOGLE_AUTH_INTENT_KEY = "spotai-google-auth-intent";
const AUTH_FLASH_KEY = "spotai-auth-flash";
const GOOGLE_AUTH_INTENT_MAX_AGE_MS = 15 * 60 * 1000;

export const setGoogleAuthIntent = (intent: GoogleAuthIntent) => {
  window.sessionStorage.setItem(
    GOOGLE_AUTH_INTENT_KEY,
    JSON.stringify({
      intent,
      createdAt: Date.now(),
    }),
  );
};

export const getGoogleAuthIntent = (): GoogleAuthIntent | null => {
  const rawValue = window.sessionStorage.getItem(GOOGLE_AUTH_INTENT_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as {
      intent?: GoogleAuthIntent;
      createdAt?: number;
    };

    if (
      (parsed.intent !== "login" && parsed.intent !== "signup") ||
      typeof parsed.createdAt !== "number" ||
      Date.now() - parsed.createdAt > GOOGLE_AUTH_INTENT_MAX_AGE_MS
    ) {
      clearGoogleAuthIntent();
      return null;
    }

    return parsed.intent;
  } catch {
    clearGoogleAuthIntent();
    return null;
  }
};

export const clearGoogleAuthIntent = () => {
  window.sessionStorage.removeItem(GOOGLE_AUTH_INTENT_KEY);
};

export const setAuthFlashMessage = (message: string) => {
  window.sessionStorage.setItem(AUTH_FLASH_KEY, message);
};

export const consumeAuthFlashMessage = () => {
  const message = window.sessionStorage.getItem(AUTH_FLASH_KEY);
  if (message) {
    window.sessionStorage.removeItem(AUTH_FLASH_KEY);
  }
  return message;
};

export const isGoogleUser = (user: User | null | undefined) => {
  if (!user) return false;

  const provider = user.app_metadata?.provider;
  const providers = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
    : [];

  return provider === "google" || providers.includes("google");
};
