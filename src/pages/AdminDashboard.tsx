import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Heart,
  Bookmark,
  MessageSquare,
  Share2,
  HelpCircle,
  ArrowLeft,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type Tab = "overview" | "posts" | "users" | "analytics" | "quiz";

function AdminSidebar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items = [
    { title: "Overview", icon: LayoutDashboard, key: "overview" as Tab },
    { title: "Posts", icon: FileText, key: "posts" as Tab },
    { title: "Users", icon: Users, key: "users" as Tab },
    { title: "Analytics", icon: BarChart3, key: "analytics" as Tab },
    { title: "Quiz", icon: HelpCircle, key: "quiz" as Tab },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    onClick={() => setTab(item.key)}
                    isActive={tab === item.key}
                    className="cursor-pointer"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// ─── Overview ───
function OverviewTab() {
  const [stats, setStats] = useState({ posts: 0, users: 0, comments: 0, likes: 0, saved: 0, quizResults: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      supabase.from("likes").select("id", { count: "exact", head: true }),
      supabase.from("saved_posts").select("id", { count: "exact", head: true }),
      supabase.from("quiz_results").select("id", { count: "exact", head: true }),
    ]).then(([posts, users, comments, likes, saved, quiz]) => {
      setStats({
        posts: posts.count ?? 0,
        users: users.count ?? 0,
        comments: comments.count ?? 0,
        likes: likes.count ?? 0,
        saved: saved.count ?? 0,
        quizResults: quiz.count ?? 0,
      });
    });
  }, []);

  const cards = [
    { label: "Total Posts", value: stats.posts, icon: FileText, color: "text-blue-500" },
    { label: "Total Users", value: stats.users, icon: Users, color: "text-green-500" },
    { label: "Comments", value: stats.comments, icon: MessageSquare, color: "text-purple-500" },
    { label: "Likes", value: stats.likes, icon: Heart, color: "text-red-500" },
    { label: "Saved Posts", value: stats.saved, icon: Bookmark, color: "text-yellow-500" },
    { label: "Quiz Submissions", value: stats.quizResults, icon: HelpCircle, color: "text-cyan-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
            <c.icon className={`h-5 w-5 ${c.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Posts ───
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
        <h2 className="text-xl font-bold text-foreground">Manage Posts</h2>
        <Button onClick={openCreate}>Create Post</Button>
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
            <Input placeholder="Featured image URL" value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} />
            <Input placeholder="Audio file URL (optional)" value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} />
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
              <label className="text-sm font-medium text-foreground mb-1 block">Homepage Section</label>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium text-foreground">{post.title}</TableCell>
                <TableCell><Badge variant="secondary">{post.category}</Badge></TableCell>
                <TableCell>
                  <Badge variant={post.status === "published" ? "default" : "outline"}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(post)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deletePost(post.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No posts yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Users ───
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
      <h2 className="text-xl font-bold text-foreground">Manage Users</h2>
      <div className="rounded-md border">
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
                  <TableCell className="text-foreground font-medium">{u.display_name || "Unnamed"}</TableCell>
                  <TableCell>
                    <Badge variant={isAdmin ? "default" : "secondary"}>{isAdmin ? "Admin" : "User"}</Badge>
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
    </div>
  );
}

// ─── Analytics ───
function AnalyticsTab() {
  const [recentLikes, setRecentLikes] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [recentSaves, setRecentSaves] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("likes").select("*, blog_posts(title)").order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) setRecentLikes(data); });
    supabase.from("comments").select("*, blog_posts(title)").order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) setRecentComments(data); });
    supabase.from("saved_posts").select("*, blog_posts(title)").order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) setRecentSaves(data); });
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-foreground">Engagement Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Heart className="h-4 w-4 text-red-500" /> Recent Likes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentLikes.map((l) => (
              <div key={l.id} className="text-sm text-muted-foreground border-b border-border pb-1">
                <span className="text-foreground">{(l.blog_posts as any)?.title || "Unknown post"}</span>
                <br /><span className="text-xs">{new Date(l.created_at).toLocaleString()}</span>
              </div>
            ))}
            {recentLikes.length === 0 && <p className="text-sm text-muted-foreground">No likes yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-purple-500" /> Recent Comments</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentComments.map((c) => (
              <div key={c.id} className="text-sm text-muted-foreground border-b border-border pb-1">
                <span className="text-foreground line-clamp-1">{c.content}</span>
                <br /><span className="text-xs">on {(c.blog_posts as any)?.title || "Unknown"} • {new Date(c.created_at).toLocaleString()}</span>
              </div>
            ))}
            {recentComments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bookmark className="h-4 w-4 text-yellow-500" /> Recent Saves</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentSaves.map((s) => (
              <div key={s.id} className="text-sm text-muted-foreground border-b border-border pb-1">
                <span className="text-foreground">{(s.blog_posts as any)?.title || "Unknown post"}</span>
                <br /><span className="text-xs">{new Date(s.created_at).toLocaleString()}</span>
              </div>
            ))}
            {recentSaves.length === 0 && <p className="text-sm text-muted-foreground">No saves yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Quiz Management ───
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Quiz Questions ({questions.length})</h2>
        <div className="rounded-md border">
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
                  <TableCell className="text-foreground max-w-xs truncate">{q.question}</TableCell>
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
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Quiz Results</h2>
        <div className="rounded-md border">
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
                  <TableCell className="text-foreground">{r.quiz_title}</TableCell>
                  <TableCell><Badge>{r.score}/{r.total_questions}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(r.completed_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ───
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const [tab, setTab] = useState<Tab>("overview");

  if (authLoading || roleLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading…</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4">
        <p className="text-lg">Access denied. Admin privileges required.</p>
        <Button onClick={() => navigate("/")} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Go Home</Button>
      </div>
    );
  }

  const tabContent: Record<Tab, JSX.Element> = {
    overview: <OverviewTab />,
    posts: <PostsTab />,
    users: <UsersTab />,
    analytics: <AnalyticsTab />,
    quiz: <QuizTab />,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar tab={tab} setTab={setTab} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to site
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            {tabContent[tab]}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
