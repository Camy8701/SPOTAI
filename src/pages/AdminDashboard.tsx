import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import {
  FileText,
  Users,
  BarChart3,
  Heart,
  Bookmark,
  MessageSquare,
  HelpCircle,
  ArrowLeft,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Eye,
  PenLine,
  Crown,
  ShoppingCart,
  DollarSign,
  Calendar,
  Gift,
  BookOpen,
  Headphones,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type Tab = "analytics" | "posts" | "users" | "quiz" | "freebies";

// ─── Analytics / Overview Tab ───
function AnalyticsOverviewTab() {
  const [stats, setStats] = useState({ posts: 0, users: 0, comments: 0, likes: 0, saved: 0, quizResults: 0, published: 0, drafts: 0 });
  const [recentLikes, setRecentLikes] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      supabase.from("likes").select("id", { count: "exact", head: true }),
      supabase.from("saved_posts").select("id", { count: "exact", head: true }),
      supabase.from("quiz_results").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("likes").select("*, blog_posts(title)").order("created_at", { ascending: false }).limit(10),
      supabase.from("comments").select("*, blog_posts(title), profiles(display_name)").order("created_at", { ascending: false }).limit(10),
      supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(10),
    ]).then(([posts, users, comments, likes, saved, quiz, published, drafts, rLikes, rComments, rActivities]) => {
      setStats({
        posts: posts.count ?? 0,
        users: users.count ?? 0,
        comments: comments.count ?? 0,
        likes: likes.count ?? 0,
        saved: saved.count ?? 0,
        quizResults: quiz.count ?? 0,
        published: published.count ?? 0,
        drafts: drafts.count ?? 0,
      });
      if (rLikes.data) setRecentLikes(rLikes.data);
      if (rComments.data) setRecentComments(rComments.data);
      if (rActivities.data) setRecentActivities(rActivities.data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const hasAlerts = stats.drafts > 3;

  return (
    <div className="space-y-8">
      {/* Section Title + Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">Real-time insights into your content performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2 rounded-full border-2 border-foreground">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Content Command Center */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-4">Content Command Center</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(150,76%,78%)] p-5">
            <FileText className="h-8 w-8 mb-3 text-foreground/70" />
            <div className="text-4xl font-black">{stats.posts}</div>
            <div className="text-xs font-bold uppercase tracking-wider mt-1">Total Posts</div>
            <div className="text-xs text-foreground/60 mt-1">{stats.published} published</div>
          </div>
          <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(270,67%,80%)] p-5">
            <Users className="h-8 w-8 mb-3 text-foreground/70" />
            <div className="text-4xl font-black">{stats.users}</div>
            <div className="text-xs font-bold uppercase tracking-wider mt-1">Total Users</div>
            <div className="text-xs text-foreground/60 mt-1">Registered accounts</div>
          </div>
          <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(45,100%,70%)] p-5">
            <Heart className="h-8 w-8 mb-3 text-foreground/70" />
            <div className="text-4xl font-black">{stats.likes}</div>
            <div className="text-xs font-bold uppercase tracking-wider mt-1">Total Likes</div>
            <div className="text-xs text-foreground/60 mt-1">{stats.comments} comments</div>
          </div>
          <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(150,76%,78%)] p-5">
            <HelpCircle className="h-8 w-8 mb-3 text-foreground/70" />
            <div className="text-4xl font-black">{stats.quizResults}</div>
            <div className="text-xs font-bold uppercase tracking-wider mt-1">Quiz Submissions</div>
            <div className="text-xs text-foreground/60 mt-1">Completed quizzes</div>
          </div>
        </div>
      </div>

      {/* Content Health Alerts */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Content Health Alerts
        </h3>
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(150,76%,78%)] p-8 text-center">
          {hasAlerts ? (
            <>
              <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-foreground/60" />
              <p className="font-bold">Attention Needed</p>
              <p className="text-sm text-foreground/60">You have {stats.drafts} draft posts waiting to be published.</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-foreground/60" />
              <p className="font-bold">All Clear!</p>
              <p className="text-sm text-foreground/60">No alerts at the moment. Everything is running smoothly.</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="rounded-xl border-2 border-dashed border-border p-5">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Engagement Trends
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.likes > 0 ? `${stats.likes} total likes and ${stats.comments} comments across all posts` : "Engagement data will appear as users interact with content"}
            </p>
          </div>
          <div className="rounded-xl border-2 border-dashed border-border p-5">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Bookmark className="h-4 w-4" /> Saved Content
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.saved > 0 ? `${stats.saved} posts saved by readers` : "Saved content metrics will appear here"}
            </p>
          </div>
        </div>
      </div>

      {/* Top Content */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-4">Recent Engagement</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Likes */}
          <div className="rounded-xl border-2 border-dashed border-border p-5">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-red-500" /> Recent Likes
            </h4>
            <div className="space-y-2">
              {recentLikes.slice(0, 5).map((l) => (
                <div key={l.id} className="text-sm border-b border-border pb-2">
                  <span className="font-medium">{(l.blog_posts as any)?.title || "Unknown post"}</span>
                  <div className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</div>
                </div>
              ))}
              {recentLikes.length === 0 && <p className="text-sm text-muted-foreground">No likes yet</p>}
            </div>
          </div>

          {/* Recent Comments */}
          <div className="rounded-xl border-2 border-dashed border-border p-5">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-purple-500" /> Recent Comments
            </h4>
            <div className="space-y-2">
              {recentComments.slice(0, 5).map((c) => (
                <div key={c.id} className="text-sm border-b border-border pb-2">
                  <span className="font-medium line-clamp-1">{c.content}</span>
                  <div className="text-xs text-muted-foreground">on {(c.blog_posts as any)?.title || "Unknown"} • {new Date(c.created_at).toLocaleString()}</div>
                </div>
              ))}
              {recentComments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet</p>}
            </div>
          </div>

          {/* Recent Saves */}
          <div className="rounded-xl border-2 border-dashed border-border p-5">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
              <Bookmark className="h-4 w-4 text-yellow-600" /> Content Status
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Published</span>
                <Badge className="bg-[hsl(150,76%,78%)] text-foreground hover:bg-[hsl(150,76%,70%)]">{stats.published}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Drafts</span>
                <Badge variant="outline">{stats.drafts}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Saved by users</span>
                <Badge variant="secondary">{stats.saved}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Quiz results</span>
                <Badge variant="secondary">{stats.quizResults}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer timestamp */}
      <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        Analytics update on refresh • Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}

// ─── Posts Tab ───
function PostsTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", category: "story" as string, status: "draft" as string, excerpt: "", featured_image: "", audio_url: "", homepage_section: "none" });

  const load = () => {
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setPosts(data);
    });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingPost(null);
    setForm({ title: "", slug: "", content: "", category: "story", status: "draft", excerpt: "", featured_image: "", audio_url: "", homepage_section: "none" });
    setDialogOpen(true);
  };

  const openEdit = (post: any) => {
    setEditingPost(post);
    setForm({ title: post.title, slug: post.slug, content: post.content, category: post.category, status: post.status, excerpt: post.excerpt || "", featured_image: post.featured_image || "", audio_url: post.audio_url || "", homepage_section: post.homepage_section || "none" });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    if (editingPost) {
      const { error } = await supabase.from("blog_posts").update({ ...form, category: form.category as any, status: form.status as any }).eq("id", editingPost.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("blog_posts").insert({ ...form, category: form.category as any, status: form.status as any, author_id: user?.id });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: editingPost ? "Post updated" : "Post created" });
    setDialogOpen(false);
    load();
  };

  const deletePost = async (id: string) => {
    await supabase.from("blog_posts").delete().eq("id", id);
    toast({ title: "Post deleted" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight uppercase">Manage Posts ({posts.length})</h2>
        <Button onClick={openCreate} className="rounded-full">+ Create Post</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Slug (url-friendly)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Input placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            <div>
              <label className="text-sm font-medium mb-1 block">Featured Image</label>
              <div className="flex gap-2">
                <Input placeholder="Image URL" value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const path = `posts/${Date.now()}-${file.name}`;
                    const { error } = await supabase.storage.from("media").upload(path, file);
                    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
                    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
                    setForm((f) => ({ ...f, featured_image: pub.publicUrl }));
                    toast({ title: "Image uploaded" });
                  }} />
                  <span className="inline-flex items-center px-3 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-muted transition-colors">Upload</span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Audio File (optional)</label>
              <div className="flex gap-2">
                <Input placeholder="Audio URL" value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="audio/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const path = `audio/${Date.now()}-${file.name}`;
                    const { error } = await supabase.storage.from("media").upload(path, file);
                    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
                    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
                    setForm((f) => ({ ...f, audio_url: pub.publicUrl }));
                    toast({ title: "Audio uploaded" });
                  }} />
                  <span className="inline-flex items-center px-3 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-muted transition-colors">Upload</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="opinion">Opinion</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Homepage Section</label>
              <Select value={form.homepage_section} onValueChange={(v) => setForm({ ...form, homepage_section: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="hero">Hero (main banner)</SelectItem>
                  <SelectItem value="featured_stories">Featured AI Fictions</SelectItem>
                  <SelectItem value="featured_collections">Featured Collections</SelectItem>
                  <SelectItem value="best_ai_tools">Best AI Tools</SelectItem>
                  <SelectItem value="news_articles">News & Articles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Content (markdown)" rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <Button onClick={save} className="w-full">{editingPost ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                <TableCell><Badge variant="secondary">{post.category}</Badge></TableCell>
                <TableCell>
                  <Badge className={post.status === "published" ? "bg-[hsl(150,76%,78%)] text-foreground hover:bg-[hsl(150,76%,70%)]" : ""} variant={post.status === "published" ? "default" : "outline"}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{post.homepage_section || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(post)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deletePost(post.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No posts yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Users Tab ───
function UsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);

  const load = () => {
    supabase.from("profiles").select("*, user_roles(role)").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setUsers(data);
    });
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    if (currentlyAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: "admin" as any });
    }
    toast({ title: currentlyAdmin ? "Admin role removed" : "Admin role granted" });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight uppercase">Manage Users ({users.length})</h2>

      {/* Top Users */}
      <div className="rounded-xl border-2 border-dashed border-border p-6">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
          <Crown className="h-4 w-4" /> User Overview
        </h3>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <Crown className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="font-bold">No Users Yet</p>
            <p className="text-sm text-muted-foreground">Registered users will appear here</p>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isAdmin = u.user_roles?.some((r: any) => r.role === "admin");
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.display_name || "Unnamed"}</TableCell>
                      <TableCell>
                        <Badge className={isAdmin ? "bg-[hsl(150,76%,78%)] text-foreground hover:bg-[hsl(150,76%,70%)]" : ""} variant={isAdmin ? "default" : "secondary"}>
                          {isAdmin ? "Admin" : "User"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => toggleAdmin(u.user_id, isAdmin)}>
                          {isAdmin ? "Remove Admin" : "Make Admin"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quiz Tab ───
function QuizTab() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("quiz_questions").select("*").order("created_at", { ascending: false }).then(({ data }) => { if (data) setQuestions(data); });
    supabase.from("quiz_results").select("*").order("completed_at", { ascending: false }).limit(20).then(({ data }) => { if (data) setResults(data); });
  }, []);

  const deleteQ = async (id: string) => {
    await supabase.from("quiz_questions").delete().eq("id", id);
    toast({ title: "Question deleted" });
    setQuestions((q) => q.filter((x) => x.id !== id));
  };

  const avgScore = results.length > 0
    ? Math.round(results.reduce((a, r) => a + (r.score / r.total_questions) * 100, 0) / results.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Quiz Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(270,67%,80%)] p-5">
          <HelpCircle className="h-8 w-8 mb-3 text-foreground/70" />
          <div className="text-4xl font-black">{questions.length}</div>
          <div className="text-xs font-bold uppercase tracking-wider mt-1">Questions</div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(45,100%,70%)] p-5">
          <Users className="h-8 w-8 mb-3 text-foreground/70" />
          <div className="text-4xl font-black">{results.length}</div>
          <div className="text-xs font-bold uppercase tracking-wider mt-1">Submissions</div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(150,76%,78%)] p-5">
          <TrendingUp className="h-8 w-8 mb-3 text-foreground/70" />
          <div className="text-4xl font-black">{avgScore}%</div>
          <div className="text-xs font-bold uppercase tracking-wider mt-1">Avg Score</div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black tracking-tight uppercase mb-4">Quiz Questions ({questions.length})</h2>
        <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.slice(0, 20).map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-xs truncate">{q.question}</TableCell>
                  <TableCell><Badge variant="secondary">{q.category || "—"}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{q.difficulty || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="destructive" onClick={() => deleteQ(q.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black tracking-tight uppercase mb-4">Recent Results</h2>
        <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.quiz_title}</TableCell>
                  <TableCell><Badge>{r.score}/{r.total_questions}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(r.completed_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No quiz results yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// ─── Freebies Tab ───
function FreebiesTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", type: "ebook", category: "general", file_url: "", cover_image: "" });

  const load = () => {
    supabase.from("freebies").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setItems(data);
    });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm({ title: "", description: "", type: "ebook", category: "general", file_url: "", cover_image: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({ title: item.title, description: item.description || "", type: item.type, category: item.category, file_url: item.file_url, cover_image: item.cover_image || "" });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.file_url) {
      toast({ title: "Title and file URL are required", variant: "destructive" });
      return;
    }
    if (editingItem) {
      const { error } = await supabase.from("freebies").update(form).eq("id", editingItem.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("freebies").insert({ ...form, created_by: user?.id });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: editingItem ? "Freebie updated" : "Freebie created" });
    setDialogOpen(false);
    load();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("freebies").delete().eq("id", id);
    toast({ title: "Freebie deleted" });
    load();
  };

  const uploadFile = async (file: File, folder: string, onDone: (url: string) => void) => {
    const path = `freebies/${folder}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    onDone(pub.publicUrl);
    toast({ title: "File uploaded" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight uppercase">Manage Freebies ({items.length})</h2>
        <Button onClick={openCreate} className="rounded-full">+ Add Freebie</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Freebie" : "Add Freebie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-4">
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ebook">Ebook (PDF)</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Category (e.g. AI, Marketing)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">File</label>
              <div className="flex gap-2">
                <Input placeholder="File URL" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" className="hidden" accept={form.type === "ebook" ? ".pdf,.epub" : "audio/*"} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, form.type === "ebook" ? "ebooks" : "podcasts", (url) => setForm((f) => ({ ...f, file_url: url })));
                  }} />
                  <span className="inline-flex items-center px-3 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4 mr-1" /> Upload
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cover Image</label>
              <div className="flex gap-2">
                <Input placeholder="Image URL" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, "covers", (url) => setForm((f) => ({ ...f, cover_image: url })));
                  }} />
                  <span className="inline-flex items-center px-3 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4 mr-1" /> Upload
                  </span>
                </label>
              </div>
            </div>
            <Button onClick={save} className="w-full">{editingItem ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{item.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1">
                    {item.type === "ebook" ? <BookOpen className="h-3 w-3" /> : <Headphones className="h-3 w-3" />}
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{item.category}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No freebies yet. Add your first ebook or podcast!</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ───
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const [tab, setTab] = useState<Tab>("analytics");

  if (authLoading || roleLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Loading…</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <p className="text-lg">Access denied. Admin privileges required.</p>
        <Button onClick={() => navigate("/")} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Go Home</Button>
      </div>
    );
  }

  const tabs: { label: string; key: Tab; icon: any; count?: number }[] = [
    { label: "Analytics", key: "analytics", icon: BarChart3 },
    { label: "Posts", key: "posts", icon: FileText },
    { label: "Users", key: "users", icon: Users },
    { label: "Quiz", key: "quiz", icon: HelpCircle },
    { label: "Freebies", key: "freebies", icon: Gift },
  ];

  const tabContent: Record<Tab, JSX.Element> = {
    analytics: <AnalyticsOverviewTab />,
    posts: <PostsTab />,
    users: <UsersTab />,
    quiz: <QuizTab />,
    freebies: <FreebiesTab />,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header Bar */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center h-14">
          <button onClick={() => navigate("/")} className="text-xl font-black tracking-tight italic mr-auto">
            UTOP<span className="gradient-text">AI</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Badge className="bg-[hsl(150,76%,78%)] text-foreground hover:bg-[hsl(150,76%,70%)] rounded-full font-bold text-xs px-3">ADMIN</Badge>
            <button
              onClick={async () => { await signOut(); navigate("/"); }}
              className="p-2 rounded-md hover:bg-secondary transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <h1 className="text-4xl font-black tracking-tight uppercase mb-6">Admin Dashboard</h1>

        {/* Horizontal Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide border-2 transition-all ${
                tab === t.key
                  ? "bg-[hsl(150,76%,78%)] border-[hsl(150,76%,78%)] text-foreground"
                  : "border-border bg-background text-foreground hover:bg-secondary"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tabContent[tab]}
      </div>
    </div>
  );
}
