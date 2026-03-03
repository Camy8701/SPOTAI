import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { UsersRound, Plus, Lock, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
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

const Groups = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", language: "en", topic: "general" });
  const [managingGroup, setManagingGroup] = useState<string | null>(null);

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (!data) return [];

      const enriched = await Promise.all(
        data.map(async (g) => {
          const { count } = await supabase.from("group_members").select("*", { count: "exact", head: true }).eq("group_id", g.id).eq("status", "approved");
          let memberStatus: string | null = null;
          if (user) {
            const { data: mem } = await supabase.from("group_members").select("status").eq("group_id", g.id).eq("user_id", user.id).maybeSingle();
            memberStatus = mem?.status || null;
          }
          return { ...g, memberCount: count || 0, memberStatus, isOwner: g.created_by === user?.id };
        })
      );
      return enriched;
    },
  });

  // Pending members for group owner
  const { data: pendingMembers } = useQuery({
    queryKey: ["pending-members", managingGroup],
    enabled: !!managingGroup,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", managingGroup!)
        .eq("status", "pending");
      if (error) throw error;

      // Get profiles
      const userIds = (data || []).map((m) => m.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      return (data || []).map((m) => ({
        ...m,
        profile: profiles?.find((p) => p.user_id === m.user_id),
      }));
    },
  });

  const createGroup = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("groups").insert({
        name: form.name, description: form.description,
        language: form.language, topic: form.topic,
        created_by: user!.id, is_private: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Group created!");
      setShowCreate(false);
      setForm({ name: "", description: "", language: "en", topic: "general" });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const requestJoin = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: user!.id, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Join request sent!");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const handleMember = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("group_members").update({ status }).eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member updated");
      queryClient.invalidateQueries({ queryKey: ["pending-members", managingGroup] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <UsersRound className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Groups</h1>
              <p className="text-muted-foreground">Private groups — admin approves members</p>
            </div>
          </div>
          {user && (
            <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90">
              <Plus size={16} /> Create
            </button>
          )}
        </div>

        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 p-6 rounded-xl border border-border bg-card">
            <h3 className="font-bold text-foreground mb-4">Create a Private Group</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-4 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="px-4 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                {languages.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.code.toUpperCase()}</option>)}
              </select>
              <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="px-4 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                {topics.map((t) => <option key={t.name} value={t.name}>{t.icon} {t.name}</option>)}
              </select>
            </div>
            <button onClick={() => form.name && createGroup.mutate()} disabled={!form.name} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50">
              Create Group
            </button>
          </motion.div>
        )}

        {/* Manage pending members modal */}
        {managingGroup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Pending Requests</h3>
              <button onClick={() => setManagingGroup(null)} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
            </div>
            {(pendingMembers || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests</p>
            ) : (
              <div className="space-y-2">
                {pendingMembers!.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="text-sm font-medium text-foreground">{(m as any).profile?.display_name || "User"}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleMember.mutate({ memberId: m.id, status: "approved" })} className="p-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => handleMember.mutate({ memberId: m.id, status: "rejected" })} className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-secondary animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(groups || []).map((group) => (
              <motion.div key={group.id} whileHover={{ y: -2 }} className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{topicIcons[group.topic] || "💬"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground truncate">{group.name}</h3>
                      <Lock size={12} className="text-muted-foreground flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{languageFlags[group.language] || "🌐"} {group.language.toUpperCase()}</span>
                      <span>•</span>
                      <span>{group.memberCount} members</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{group.description || "No description"}</p>
                {user && (
                  <div className="flex gap-2">
                    {group.isOwner ? (
                      <button onClick={() => setManagingGroup(group.id)} className="flex-1 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:opacity-90 flex items-center justify-center gap-1">
                        Manage
                      </button>
                    ) : group.memberStatus === "approved" ? (
                      <span className="flex-1 py-2 text-sm font-medium text-center text-green-600">Member ✓</span>
                    ) : group.memberStatus === "pending" ? (
                      <span className="flex-1 py-2 text-sm font-medium text-center text-amber-600 flex items-center justify-center gap-1"><Clock size={14} /> Pending</span>
                    ) : group.memberStatus === "rejected" ? (
                      <span className="flex-1 py-2 text-sm font-medium text-center text-destructive">Rejected</span>
                    ) : (
                      <button onClick={() => requestJoin.mutate(group.id)} className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                        Request to Join
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Groups;
