import type { AuthProfile } from "@/contexts/AuthContext";

export const hasCompletedOnboarding = (profile: Partial<AuthProfile> | null | undefined) => {
  if (!profile) return false;

  if (profile.onboarding_completed) return true;

  const hasIdentity =
    Boolean(profile.display_name?.trim()) ||
    Boolean(profile.first_name?.trim()) ||
    Boolean(profile.last_name?.trim());

  const hasProfileSurface =
    Boolean(profile.avatar_url) ||
    Boolean(profile.headline?.trim()) ||
    Boolean(profile.bio?.trim());

  return hasIdentity || hasProfileSurface;
};

export const splitFullName = (fullName: string | null | undefined) => {
  const trimmed = fullName?.trim() || "";

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};
