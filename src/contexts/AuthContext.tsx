import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import {
  clearGoogleAuthIntent,
  getGoogleAuthIntent,
  isGoogleUser,
  setAuthFlashMessage,
  setGoogleAuthIntent,
  type GoogleAuthIntent,
} from "@/lib/auth-flow";

export interface AuthProfile {
  avatar_url: string | null;
  bio: string | null;
  display_name: string | null;
  first_name: string | null;
  google_auth_enabled: boolean;
  headline: string | null;
  is_platform_banned: boolean;
  last_name: string | null;
  onboarding_completed: boolean;
  platform_ban_reason: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ requiresEmailVerification: boolean }>;
  signInWithGoogle: (intent: GoogleAuthIntent) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  profile: AuthProfile | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  const buildFallbackProfile = (nextUser: User): AuthProfile | null => {
    const metadata = nextUser.user_metadata || {};
    const fullName = String(metadata.full_name || metadata.name || "").trim();
    const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;
    const displayName = typeof metadata.display_name === "string" ? metadata.display_name : fullName || null;
    const firstName = typeof metadata.first_name === "string" ? metadata.first_name : fullName.split(/\s+/)[0] || null;
    const lastName =
      typeof metadata.last_name === "string"
        ? metadata.last_name
        : fullName.split(/\s+/).slice(1).join(" ") || null;

    const hasIdentity = Boolean(displayName || avatarUrl || fullName);
    const metadataSaysCompleted = Boolean(metadata.onboarding_completed);
    const accountAgeMs = Date.now() - new Date(nextUser.created_at).getTime();
    const isEstablishedAccount = Number.isFinite(accountAgeMs) && accountAgeMs > 10 * 60 * 1000;

    if (!hasIdentity || (!metadataSaysCompleted && !isEstablishedAccount)) {
      return null;
    }

    return {
      avatar_url: avatarUrl,
      bio: typeof metadata.bio === "string" ? metadata.bio : null,
      display_name: displayName,
      first_name: firstName,
      google_auth_enabled: isGoogleUser(nextUser),
      headline: typeof metadata.headline === "string" ? metadata.headline : null,
      is_platform_banned: false,
      last_name: lastName,
      onboarding_completed: true,
      platform_ban_reason: null,
    };
  };

  const fetchProfileData = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, bio, first_name, google_auth_enabled, last_name, headline, onboarding_completed, is_platform_banned, platform_ban_reason")
        .eq("user_id", userId)
        .single();

      return data ?? null;
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    const nextProfile = await fetchProfileData(userId);
    setProfile(nextProfile);
    return nextProfile;
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    await fetchProfile(user.id);
  };

  const resolveGoogleAuthIntent = async (
    nextSession: Session,
    nextProfile: AuthProfile | null,
  ) => {
    const intent = getGoogleAuthIntent();

    if (!intent || !isGoogleUser(nextSession.user)) {
      return { session: nextSession, profile: nextProfile };
    }

    if (intent === "signup") {
      if (!nextProfile?.google_auth_enabled) {
        const { error } = await supabase
          .from("profiles")
          .update({ google_auth_enabled: true })
          .eq("user_id", nextSession.user.id);

        if (!error) {
          nextProfile = nextProfile
            ? { ...nextProfile, google_auth_enabled: true }
            : nextProfile;
        }
      }

      clearGoogleAuthIntent();
      return { session: nextSession, profile: nextProfile };
    }

    if (!nextProfile?.google_auth_enabled) {
      clearGoogleAuthIntent();
      setAuthFlashMessage("This Google account is not registered for login yet. Use Create new account to sign up first.");
      await supabase.auth.signOut();
      return { session: null, profile: null };
    }

    clearGoogleAuthIntent();
    return { session: nextSession, profile: nextProfile };
  };

  const applySession = async (nextSession: Session | null) => {
    setLoading(true);

    if (!nextSession?.user) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileLoading(false);
      setLoading(false);
      return;
    }

    const nextProfile = await fetchProfileData(nextSession.user.id);
    const resolved = await resolveGoogleAuthIntent(
      nextSession,
      nextProfile ?? buildFallbackProfile(nextSession.user),
    );

    if (!resolved.session?.user) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileLoading(false);
      setLoading(false);
      return;
    }

    setSession(resolved.session);
    setUser(resolved.session.user);
    setProfile(resolved.profile);
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => {
        void applySession(nextSession);
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: nextSession } }) => {
      void applySession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });
    if (error) throw error;

    return {
      requiresEmailVerification: !data.session,
    };
  };

  const signInWithGoogle = async (intent: GoogleAuthIntent) => {
    const { lovable } = await import("@/integrations/lovable/index");
    setGoogleAuthIntent(intent);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: intent === "signup"
        ? `${window.location.origin}/auth?mode=signup`
        : `${window.location.origin}/`,
    });
    if (error) {
      clearGoogleAuthIntent();
      throw error;
    }
  };

  const signOut = async () => {
    clearGoogleAuthIntent();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profileLoading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, resetPassword, updatePassword, profile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
