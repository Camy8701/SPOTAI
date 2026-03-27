import type { AuthProfile } from "@/contexts/AuthContext";

export const hasCompletedOnboarding = (profile: Pick<AuthProfile, "onboarding_completed"> | null | undefined) =>
  Boolean(profile?.onboarding_completed);

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
