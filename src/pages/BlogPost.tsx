import { useState, useEffect, type ReactNode } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Share2, ArrowLeft, Send, Trash2, Reply, ThumbsUp, Users, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { type AudioQueueItem } from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { NEURALINK_STORY, addNeuralinkLead } from "@/data/fallback/neuralinkStory";
import { NO_CODE_AUTOMATION_POST } from "@/data/fallback/noCodeAutomationPost";
import { MANUS_AI_TOOL_POST } from "@/data/fallback/manusAiToolPost";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  audio_url: string | null;
  category: string;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  reading_time_minutes: number | null;
  author_id: string | null;
  slug: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profile?: { display_name: string | null; avatar_url: string | null };
  likeCount: number;
  isLiked: boolean;
  replies: Comment[];
}

interface LikerProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

type EditorialSection = {
  id: string;
  title: string;
  blocks: string[];
};

const slugifySection = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const isHeadingCandidate = (block: string) => {
  if (block.includes("\n")) return false;

  const text = block.trim();
  if (!text || text.length < 4 || text.length > 120) return false;
  if (/^[-*•]/.test(text)) return false;
  if (/^\|/.test(text)) return false;
  if (/^website:/i.test(text)) return false;
  if (/^https?:\/\//i.test(text)) return false;

  if (/^\d+\.\s+/.test(text)) return true;
  if (/[?:]$/.test(text)) return true;
  if (!/[.!]$/.test(text)) return true;

  const words = text.split(/\s+/).length;
  return words <= 12;
};

const buildEditorialSections = (content: string): EditorialSection[] => {
  const blocks = content
    .split(/\n{2,}/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const sections: EditorialSection[] = [];
  const usedIds = new Set<string>();
  let current: EditorialSection | null = null;

  blocks.forEach((block, index) => {
    if (isHeadingCandidate(block)) {
      let idBase = slugifySection(block) || `section-${index + 1}`;
      while (usedIds.has(idBase)) {
        idBase = `${idBase}-${index + 1}`;
      }
      usedIds.add(idBase);
      current = { id: idBase, title: block, blocks: [] };
      sections.push(current);
      return;
    }

    if (!current) {
      current = { id: "overview", title: "Overview", blocks: [] };
      if (!usedIds.has(current.id)) {
        usedIds.add(current.id);
        sections.push(current);
      }
    }

    current.blocks.push(block);
  });

  return sections.filter((section) => section.blocks.length > 0 || section.title === "Overview");
};

const buildNoCodeAutomationSections = (content: string): EditorialSection[] => {
  const sections: EditorialSection[] = [];
  const usedIds = new Set<string>();
  const majorHeadings = new Set([
    "which one should you choose",
    "strong conclusion",
    "seo version",
    "founder-style opinionated take",
    "comparison table (pricing, best for, pros, cons)",
    "final recommendation framework",
  ]);

  const makeSection = (title: string, idHint: string) => {
    let idBase = slugifySection(idHint) || slugifySection(title) || "section";
    while (usedIds.has(idBase)) {
      idBase = `${idBase}-${usedIds.size + 1}`;
    }
    usedIds.add(idBase);
    return { id: idBase, title, blocks: [] as string[] };
  };

  let current = makeSection("Introduction", "introduction");
  sections.push(current);

  const lines = content.split("\n");
  let buffer: string[] = [];

  const flushBuffer = () => {
    const text = buffer.join("\n").trim();
    if (text) current.blocks.push(text);
    buffer = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushBuffer();
      return;
    }

    const toolMatch = line.match(/^([1-9]|10)\.\s+(.+)$/);
    if (toolMatch && !line.endsWith(".")) {
      flushBuffer();
      current = makeSection(line, `tool-${toolMatch[1]}-${toolMatch[2]}`);
      sections.push(current);
      return;
    }

    if (majorHeadings.has(line.toLowerCase())) {
      flushBuffer();
      current = makeSection(line, line);
      sections.push(current);
      return;
    }

    buffer.push(line);
  });

  flushBuffer();

  return sections.filter(
    (section) =>
      section.blocks.length > 0 ||
      section.title === "Introduction" ||
      /^([1-9]|10)\.\s+/.test(section.title),
  );
};

