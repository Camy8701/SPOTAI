import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Ban,
  Crown,
  Globe,
  PenSquare,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  addCommunityAdmin,
  banCommunityUser,
  deleteScopedPost,
  fetchCommunityManagementData,
  removeCommunityAdmin,
  removeCommunityMember,
  unbanCommunityUser,
} from "@/lib/social-moderation";
import { toast } from "sonner";

const languageFlags: Record<string, string> = {
  en: "🇬🇧", fr: "🇫🇷", es: "🇪🇸", de: "🇩🇪", pt: "🇧🇷", it: "🇮🇹",
  ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", ar: "🇸🇦", hi: "🇮🇳", ru: "🇷🇺",
  nl: "🇳🇱", sv: "🇸🇪", pl: "🇵🇱", tr: "🇹🇷",
};

const topicIcons: Record<string, string> = {
  general: "💬", technology: "💻", art: "🎨", music: "🎵", gaming: "🎮",
  science: "🔬", sports: "⚽", food: "🍕", travel: "✈️", books: "📚",
  movies: "🎬", health: "🏥", business: "💼", education: "📖",
};

const languages = Object.entries(languageFlags).map(([code, flag]) => ({ code, flag }));
const topics = Object.entries(topicIcons).map(([name, icon]) => ({ name, icon }));

