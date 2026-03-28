import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
import Layout from "@/components/layout/Layout";

const ProfileSettings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(() => getDefaultAvatarSelection());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setDisplayName(profile.display_name || "");
    setHeadline(profile.headline || "");
    setBio(profile.bio || "");
    setSelectedAvatar(getAvatarSelectionFromDataUrl(profile.avatar_url) ?? getDefaultAvatarSelection());
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    const nextFirstName = firstName.trim();
    const nextDisplayName = displayName.trim();

    if (!nextFirstName || !nextDisplayName) {
      toast({
        title: "Missing details",
        description: "First name and display name are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: nextFirstName,
        last_name: lastName.trim() || null,
        display_name: nextDisplayName,
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        avatar_url: getAvatarDataUrl(selectedAvatar),
      })
      .eq("user_id", user.id);

    if (error) {
      setSaving(false);
      toast({ title: "Could not save profile", description: error.message, variant: "destructive" });
      return;
    }

    const fullName = [nextFirstName, lastName.trim()].filter(Boolean).join(" ");
    await supabase.auth.updateUser({
      data: { full_name: fullName, avatar_url: getAvatarDataUrl(selectedAvatar) },
    });

    await refreshProfile();
    setSaving(false);
    toast({ title: "Profile updated" });
  };

  if (!profile) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile Settings</h1>
          </div>
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile Settings</h1>
        </div>

        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">First name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5" placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Display name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Headline</label>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-1.5" placeholder="AI writer, marketer, founder..." />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-1.5" placeholder="A short introduction..." />
          </div>

          <ProfileAvatarPicker value={selectedAvatar} onChange={setSelectedAvatar} />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || !firstName.trim() || !displayName.trim()}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileSettings;
