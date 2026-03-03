import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Plus, Globe, Search } from "lucide-react";
import { motion } from "framer-motion";
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

  const { data: communities, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("communities").select("*").order("created_at", { ascending: false });
      if (error) throw error;

      // Get member counts and membership status
      if (!data) return [];
      const enriched = await Promise.all(
        data.map(async (c) => {
          const { count } = await supabase.from("community_members").select("*", { count: "exact", head: true }).eq("community_id", c.id);
          let isMember = false;
          if (user) {
            const { data: mem } = await supabase.from("community_members").select("id").eq("community_id", c.id).eq("user_id", user.id).maybeSingle();
            isMember = !!mem;
          }
          return { ...c, memberCount: count || 0, isMember };
        })
      );
      return enriched;
    },
  });

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
      toast.success("Community created!");
      setShowCreate(false);
      setForm({ name: "", description: "", language: "en", topic: "general" });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
    onError: () => toast.error("Failed to create community"),
  });

  const joinCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      const { error } = await supabase.from("community_members").insert({ community_id: communityId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Joined community!");
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });

  const leaveCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      const { error } = await supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Left community");
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });

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
              <p className="text-muted-foreground">Join or create public communities</p>
            </div>
          </div>
          {user && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> Create
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8 p-6 rounded-xl border border-border bg-card"
          >
            <h3 className="font-bold text-foreground mb-4">Create a Community</h3>
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
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>{l.flag} {l.code.toUpperCase()}</option>
                ))}
              </select>
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="px-4 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {topics.map((t) => (
                  <option key={t.name} value={t.name}>{t.icon} {t.name}</option>
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

        {/* Communities grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-secondary animate-pulse rounded-xl" />)}
          </div>
        ) : (communities || []).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Globe className="mx-auto mb-4 opacity-40" size={48} />
            <p>No communities yet. Create the first one!</p>
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
                    <h3 className="font-bold text-foreground truncate">{community.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{languageFlags[community.language] || "🌐"} {community.language.toUpperCase()}</span>
                      <span>•</span>
                      <span>{community.memberCount} members</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{community.description || "No description"}</p>
                {user && (
                  community.isMember ? (
                    <button
                      onClick={() => leaveCommunity.mutate(community.id)}
                      className="w-full py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      onClick={() => joinCommunity.mutate(community.id)}
                      className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Join Community
                    </button>
                  )
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Communities;
