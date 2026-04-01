import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Ban,
  CheckCircle,
  Clock,
  Crown,
  Lock,
  PenSquare,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  UsersRound,
  XCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import CatalogHeroHeader from "@/components/ui/catalog-hero-header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  addGroupAdmin,
  banGroupUser,
  deleteScopedPost,
  fetchGroupManagementData,
  removeGroupAdmin,
  removeGroupMember,
  unbanGroupUser,
  updateGroupRequest,
} from "@/lib/social-moderation";
import { toast } from "sonner";

const languageFlags: Record<string, string> = {
  en: "🇬🇧", fr: "🇫🇷", es: "🇪🇸", de: "🇩🇪", pt: "🇧🇷", it: "🇮🇹",
  ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", ar: "🇸🇦", hi: "🇮🇳", ru: "🇷🇺",
};

const topicIcons: Record<string, string> = {
  general: "💬", technology: "💻", art: "🎨", music: "🎵", gaming: "🎮",
  science: "🔬", sports: "⚽", food: "🍕", travel: "✈️", books: "📚",
};

const languages = Object.entries(languageFlags).map(([code, flag]) => ({ code, flag }));
const topics = Object.entries(topicIcons).map(([name, icon]) => ({ name, icon }));
const headerBackClassName =
  "border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-300 hover:text-rose-800";

