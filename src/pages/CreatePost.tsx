import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PenSquare, HelpCircle, Users, UsersRound, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const CreatePost = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialType = searchParams.get("type") || "post";
  const initialCommunityId = searchParams.get("communityId");
  const initialGroupId = searchParams.get("groupId");

  const [type, setType] = useState<"post" | "question">(initialType as "post" | "question");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [communityOptions, setCommunityOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [groupOptions, setGroupOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [scopeType, setScopeType] = useState<"global" | "community" | "group">(
    initialGroupId ? "group" : initialCommunityId ? "community" : "global",
  );
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(initialCommunityId || "");
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || "");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [navigate, user]);

  useEffect(() => {
    const loadScopes = async () => {
      if (!user) return;

      const [
        createdCommunitiesRes,
        memberCommunitiesRes,
        createdGroupsRes,
        memberGroupsRes,
      ] = await Promise.all([
        supabase.from("communities").select("id, name").eq("created_by", user.id).order("name"),
        supabase.from("community_members").select("community_id").eq("user_id", user.id),
        supabase.from("groups").select("id, name").eq("created_by", user.id).order("name"),
        supabase.from("group_members").select("group_id").eq("user_id", user.id).eq("status", "approved"),
      ]);

      const communityIds = Array.from(
        new Set([
          ...(createdCommunitiesRes.data || []).map((item) => item.id),
          ...(memberCommunitiesRes.data || []).map((item) => item.community_id),
        ]),
      );

      const groupIds = Array.from(
        new Set([
          ...(createdGroupsRes.data || []).map((item) => item.id),
          ...(memberGroupsRes.data || []).map((item) => item.group_id),
        ]),
      );

      const [communityLookupRes, groupLookupRes] = await Promise.all([
        communityIds.length > 0
          ? supabase.from("communities").select("id, name").in("id", communityIds).order("name")
          : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
        groupIds.length > 0
          ? supabase.from("groups").select("id, name").in("id", groupIds).order("name")
          : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
      ]);

      setCommunityOptions(communityLookupRes.data || []);
      setGroupOptions(groupLookupRes.data || []);
    };

    void loadScopes();
  }, [user]);

  useEffect(() => {
    if (scopeType === "community" && !selectedCommunityId && communityOptions[0]) {
      setSelectedCommunityId(communityOptions[0].id);
    }
    if (scopeType === "group" && !selectedGroupId && groupOptions[0]) {
      setSelectedGroupId(groupOptions[0].id);
    }
  }, [scopeType, communityOptions, groupOptions, selectedCommunityId, selectedGroupId]);

  const canPostToCommunity = communityOptions.length > 0;
  const canPostToGroup = groupOptions.length > 0;
  const isScopedPost = scopeType !== "global";
  const submitLabel = useMemo(() => {
    if (scopeType === "community") return `Publish to community`;
    if (scopeType === "group") return `Publish to group`;
    return `Submit ${type === "question" ? "Question" : "Post"}`;
  }, [scopeType, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "Please sign in before posting.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({ title: "Error", description: "Title and content are required.", variant: "destructive" });
      return;
    }

    if (scopeType === "community" && !selectedCommunityId) {
      toast({ title: "Error", description: "Choose a community before publishing.", variant: "destructive" });
      return;
    }

    if (scopeType === "group" && !selectedGroupId) {
      toast({ title: "Error", description: "Choose a group before publishing.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

    const { error } = await supabase.from("blog_posts").insert({
      title: type === "question" ? `[Question] ${title}` : title,
      content,
      slug,
      author_id: user.id,
      status: isScopedPost ? "published" : "draft",
      category: type === "question" ? "opinion" : "story",
      tags: type === "question" ? ["question"] : [],
      community_id: scopeType === "community" ? selectedCommunityId : null,
      group_id: scopeType === "group" ? selectedGroupId : null,
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Success",
        description: isScopedPost
          ? `Your ${type} is now live in its ${scopeType}.`
          : `Your ${type} has been submitted for review.`,
      });
      navigate(scopeType === "group" ? "/groups" : scopeType === "community" ? "/communities" : "/dashboard");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Create a {type === "question" ? "Question" : "Post"}</h1>

        {/* Type toggle */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setType("post")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              type === "post"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            <PenSquare size={16} />
            Post
          </button>
          <button
            onClick={() => setType("question")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              type === "question"
                ? "bg-destructive text-destructive-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <HelpCircle size={16} />
            Question
          </button>
        </div>

        {type === "question" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 mb-6 flex items-center gap-2"
          >
            <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm text-foreground font-medium">This will be posted as a Question — visible with a red indicator</span>
          </motion.div>
        )}

        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Globe2 size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Where should this post live?</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              {
                key: "global" as const,
                title: "Main library",
                description: "Draft-based post flow for the wider SpotAI feed.",
                icon: Globe2,
                disabled: false,
              },
              {
                key: "community" as const,
                title: "Community post",
                description: canPostToCommunity ? "Publish directly inside one of your communities." : "Join a community first to publish there.",
                icon: Users,
                disabled: !canPostToCommunity,
              },
              {
                key: "group" as const,
                title: "Group post",
                description: canPostToGroup ? "Publish directly inside one of your approved groups." : "Join or create a group first to publish there.",
                icon: UsersRound,
                disabled: !canPostToGroup,
              },
            ].map((option) => {
              const selected = scopeType === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => setScopeType(option.key)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/30"
                  } ${option.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <option.icon size={18} className={selected ? "text-primary" : "text-muted-foreground"} />
                  <p className="mt-3 font-medium text-foreground">{option.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                </button>
              );
            })}
          </div>

          {scopeType === "community" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">Choose community</label>
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground"
              >
                <option value="">Select a community</option>
                {communityOptions.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {scopeType === "group" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">Choose group</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground"
              >
                <option value="">Select a group</option>
                {groupOptions.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "question" ? "What's your question?" : "Give your post a title"}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === "question" ? "Explain your question in detail..." : "Write your post content..."}
              rows={10}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-y"
              required
            />
          </div>
          <motion.button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? "Submitting..." : submitLabel}
          </motion.button>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePost;
