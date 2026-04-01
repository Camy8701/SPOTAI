import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Palette, Sparkles, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isGoogleUser } from "@/lib/auth-flow";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ProfileAvatarPicker,
  getAvatarDataUrl,
  getAvatarSelectionFromDataUrl,
  getDefaultAvatarSelection,
} from "@/components/auth/ProfileAvatarPicker";
import { splitFullName } from "@/lib/profile";

const Onboarding = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [displayNameTouched, setDisplayNameTouched] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(() => getDefaultAvatarSelection());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const metadataFullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      profile?.display_name ||
      "";
    const derivedName = splitFullName(metadataFullName);
    const nextDisplayName =
      profile?.display_name ||
      [profile?.first_name || derivedName.firstName, profile?.last_name || derivedName.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      user.email?.split("@")[0] ||
      "";

    setFirstName(profile?.first_name || derivedName.firstName);
    setLastName(profile?.last_name || derivedName.lastName);
    setDisplayName(nextDisplayName);
    setHeadline(profile?.headline || "");
    setBio(profile?.bio || "");
    setSelectedAvatar(getAvatarSelectionFromDataUrl(profile?.avatar_url) ?? getDefaultAvatarSelection());
    setDisplayNameTouched(Boolean(profile?.display_name));
  }, [user, profile]);

  useEffect(() => {
    if (displayNameTouched) return;

    const nextDisplayName =
      [firstName.trim(), lastName.trim()].filter(Boolean).join(" ").trim() ||
      user?.email?.split("@")[0] ||
      "";

    setDisplayName(nextDisplayName);
  }, [firstName, lastName, displayNameTouched, user?.email]);

  const handleContinue = async () => {
    if (!user) return;

    const nextFirstName = firstName.trim();
    const nextLastName = lastName.trim();
    const nextDisplayName = displayName.trim();
    const nextHeadline = headline.trim();
    const nextBio = bio.trim();
    const nextAvatarUrl = getAvatarDataUrl(selectedAvatar);

    if (!nextFirstName || !nextDisplayName) {
      toast({
        title: "Missing details",
        description: "Add at least your first name and display name to continue.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const profilePayload = {
      first_name: nextFirstName,
      last_name: nextLastName || null,
      display_name: nextDisplayName,
      headline: nextHeadline || null,
      bio: nextBio || null,
      avatar_url: nextAvatarUrl,
      google_auth_enabled: isGoogleUser(user),
      onboarding_completed: true,
    };

    // Try update first (profile row may already exist from trigger)
    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    let error = updateError;

    // If no row was updated, insert instead
    if (!error && !updated) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ ...profilePayload, user_id: user.id });
      error = insertError;
    }

    if (error) {
      setSaving(false);
      toast({ title: "Could not save profile", description: error.message, variant: "destructive" });
      return;
    }

    const fullName = [nextFirstName, nextLastName].filter(Boolean).join(" ").trim();
    await supabase.auth.updateUser({
      data: {
        full_name: fullName || nextDisplayName,
        avatar_url: nextAvatarUrl,
        first_name: nextFirstName,
        last_name: nextLastName || null,
        display_name: nextDisplayName,
        headline: nextHeadline || null,
        bio: nextBio || null,
        onboarding_completed: true,
      },
    });

    await refreshProfile();
    setSaving(false);
    toast({ title: "Profile ready" });
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand via-background to-background px-4 py-6 dark:from-background dark:via-background dark:to-background sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/90 p-7 shadow-lg backdrop-blur md:p-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(74,169,255,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,143,122,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(74,169,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(141,92,255,0.16),transparent_30%)]" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                className="h-11 rounded-full border border-border bg-background/80 px-4 text-sm font-semibold text-foreground hover:bg-accent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Link to="/home" className="inline-flex items-center">
                <span className="spotai-wordmark text-3xl font-extrabold tracking-tight">SpotAI</span>
              </Link>
            </div>
            <div className="mt-8 max-w-xl">
              <span className="inline-flex rounded-full border border-border bg-secondary/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Profile setup
              </span>
              <h1 className="mt-5 text-5xl leading-[0.94] tracking-tight text-foreground" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Finish your profile in one pass.
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Add the details people will actually see across SpotAI, then choose an avatar that feels like you. This only happens once, and you can edit it later from your dashboard.
              </p>
            </div>

            <div className="mt-8 grid gap-4">
              {[
                {
                  icon: UserRound,
                  title: "Identity first",
                  description: "Set the name and display label that will follow your comments, communities, and messages.",
                },
                {
                  icon: Palette,
                  title: "Pick an avatar",
                  description: "Choose one of the 10 SpotAI avatar styles, then adjust the colors if you want something more personal.",
                },
                {
                  icon: BadgeCheck,
                  title: "Enter once, use everywhere",
                  description: "The profile you save here is what the dashboard and the rest of the platform will use.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-border bg-card/70 p-5 backdrop-blur">
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-border bg-foreground p-5 text-background">
              <div className="flex items-center gap-4">
                <img
                  src={getAvatarDataUrl(selectedAvatar)}
                  alt=""
                  className="h-16 w-16 rounded-2xl border border-background/15 object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-background/60">Preview</p>
                  <p className="mt-1 text-xl font-semibold">{displayName || "Your display name"}</p>
                  <p className="mt-1 text-sm text-background/70">{headline || "Your short profile headline appears here."}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-lg md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">One last step</p>
              <h2 className="mt-3 text-4xl tracking-tight text-foreground" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Set up your public profile
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              About 1 minute
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-foreground">First name</label>
              <Input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Enter your first name"
                className="mt-2 h-12 rounded-2xl border-border bg-secondary px-4"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Last name</label>
              <Input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Optional"
                className="mt-2 h-12 rounded-2xl border-border bg-secondary px-4"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-foreground">Display name</label>
            <Input
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                setDisplayNameTouched(true);
              }}
              placeholder="How people will see you"
              className="mt-2 h-12 rounded-2xl border-border bg-secondary px-4"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              This is the name shown in comments, groups, messages, and your dashboard.
            </p>
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-foreground">Headline</label>
            <Input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder="AI writer, marketer, founder, student..."
              className="mt-2 h-12 rounded-2xl border-border bg-secondary px-4"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-foreground">Bio</label>
            <Textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              placeholder="A short introduction for your SpotAI profile."
              className="mt-2 rounded-[1.35rem] border-border bg-secondary px-4 py-3"
            />
          </div>

          <div className="mt-6">
            <ProfileAvatarPicker
              className="bg-card"
              value={selectedAvatar}
              onChange={setSelectedAvatar}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              You can update all of this later from your profile settings.
            </p>
            <Button
              onClick={handleContinue}
              disabled={saving || !firstName.trim() || !displayName.trim()}
              className="h-12 rounded-full px-6 text-sm font-semibold"
            >
              {saving ? "Saving profile..." : "Save and continue"}
              {!saving ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Onboarding;