const Groups = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", language: "en", topic: "general" });
  const [managingGroup, setManagingGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "joined" | "pending" | "managing">("all");

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (!data) return [];

      const enriched = await Promise.all(
        data.map(async (group) => {
          const [{ count }, memberRes, adminRes, banRes] = await Promise.all([
            supabase
              .from("group_members")
              .select("*", { count: "exact", head: true })
              .eq("group_id", group.id)
              .eq("status", "approved"),
            user
              ? supabase
                  .from("group_members")
                  .select("status")
                  .eq("group_id", group.id)
                  .eq("user_id", user.id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
            user
              ? supabase
                  .from("group_admins")
                  .select("id")
                  .eq("group_id", group.id)
                  .eq("user_id", user.id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
            user
              ? supabase
                  .from("group_bans")
                  .select("id")
                  .eq("group_id", group.id)
                  .eq("user_id", user.id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          const isOwner = group.created_by === user?.id;
          const isAdmin = Boolean(adminRes.data) || isOwner;
          const memberStatus = memberRes.data?.status || null;
          const isBanned = Boolean(banRes.data);
          const canPost = (memberStatus === "approved" || isAdmin) && !isBanned;

          return {
            ...group,
            memberCount: count || 0,
            isOwner,
            isAdmin,
            memberStatus,
            isBanned,
            canManage: isAdmin,
            canPost,
          };
        }),
      );

      return enriched;
    },
  });

  const selectedGroup = groups?.find((group) => group.id === managingGroup) || null;

  useEffect(() => {
    if (!user && activeFilter !== "all") {
      setActiveFilter("all");
    }
  }, [activeFilter, user]);

  const { data: managementData, isLoading: managementLoading } = useQuery({
    queryKey: ["group-management", managingGroup, selectedGroup?.created_by],
    enabled: Boolean(managingGroup && selectedGroup),
    queryFn: () => fetchGroupManagementData(managingGroup!, selectedGroup?.created_by),
  });

  const refreshGroupData = () => {
    queryClient.invalidateQueries({ queryKey: ["groups"] });
    if (managingGroup) {
      queryClient.invalidateQueries({ queryKey: ["group-management", managingGroup] });
    }
  };

  const visibleGroups = useMemo(() => {
    return (groups || []).filter((group) => {
      const keyword = `${group.name} ${group.description || ""} ${group.language || ""} ${group.topic || ""}`.toLowerCase();
      const matchesSearch = keyword.includes(searchTerm.toLowerCase());
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "joined" && group.canPost) ||
        (activeFilter === "pending" && group.memberStatus === "pending") ||
        (activeFilter === "managing" && group.canManage);

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, groups, searchTerm]);

  const filterTabs = [
    { key: "all" as const, label: "All" },
    ...(user
      ? [
          { key: "joined" as const, label: "Joined" },
          { key: "pending" as const, label: "Pending" },
          { key: "managing" as const, label: "Managing" },
        ]
      : []),
  ];

  const createGroup = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("groups").insert({
        name: form.name,
        description: form.description,
        language: form.language,
        topic: form.topic,
        created_by: user!.id,
        is_private: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Group created");
      setShowCreate(false);
      setForm({ name: "", description: "", language: "en", topic: "general" });
      refreshGroupData();
    },
    onError: (error) => toast.error(error.message || "Failed to create group"),
  });

  const requestJoin = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: user!.id, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Join request sent");
      refreshGroupData();
    },
    onError: (error) => toast.error(error.message || "Could not request access"),
  });

  const withModerationRefresh = async (task: () => Promise<void>, success: string) => {
    try {
      await task();
      toast.success(success);
      refreshGroupData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Moderation action failed");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <CatalogHeroHeader
          title="Groups"
          subtitle="Private rooms with approval flow"
          topLabel="Explore all groups"
          backLinkClassName={headerBackClassName}
          topLabelClassName="text-rose-700/75"
        >
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search groups"
                className="h-12 w-full rounded-full border border-input bg-background px-5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-rose-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`h-10 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                    activeFilter === tab.key
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-input text-muted-foreground hover:border-rose-400 hover:text-rose-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CatalogHeroHeader>

        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
                <UsersRound className="text-white" size={24} />
              </div>
              <p className="text-sm font-medium">
                {(groups || []).length} group{(groups || []).length === 1 ? "" : "s"} available
              </p>
            </div>
            {user ? (
              <button
                onClick={() => setShowCreate((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Plus size={16} /> Create
              </button>
            ) : null}
          </div>

          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-bold text-foreground">Create a private group</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  placeholder="Group name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                  className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {topics.map((topic) => (
                    <option key={topic.name} value={topic.name}>
                      {topic.icon} {topic.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => form.name && createGroup.mutate()}
                disabled={!form.name}
                className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Create Group
              </button>
            </motion.div>
          )}

          {managingGroup && selectedGroup ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-[1.75rem] border border-border bg-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{topicIcons[selectedGroup.topic] || "💬"}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedGroup.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Review requests, assign local admins, remove members, and moderate group posts.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/create-post?groupId=${selectedGroup.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <PenSquare size={15} /> Create post
                </Link>
                <button
                  onClick={() => setManagingGroup(null)}
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
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pending requests</p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">{managementData.pendingMembers.length} waiting</h3>
                    <div className="mt-4 space-y-3">
                      {managementData.pendingMembers.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">No pending requests.</p>
                      ) : (
                        managementData.pendingMembers.map((member) => (
                          <div key={member.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-medium text-foreground">{member.profile?.display_name || "User"}</p>
                              <p className="mt-1 text-sm text-muted-foreground">Requested {new Date(member.joined_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => withModerationRefresh(() => updateGroupRequest(member.id, "approved"), "Request approved")}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 hover:bg-emerald-100"
                              >
                                <CheckCircle className="mr-1 inline h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => withModerationRefresh(() => updateGroupRequest(member.id, "rejected"), "Request rejected")}
                                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-700 hover:bg-red-100"
                              >
                                <XCircle className="mr-1 inline h-3.5 w-3.5" />
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-background p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Approved members</p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">{managementData.approvedMembers.length} inside</h3>
                    <div className="mt-4 space-y-3">
                      {managementData.approvedMembers.map((member) => (
                        <div key={member.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{member.profile?.display_name || "User"}</p>
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
                                  onClick={() => withModerationRefresh(() => removeGroupAdmin(selectedGroup.id, member.user_id), "Admin removed")}
                                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-secondary"
                                >
                                  Remove admin
                                </button>
                              ) : (
                                <button
                                  onClick={() => withModerationRefresh(() => addGroupAdmin(selectedGroup.id, member.user_id), "Admin added")}
                                  className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 hover:bg-violet-100"
                                >
                                  <UserPlus className="mr-1 inline h-3.5 w-3.5" />
                                  Make admin
                                </button>
                              )}
                              <button
                                onClick={() => withModerationRefresh(() => removeGroupMember(selectedGroup.id, member.user_id), "Member removed")}
                                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-secondary"
                              >
                                Remove
                              </button>
                              <button
                                onClick={() => withModerationRefresh(() => banGroupUser(selectedGroup.id, member.user_id), "User banned from group")}
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
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Group posts</p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">{managementData.posts.length} scoped posts</h3>
                    <div className="mt-4 space-y-3">
                      {managementData.posts.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                          No group posts yet.
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
                              onClick={() => withModerationRefresh(() => deleteScopedPost(post.id), "Group post deleted")}
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
                        <p className="font-medium text-foreground">{selectedGroup.isOwner ? "You" : "Owner"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Group creator keeps permanent local control.</p>
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                          <Crown className="h-3.5 w-3.5" />
                          Owner
                        </div>
                      </div>
                      {managementData.admins.map((admin) => (
                        <div key={admin.id} className="rounded-2xl border border-border p-4">
                          <p className="font-medium text-foreground">{admin.profile?.display_name || "Admin"}</p>
                          <p className="mt-1 text-sm text-muted-foreground">Can approve members and moderate this group only.</p>
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
                        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">No bans yet.</p>
                      ) : (
                        managementData.bans.map((ban) => (
                          <div key={ban.id} className="flex items-center justify-between rounded-2xl border border-border p-4">
                            <div>
                              <p className="font-medium text-foreground">{ban.profile?.display_name || "User"}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{ban.reason || "No reason supplied"}</p>
                            </div>
                            <button
                              onClick={() => withModerationRefresh(() => unbanGroupUser(selectedGroup.id, ban.user_id), "User unbanned")}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((index) => <div key={index} className="h-40 rounded-xl bg-secondary animate-pulse" />)}
            </div>
          ) : (groups || []).length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <UsersRound className="mx-auto mb-4 opacity-40" size={48} />
              <p>No groups yet. Create the first one.</p>
            </div>
          ) : visibleGroups.length === 0 ? (
            <div className="rounded-[2rem] border border-border bg-card px-8 py-16 text-center">
              <p className="text-lg font-medium text-foreground">No groups match your search.</p>
              <p className="mt-2 text-sm text-muted-foreground">Try a broader keyword or switch filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleGroups.map((group) => (
                <motion.div key={group.id} whileHover={{ y: -2 }} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{topicIcons[group.topic] || "💬"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground truncate">{group.name}</h3>
                      <Lock size={12} className="text-muted-foreground flex-shrink-0" />
                      {group.isOwner ? <Crown className="h-4 w-4 text-amber-500" /> : null}
                      {!group.isOwner && group.isAdmin ? <Shield className="h-4 w-4 text-violet-600" /> : null}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{languageFlags[group.language] || "🌐"} {group.language.toUpperCase()}</span>
                      <span>•</span>
                      <span>{group.memberCount} members</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{group.description || "No description"}</p>
                <div className="flex flex-wrap gap-2">
                  {user ? (
                    group.isBanned ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
                        Banned
                      </span>
                    ) : group.canPost ? (
                      <>
                        <Link
                          to={`/create-post?groupId=${group.id}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                        >
                          <PenSquare size={15} />
                          Create post
                        </Link>
                        {group.canManage ? (
                          <button
                            onClick={() => setManagingGroup((current) => (current === group.id ? null : group.id))}
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                          >
                            Manage
                          </button>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                            Member
                          </span>
                        )}
                      </>
                    ) : group.memberStatus === "pending" ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        Pending
                      </span>
                    ) : group.memberStatus === "rejected" ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
                        Request rejected
                      </span>
                    ) : (
                      <button
                        onClick={() => requestJoin.mutate(group.id)}
                        className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                      >
                        Request to join
                      </button>
                    )
                  ) : null}
                </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Groups;
