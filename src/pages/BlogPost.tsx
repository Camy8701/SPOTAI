import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Share2, ArrowLeft, Send, Trash2, Reply, ThumbsUp, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

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

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post) {
      fetchComments();
      fetchLikes();
      if (user) {
        checkUserLike();
        checkUserSave();
      }
    }
  }, [post, user]);

  const fetchPost = async () => {
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

  return (
    <Layout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/home" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase">{post.category}</span>
            {post.tags?.map((tag) => (
              <span key={tag} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>}
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
          <div className="relative aspect-video rounded-xl overflow-hidden mb-10">
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12 text-foreground leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
          {post.content}
        </div>

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
      </article>
    </Layout>
  );
};

export default BlogPost;