const Communities = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", language: "en", topic: "general" });
  const [managingCommunity, setManagingCommunity] = useState<string | null>(null);

  const { data: communities, isLoading } = useQuery({
    queryKey: ["communities", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      if (!data) return [];

      const enriched = await Promise.all(
        data.map(async (community) => {
          const [{ count }, membershipRes, adminRes, banRes] = await Promise.all([
            supabase
              .from("community_members")
              .select("*", { count: "exact", head: true })
              .eq("community_id", community.id),
            user
              ? supabase
                  .from("community_members")
                  .select("id")
                  .eq("community_id", community.id)
                  .eq("user_id", user.id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
            user
              ? supabase
                  .from("community_admins")
                  .select("id")
                  .eq("community_id", community.id)
                  .eq("user_id", user.id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
            user
              ? supabase
                  .from("community_bans")
                  .select("id")
                  .eq("community_id", community.id)
                  .eq("user_id", user.id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          const isOwner = community.created_by === user?.id;
          const isAdmin = Boolean(adminRes.data) || isOwner;
          const isMember = Boolean(membershipRes.data) || isAdmin;
          const isBanned = Boolean(banRes.data);

          return {
            ...community,
            memberCount: count || 0,
            isOwner,
            isAdmin,
            isMember,
            isBanned,
            canManage: isAdmin,
            canPost: isMember && !isBanned,
          };
        }),
      );

      return enriched;
    },
  });

  const selectedCommunity = communities?.find((community) => community.id === managingCommunity) || null;

  const { data: managementData, isLoading: managementLoading } = useQuery({
    queryKey: ["community-management", managingCommunity, selectedCommunity?.created_by],
    enabled: Boolean(managingCommunity && selectedCommunity),
    queryFn: () => fetchCommunityManagementData(managingCommunity!, selectedCommunity?.created_by),
  });

  const refreshCommunityData = () => {
    queryClient.invalidateQueries({ queryKey: ["communities"] });
    if (managingCommunity) {
      queryClient.invalidateQueries({ queryKey: ["community-management", managingCommunity] });
    }
  };

  const createCommunity = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("communities").insert({
        name: form.name,
        description: form.description,
        language: form.language,
        topic: form.topic,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Community created");
      setShowCreate(false);
      setForm({ name: "", description: "", language: "en", topic: "general" });
      refreshCommunityData();
    },
    onError: (error) => toast.error(error.message || "Failed to create community"),
  });

  const joinCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      const { error } = await supabase.from("community_members").insert({ community_id: communityId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Joined community");
      refreshCommunityData();
    },
    onError: (error) => toast.error(error.message || "Could not join community"),
  });

  const leaveCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      const { error } = await supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Left community");
      refreshCommunityData();
    },
    onError: (error) => toast.error(error.message || "Could not leave community"),
  });

  const withModerationRefresh = async (task: () => Promise<void>, success: string) => {
    try {
      await task();
      toast.success(success);
      refreshCommunityData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Moderation action failed");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Communities</h1>
              <p className="text-muted-foreground">Public spaces with local admins, moderation, and scoped posts.</p>
            </div>
          </div>
          {user && (
            <button
              onClick={() => setShowCreate((current) => !current)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> Create
            </button>
          )}
        </div>

        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8 p-6 rounded-xl border border-border bg-card"
          >
            <h3 className="font-bold text-foreground mb-4">Create a community</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Community name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-4 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="px-4 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="px-4 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.flag} {language.code.toUpperCase()}
                  </option>
                ))}
              </select>
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="px-4 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {topics.map((topic) => (
                  <option key={topic.name} value={topic.name}>
                    {topic.icon} {topic.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => form.name && createCommunity.mutate()}
              disabled={!form.name}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50"
            >
              Create Community
            </button>
          </motion.div>
        )}

        {managingCommunity && selectedCommunity ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-[1.75rem] border border-border bg-card p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{topicIcons[selectedCommunity.topic] || "💬"}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedCommunity.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Moderate members, assign local admins, and remove community posts.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/create-post?communityId=${selectedCommunity.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <PenSquare size={15} /> Create post
                </Link>
                <button
                  onClick={() => setManagingCommunity(null)}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Close
                </button>
              </div>
            </div>

            {managementLoading ? (
              <div className="mt-6 rounded-2xl border border-border bg-secondary/60 p-8 text-center text-sm text-muted-foreground">
                Loading moderation tools...
              </div>
            ) : managementData ? (
              <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
                <div className="space-y-6">
                  <section className="rounded-2xl border border-border bg-background p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Members</p>
                        <h3 className="mt-1 text-xl font-semibold text-foreground">{managementData.members.length} people</h3>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {managementData.members.map((member) => (
                        <div key={member.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{member.profile?.display_name || "Unnamed user"}</p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                              {member.isOwner ? <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Owner</span> : null}
                              {!member.isOwner && member.isAdmin ? <span className="rounded-full bg-violet-100 px-2 py-1 text-violet-700">Admin</span> : null}
                            </div>
                          </div>
                          {!member.isOwner ? (
                            <div className="flex flex-wrap gap-2">
                              {member.isAdmin ? (
                                <button
                                  onClick={() => withModerationRefresh(() => removeCommunityAdmin(selectedCommunity.id, member.user_id), "Admin removed")}
                                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-secondary"
                                >
                                  Remove admin
                                </button>
                              ) : (
                                <button
                                  onClick={() => withModerationRefresh(() => addCommunityAdmin(selectedCommunity.id, member.user_id), "Admin added")}
                                  className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 hover:bg-violet-100"
                                >
                                  <UserPlus className="mr-1 inline h-3.5 w-3.5" />
                                  Make admin
                                </button>
                              )}
                              <button
                                onClick={() => withModerationRefresh(() => removeCommunityMember(selectedCommunity.id, member.user_id), "Member removed")}
                                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-secondary"
                              >
                                Remove
                              </button>
                              <button
                                onClick={() => withModerationRefresh(() => banCommunityUser(selectedCommunity.id, member.user_id), "User banned from community")}
                                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-700 hover:bg-red-100"
                              >
                                <Ban className="mr-1 inline h-3.5 w-3.5" />
                                Ban
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-background p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recent posts</p>
                        <h3 className="mt-1 text-xl font-semibold text-foreground">{managementData.posts.length} scoped posts</h3>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {managementData.posts.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                          No community posts yet. Members can publish directly into this space.
                        </p>
                      ) : (
                        managementData.posts.map((post) => (
                          <div key={post.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <Link to={`/post/${post.slug}`} className="font-medium text-foreground hover:underline">
                                {post.title}
                              </Link>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {post.authorName} • {new Date(post.created_at).toLocaleDateString()} • {post.status}
                              </p>
                            </div>
                            <button
                              onClick={() => withModerationRefresh(() => deleteScopedPost(post.id), "Community post deleted")}
                              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                              Delete post
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="rounded-2xl border border-border bg-background p-5">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-violet-600" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admins</p>
                        <h3 className="mt-1 text-xl font-semibold text-foreground">{managementData.admins.length + 1} moderators</h3>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="font-medium text-foreground">{selectedCommunity.isOwner ? "You" : "Owner"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Community creator has permanent local control.</p>
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                          <Crown className="h-3.5 w-3.5" />
                          Owner
                        </div>
                      </div>
                      {managementData.admins.map((admin) => (
                        <div key={admin.id} className="rounded-2xl border border-border p-4">
                          <p className="font-medium text-foreground">{admin.profile?.display_name || "Admin"}</p>
                          <p className="mt-1 text-sm text-muted-foreground">Can moderate members and posts only inside this community.</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-background p-5">
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Banned users</p>
                        <h3 className="mt-1 text-xl font-semibold text-foreground">{managementData.bans.length} blocked</h3>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {managementData.bans.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                          No bans yet.
                        </p>
                      ) : (
                        managementData.bans.map((ban) => (
                          <div key={ban.id} className="flex items-center justify-between rounded-2xl border border-border p-4">
                            <div>
                              <p className="font-medium text-foreground">{ban.profile?.display_name || "User"}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{ban.reason || "No reason supplied"}</p>
                            </div>
                            <button
                              onClick={() => withModerationRefresh(() => unbanCommunityUser(selectedCommunity.id, ban.user_id), "User unbanned")}
                              className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-secondary"
                            >
                              Unban
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </div>
            ) : null}
          </motion.div>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-40 bg-secondary animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (communities || []).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Globe className="mx-auto mb-4 opacity-40" size={48} />
            <p>No communities yet. Create the first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities!.map((community) => (
              <motion.div
                key={community.id}
                whileHover={{ y: -2 }}
                className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{topicIcons[community.topic] || "💬"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground truncate">{community.name}</h3>
                      {community.isOwner ? <Crown className="h-4 w-4 text-amber-500" /> : null}
                      {!community.isOwner && community.isAdmin ? <Shield className="h-4 w-4 text-violet-600" /> : null}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{languageFlags[community.language] || "🌐"} {community.language.toUpperCase()}</span>
                      <span>•</span>
                      <span>{community.memberCount} members</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{community.description || "No description"}</p>

                <div className="flex flex-wrap gap-2">
                  {user ? (
                    community.isBanned ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
                        Banned
                      </span>
                    ) : community.isMember ? (
                      <>
                        <Link
                          to={`/create-post?communityId=${community.id}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                        >
                          <PenSquare size={15} />
                          Create post
                        </Link>
                        {!community.isAdmin ? (
                          <button
                            onClick={() => leaveCommunity.mutate(community.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                          >
                            Leave
                          </button>
                        ) : null}
                        {community.canManage ? (
                          <button
                            onClick={() => setManagingCommunity((current) => (current === community.id ? null : community.id))}
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                          >
                            Manage
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <button
                        onClick={() => joinCommunity.mutate(community.id)}
                        className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Join community
                      </button>
                    )
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Communities;