const splitMarkdownTableRow = (row: string) =>
  row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const parseMarkdownTable = (lines: string[]) => {
  if (lines.length < 3) return null;
  if (!lines[0].includes("|")) return null;
  if (!/^\|?\s*[-:| ]+\|?\s*$/.test(lines[1])) return null;

  const headers = splitMarkdownTableRow(lines[0]);
  const rows = lines
    .slice(2)
    .filter((line) => line.includes("|"))
    .map((line) => splitMarkdownTableRow(line))
    .filter((row) => row.length > 0 && row.some((cell) => cell.length > 0));

  if (headers.length === 0 || rows.length === 0) return null;
  return { headers, rows };
};

const MANUS_REFERRAL_URL =
  "https://manus.im/invitation/NCX3NE3ZNFW5MZH?utm_source=invitation&utm_medium=social&utm_campaign=copy_link";
const MANUS_HIGHLIGHT_PATTERN = /\b(MANUS AI|MANUS)\b/gi;

const renderManusReferralText = (text: string, enableHighlight: boolean): ReactNode => {
  if (!enableHighlight || !text) return text;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MANUS_HIGHLIGHT_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    const label = match[0];
    nodes.push(
      <a
        key={`manus-link-${index}-${label}`}
        href={MANUS_REFERRAL_URL}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-blue-600 underline decoration-blue-400 underline-offset-2 transition-colors hover:text-blue-700"
      >
        {label}
      </a>,
    );

    lastIndex = index + label.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : text;
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { currentTrack, playAudio } = useAudioPlayer();

  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState<string>("SpotAI Team");
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);
  const [likersOpen, setLikersOpen] = useState(false);
  const [likers, setLikers] = useState<LikerProfile[]>([]);
  const [likersLoading, setLikersLoading] = useState(false);
  const [storyAudioQueue, setStoryAudioQueue] = useState<AudioQueueItem[]>([]);
  const [storySlugMap, setStorySlugMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post) {
      if (post.id === NEURALINK_STORY.id) {
        if (post.audio_url) {
          setStoryAudioQueue([
            {
              id: post.id,
              src: post.audio_url,
              title: post.title,
            },
          ]);
        }
        return;
      }
      fetchComments();
      fetchLikes();
      if (user) {
        checkUserLike();
        checkUserSave();
      }
    }
  }, [post, user]);

  useEffect(() => {
    if (!post?.audio_url || post.category !== "story") {
      setStoryAudioQueue([]);
      setStorySlugMap({});
      return;
    }

    let cancelled = false;

    const fetchStoryQueue = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id,title,slug,audio_url")
        .eq("status", "published")
        .eq("category", "story")
        .not("audio_url", "is", null)
        .order("created_at", { ascending: false });

      const merged = addNeuralinkLead(data || []);
      const queue = merged
        .filter(
          (
            item,
          ): item is {
            id: string;
            title: string;
            slug: string;
            audio_url: string;
          } => Boolean(item.audio_url),
        )
        .filter(
          (item, index, collection) =>
            collection.findIndex((entry) => entry.slug === item.slug) === index,
        )
        .map((item) => ({
          id: item.id,
          src: item.audio_url,
          title: item.title,
        }));
      const slugMap = merged.reduce<Record<string, string>>((acc, item) => {
        if (item.audio_url) {
          acc[item.id] = item.slug;
        }
        return acc;
      }, {});

      const currentItem = {
        id: post.id,
        src: post.audio_url,
        title: post.title,
      };

      if (!queue.some((item) => item.id === currentItem.id)) {
        queue.unshift(currentItem);
      }

      if (!cancelled) {
        setStoryAudioQueue(queue);
        setStorySlugMap(slugMap);
      }
    };

    void fetchStoryQueue();

    return () => {
      cancelled = true;
    };
  }, [post?.audio_url, post?.category, post?.id, post?.title]);

  useEffect(() => {
    if (!post || post.category !== "story" || !currentTrack) return;
    if (currentTrack.id === post.id) return;

    const nextSlug = storySlugMap[currentTrack.id];
    if (nextSlug && nextSlug !== slug) {
      navigate(`/post/${nextSlug}`);
    }
  }, [currentTrack, navigate, post, slug, storySlugMap]);

  const fetchPost = async () => {
    if (slug === NEURALINK_STORY.slug) {
      setPost(NEURALINK_STORY as BlogPostData);
      setAuthorName("Elena Marole");
      setRelatedPosts([]);
      setLoading(false);
      return;
    }

    if (slug === NO_CODE_AUTOMATION_POST.slug) {
      setPost(NO_CODE_AUTOMATION_POST as unknown as BlogPostData);
      setAuthorName(NO_CODE_AUTOMATION_POST.author_name);
      setRelatedPosts([]);
      setLoading(false);
      return;
    }

    if (slug === MANUS_AI_TOOL_POST.slug) {
      setPost(MANUS_AI_TOOL_POST as unknown as BlogPostData);
      setAuthorName(MANUS_AI_TOOL_POST.author_name);
      setRelatedPosts([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug!)
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }
    setPost(data);

    if (data.author_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", data.author_id)
        .single();
      if (profile?.display_name) setAuthorName(profile.display_name);
    }

    const { data: related } = await supabase
      .from("blog_posts")
      .select("id,title,slug,featured_image,category,excerpt,published_at,created_at,content,tags,reading_time_minutes,author_id")
      .eq("status", "published")
      .eq("category", data.category)
      .neq("id", data.id)
      .order("created_at", { ascending: false })
      .limit(3);
    if (related) setRelatedPosts(related as BlogPostData[]);

    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post!.id)
      .order("created_at", { ascending: true });

    if (!data) return;

    const userIds = [...new Set(data.map((c) => c.user_id))];
    const [profilesRes, likesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds),
      user
        ? supabase.from("likes").select("comment_id").eq("user_id", user.id).in("comment_id", data.map((c) => c.id))
        : Promise.resolve({ data: [] }),
    ]);

    const profileMap = new Map(profilesRes.data?.map((p) => [p.user_id, p]));
    const userLikedComments = new Set((likesRes.data || []).map((l) => l.comment_id));

    // Get like counts for all comments
    const commentIds = data.map((c) => c.id);
    const { data: commentLikes } = await supabase
      .from("likes")
      .select("comment_id")
      .in("comment_id", commentIds);

    const likeCountMap = new Map<string, number>();
    (commentLikes || []).forEach((l) => {
      if (l.comment_id) likeCountMap.set(l.comment_id, (likeCountMap.get(l.comment_id) || 0) + 1);
    });

    const allComments: Comment[] = data.map((c) => ({
      ...c,
      profile: profileMap.get(c.user_id) || undefined,
      likeCount: likeCountMap.get(c.id) || 0,
      isLiked: userLikedComments.has(c.id),
      replies: [],
    }));

    // Build tree
    const topLevel: Comment[] = [];
    const byId = new Map(allComments.map((c) => [c.id, c]));
    for (const c of allComments) {
      if (c.parent_id && byId.has(c.parent_id)) {
        byId.get(c.parent_id)!.replies.push(c);
      } else {
        topLevel.push(c);
      }
    }

    setComments(topLevel);
  };

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post!.id);
    setLikeCount(count || 0);
  };

  const checkUserLike = async () => {
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post!.id)
      .eq("user_id", user!.id)
      .is("comment_id", null)
      .maybeSingle();
    setIsLiked(!!data);
  };

  const checkUserSave = async () => {
    const { data } = await supabase
      .from("saved_posts")
      .select("id")
      .eq("post_id", post!.id)
      .eq("user_id", user!.id)
      .maybeSingle();
    setIsSaved(!!data);
  };

  const toggleLike = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to like posts." });
      return;
    }
    if (isLiked) {
      await supabase.from("likes").delete().eq("post_id", post!.id).eq("user_id", user.id).is("comment_id", null);
      setIsLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from("likes").insert({ post_id: post!.id, user_id: user.id });
      setIsLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!user) {
      toast({ title: "Sign in required" });
      return;
    }
    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("likes").delete().eq("id", existing.id);
    } else {
      await supabase.from("likes").insert({ comment_id: commentId, user_id: user.id });
    }
    fetchComments();
  };

  const toggleSave = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save posts." });
      return;
    }
    if (isSaved) {
      await supabase.from("saved_posts").delete().eq("post_id", post!.id).eq("user_id", user.id);
      setIsSaved(false);
      toast({ title: "Removed from saved" });
    } else {
      await supabase.from("saved_posts").insert({ post_id: post!.id, user_id: user.id });
      setIsSaved(true);
      toast({ title: "Post saved!" });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post!.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const submitComment = async (parentId?: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to comment." });
      return;
    }
    const content = parentId ? replyContent.trim() : newComment.trim();
    if (!content) return;

    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      post_id: post!.id,
      user_id: user.id,
      content,
      parent_id: parentId || null,
    });
    if (error) {
      toast({ title: "Error", description: "Could not post comment.", variant: "destructive" });
    } else {
      if (parentId) {
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
      fetchComments();
    }
    setSubmitting(false);
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    fetchComments();
    toast({ title: "Comment deleted" });
  };

  const showLikers = async () => {
    setLikersOpen(true);
    setLikersLoading(true);
    const { data: likesData } = await supabase
      .from("likes")
      .select("user_id")
      .eq("post_id", post!.id)
      .is("comment_id", null)
      .limit(50);

    if (likesData && likesData.length > 0) {
      const userIds = [...new Set(likesData.map((l) => l.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      setLikers(profiles || []);
    } else {
      setLikers([]);
    }
    setLikersLoading(false);
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`bg-secondary rounded-xl p-4 ${depth > 0 ? "ml-8 border-l-2 border-primary/20" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <Link to={`/user/${comment.user_id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {comment.profile?.avatar_url ? (
            <img src={comment.profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              {(comment.profile?.display_name || "U")[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-foreground text-sm hover:underline">
              {comment.profile?.display_name || "Anonymous"}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(comment.created_at), "MMM d, yyyy · h:mm a")}
            </p>
          </div>
        </Link>
        {user?.id === comment.user_id && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteComment(comment.id)}>
            <Trash2 size={13} />
          </Button>
        )}
      </div>

      <p className="text-foreground text-sm leading-relaxed mb-2">{comment.content}</p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleCommentLike(comment.id)}
          className={`flex items-center gap-1 text-xs transition-colors ${comment.isLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ThumbsUp size={13} fill={comment.isLiked ? "currentColor" : "none"} />
          {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
        </button>

        {user && depth === 0 && (
          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Reply size={13} /> Reply
          </button>
        )}
      </div>

      {/* Reply input */}
      {replyingTo === comment.id && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[60px] text-sm bg-background"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => submitComment(comment.id)} disabled={submitting || !replyContent.trim()} className="gap-1">
              <Send size={13} /> Reply
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyContent(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </motion.div>
  );

  if (user && profile?.is_platform_banned) {
    return <Navigate to="/account-restricted" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            <div className="h-64 bg-muted rounded mt-8" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The post you're looking for doesn't exist.</p>
          <Link to="/home"><Button>Back to Home</Button></Link>
        </div>
      </Layout>
    );
  }

  const flatCommentCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);
  const isStaticFallbackPost =
    post.id === NEURALINK_STORY.id ||
    post.id === NO_CODE_AUTOMATION_POST.id ||
    post.id === MANUS_AI_TOOL_POST.id;
  const isManusSpotlightPost = post.id === MANUS_AI_TOOL_POST.id;
  const isEditorialNewsPost =
    post.id === NO_CODE_AUTOMATION_POST.id ||
    post.id === MANUS_AI_TOOL_POST.id ||
    post.category?.toLowerCase() === "news";

  const summaryPoints = (() => {
    if (post.id === NO_CODE_AUTOMATION_POST.id) {
      return [
        "Traditional no-code tools are strongest for repetitive execution workflows and system handoffs.",
        "Context-aware AI agent layers add reasoning and planning where plain trigger-action automation hits limits.",
        "The practical strategy is layered: automate repeatable work first, then add AI context where judgment is required.",
      ];
    }

    if (post.id === MANUS_AI_TOOL_POST.id) {
      return [
        "MANUS AI is positioned as an execution agent that combines planning, research, and implementation, not only code output.",
        "The strongest fit appears when teams start with goals and ambiguity, not fully-detailed technical specs.",
        "Lovable remains strong for clear-spec, fast-code scenarios, while MANUS AI is better for end-to-end delivery workflows.",
      ];
    }

    const points: string[] = [];
    if (post.excerpt) points.push(post.excerpt);
    if (Array.isArray(post.tags) && post.tags.length > 0) {
      points.push(`Topics: ${post.tags.slice(0, 4).join(", ")}`);
    }
    if (post.reading_time_minutes) {
      points.push(`${post.reading_time_minutes} minute read with practical implementation notes.`);
    }
    return points.slice(0, 3);
  })();
  const shareUrl = encodeURIComponent(
    typeof window !== "undefined" ? window.location.href : `/post/${post.slug}`,
  );
  const shareText = encodeURIComponent(post.title);
  const editorialSections = isEditorialNewsPost
    ? post.id === NO_CODE_AUTOMATION_POST.id
      ? buildNoCodeAutomationSections(post.content)
      : buildEditorialSections(post.content)
    : [];
  const tocSections =
    post.id === NO_CODE_AUTOMATION_POST.id
      ? editorialSections.filter(
          (section) =>
            section.title === "Introduction" || /^([1-9]|10)\.\s+/.test(section.title),
        )
      : editorialSections;

  const renderEditorialBlock = (block: string, keyPrefix: string) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return null;

    const isBulletList = lines.every((line) => /^[-*]\s+/.test(line));
    if (isBulletList) {
      return (
        <ul key={keyPrefix} className="list-disc space-y-2 pl-5 text-base leading-8 text-foreground/90">
          {lines.map((line, index) => (
            <li key={`${keyPrefix}-li-${index}`}>
              {renderManusReferralText(line.replace(/^[-*]\s+/, ""), isManusSpotlightPost)}
            </li>
          ))}
        </ul>
      );
    }

    const isNumberedList = lines.every((line) => /^\d+\.\s+/.test(line));
    if (isNumberedList) {
      return (
        <ol key={keyPrefix} className="list-decimal space-y-2 pl-5 text-base leading-8 text-foreground/90">
          {lines.map((line, index) => (
            <li key={`${keyPrefix}-ol-${index}`}>
              {renderManusReferralText(line.replace(/^\d+\.\s+/, ""), isManusSpotlightPost)}
            </li>
          ))}
        </ol>
      );
    }

    const tableData = parseMarkdownTable(lines);
    if (tableData) {
      return (
        <div key={keyPrefix} className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-secondary">
              <tr>
                {tableData.headers.map((header, index) => (
                  <th
                    key={`${keyPrefix}-th-${index}`}
                    className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr key={`${keyPrefix}-tr-${rowIndex}`} className="align-top">
                  {tableData.headers.map((_, colIndex) => (
                    <td
                      key={`${keyPrefix}-td-${rowIndex}-${colIndex}`}
                      className="border-b border-border px-4 py-3 text-sm leading-7 text-foreground/90"
                    >
                      {renderManusReferralText(row[colIndex] || "", isManusSpotlightPost)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const imageLineMatches = lines
      .map((line) => line.match(/^!\[(.*?)\]\((.*?)\)$/))
      .filter((entry): entry is RegExpMatchArray => Boolean(entry));
    if (imageLineMatches.length === lines.length) {
      return (
        <div key={keyPrefix} className="grid gap-4">
          {imageLineMatches.map((match, index) => (
            <figure
              key={`${keyPrefix}-image-${index}`}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <img
                src={match[2]}
                alt={match[1] || "Article visual"}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
              {match[1] ? (
                <figcaption className="px-4 py-2 text-sm text-muted-foreground">{match[1]}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      );
    }

    return (
      <div key={keyPrefix} className="space-y-4">
        {lines.map((line, index) => {
          const inlineImage = line.match(/^!\[(.*?)\]\((.*?)\)$/);
          if (inlineImage) {
            return (
              <figure
                key={`${keyPrefix}-inline-image-${index}`}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <img
                  src={inlineImage[2]}
                  alt={inlineImage[1] || "Article visual"}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </figure>
            );
          }

          return (
            <p key={`${keyPrefix}-p-${index}`} className="text-lg leading-8 text-foreground/90">
              {renderManusReferralText(line, isManusSpotlightPost)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Link
            to="/library?section=news_articles"
            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition-colors hover:border-orange-300 hover:text-orange-800"
          >
            <ArrowLeft size={16} /> Back to articles
          </Link>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>

        <header className="mb-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase">{post.category}</span>
            {post.tags?.map((tag) => (
              <span key={tag} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            {renderManusReferralText(post.title, isManusSpotlightPost)}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground mb-4">
              {renderManusReferralText(post.excerpt, isManusSpotlightPost)}
            </p>
          )}
          {post.audio_url && (
            <div className="mb-5">
              <motion.button
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  playAudio({
                    track: {
                      id: post.id,
                      src: post.audio_url!,
                      title: post.title,
                    },
                    queue: storyAudioQueue,
                    queueItemLabel: "story",
                  })
                }
              >
                Listen
              </motion.button>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {post.author_id ? (
              <Link to={`/user/${post.author_id}`} className="hover:underline">By {authorName}</Link>
            ) : (
              <span>By {authorName}</span>
            )}
            <span>•</span>
            <span>{format(new Date(post.published_at || post.created_at), "MMMM d, yyyy")}</span>
            {post.reading_time_minutes && (
              <><span>•</span><span>{post.reading_time_minutes} min read</span></>
            )}
          </div>
        </header>

        {post.featured_image && (
          <div className="relative mb-10 max-w-5xl overflow-hidden rounded-2xl border border-border">
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className={isEditorialNewsPost ? "grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]" : ""}>
          {isEditorialNewsPost ? (
            <aside className="space-y-5 lg:sticky lg:top-24 self-start">
              <div className="rounded-3xl border border-slate-200/80 bg-white/65 p-6 text-slate-900 shadow-[0_14px_34px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/15 dark:bg-[#0f1728]/55 dark:text-white dark:shadow-[0_18px_40px_rgba(2,6,23,0.35)]">
                <h3 className="text-3xl font-black leading-tight text-slate-900 dark:text-white">
                  Want to learn more?
                  <br />
                  Click here.
                </h3>
                <a
                  href="mailto:hello@spotai.ai?subject=SpotAI%20Free%20Trial%20Request"
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2 text-base font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Free Trial
                </a>
              </div>

              {tocSections.length > 0 ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white/65 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/15 dark:bg-[#0f1728]/55 dark:shadow-[0_18px_40px_rgba(2,6,23,0.35)]">
                  <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Table of contents
                  </p>
                  <div className="mt-3 border-l-2 border-slate-300/90 pl-3 dark:border-white/35">
                    <ul className="space-y-2">
                      {tocSections.map((section) => (
                        <li key={`toc-${section.id}`}>
                          <button
                            type="button"
                            onClick={() => {
                              const element = document.getElementById(section.id);
                              if (element) {
                                element.scrollIntoView({ behavior: "smooth", block: "start" });
                              }
                            }}
                            className={`text-left leading-7 transition-colors ${
                              /^([1-9]|10)\.\s+/.test(section.title)
                                ? "text-base font-extrabold text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-white/90"
                                : "text-[15px] font-semibold text-slate-800/90 hover:text-slate-900 dark:text-white/90 dark:hover:text-white"
                            }`}
                          >
                            {section.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">Share</p>
                <div className="mt-3 flex items-center gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-full border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    X
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-full border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    in
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-full border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    f
                  </a>
                  <a
                    href={`https://www.instagram.com/?url=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-full border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    ig
                  </a>
                </div>
              </div>
            </aside>
          ) : null}

          <div>
            {isEditorialNewsPost && summaryPoints.length > 0 ? (
              <section className="mb-8 rounded-3xl border border-emerald-200 bg-[linear-gradient(90deg,#f3f7ff_0%,#edf8ef_100%)] p-6">
                <p className="text-sm font-semibold text-indigo-700">AI Summary by SpotAI</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-foreground/90">
                  {summaryPoints.map((point, index) => (
                    <li key={`${point}-${index}`}>
                      {renderManusReferralText(point, isManusSpotlightPost)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {isEditorialNewsPost && editorialSections.length > 0 ? (
              <div className="mb-12 space-y-10">
                {editorialSections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-24">
                    <h2
                      className={`leading-tight tracking-tight text-foreground ${
                        /^([1-9]|10)\.\s+/.test(section.title)
                          ? "text-5xl font-black"
                          : "text-4xl font-semibold"
                      }`}
                      style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                    >
                      {renderManusReferralText(section.title, isManusSpotlightPost)}
                    </h2>
                    <div className="mt-5 space-y-5">
                      {section.blocks.map((block, index) =>
                        renderEditorialBlock(block, `${section.id}-${index}`),
                      )}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div
                className="prose prose-lg dark:prose-invert max-w-none mb-12 text-foreground leading-relaxed"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {post.content}
              </div>
            )}

            {isEditorialNewsPost ? (
              <section className="mb-12 overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#2f35ea_0%,#3341ff_52%,#4a5bff_100%)] px-8 py-14 text-center text-white">
                <h3 className="text-4xl font-semibold tracking-tight">Work AI that works.</h3>
                <p className="mx-auto mt-3 max-w-2xl text-white/85">
                  Build practical automation layers your team actually adopts with a free trial start.
                </p>
                <a
                  href="mailto:hello@spotai.ai?subject=SpotAI%20Free%20Trial%20Request"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-red-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Free Trial
                  <ExternalLink size={15} />
                </a>
              </section>
            ) : null}
          </div>
        </div>

        {!isStaticFallbackPost && (
          <>
            {/* Action Bar */}
            <div className="sticky bottom-6 z-10 flex justify-center mb-12">
              <motion.div className="flex items-center gap-1 bg-card border border-border rounded-full px-2 py-2 shadow-lg" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Button variant="ghost" size="sm" onClick={toggleLike} className={`rounded-full gap-2 ${isLiked ? "text-red-500" : ""}`}>
                  <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                  <span>{likeCount}</span>
                </Button>

                {likeCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={showLikers} className="rounded-full gap-1" title="See who liked this">
                    <Users size={16} />
                  </Button>
                )}

                <Button variant="ghost" size="sm" className="rounded-full gap-2" onClick={() => document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth" })}>
                  <MessageCircle size={18} />
                  <span>{flatCommentCount}</span>
                </Button>

                <Button variant="ghost" size="sm" onClick={toggleSave} className={`rounded-full ${isSaved ? "text-yellow-500" : ""}`}>
                  <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                </Button>

                <Button variant="ghost" size="sm" onClick={handleShare} className="rounded-full">
                  <Share2 size={18} />
                </Button>
              </motion.div>
            </div>

            {/* Likers Dialog */}
            <Dialog open={likersOpen} onOpenChange={setLikersOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Liked by</DialogTitle>
                </DialogHeader>
                {likersLoading ? (
                  <div className="py-4 text-center text-muted-foreground text-sm">Loading...</div>
                ) : likers.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground text-sm">No likes yet</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {likers.map((liker) => (
                      <Link
                        key={liker.user_id}
                        to={`/user/${liker.user_id}`}
                        onClick={() => setLikersOpen(false)}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary transition-colors"
                      >
                        {liker.avatar_url ? (
                          <img src={liker.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {(liker.display_name || "U")[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium text-foreground">{liker.display_name || "Unnamed"}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Comments Section */}
            <section id="comments-section" className="border-t border-border pt-10">
              <h2 className="text-2xl font-bold text-foreground mb-6">Comments ({flatCommentCount})</h2>

              <div className="mb-8">
                <Textarea
                  placeholder={user ? "Write a comment..." : "Sign in to comment"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!user}
                  className="mb-3 min-h-[100px] bg-secondary"
                />
                <Button onClick={() => submitComment()} disabled={submitting || !newComment.trim() || !user} className="gap-2">
                  <Send size={16} /> Post Comment
                </Button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </AnimatePresence>
                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="border-t border-border pt-10 mt-10">
                <h2 className="text-2xl font-bold text-foreground mb-6">Related Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((rp) => (
                    <Link to={`/post/${rp.slug}`} key={rp.id} className="group">
                      <div className="bg-secondary rounded-xl overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
                        {rp.featured_image && (
                          <div className="aspect-video overflow-hidden">
                            <img src={rp.featured_image} alt={rp.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                          </div>
                        )}
                        <div className="p-4">
                          <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-semibold uppercase">{rp.category}</span>
                          <h3 className="font-semibold text-foreground mt-2 line-clamp-2 group-hover:text-primary transition-colors">{rp.title}</h3>
                          {rp.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{rp.excerpt}</p>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </article>
    </Layout>
  );
};

export default BlogPost;
