import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Heart,
  Bookmark,
  MessageSquare,
  ArrowLeft,
  User,
  LogOut,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Tab = "overview" | "saved" | "liked" | "comments" | "profile";

// ─── Overview ───
function OverviewTab() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ saved: 0, liked: 0, comments: 0, quizzes: 0 });
  const [recentComments, setRecentComments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("saved_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("likes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("comments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("quiz_results").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("comments").select("*, blog_posts(title)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    ]).then(([saved, liked, comments, quizzes, rComments]) => {
      setStats({
        saved: saved.count ?? 0,
        liked: liked.count ?? 0,
        comments: comments.count ?? 0,
        quizzes: quizzes.count ?? 0,
      });
      if (rComments.data) setRecentComments(rComments.data);
    });
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(270,67%,80%)] p-5 flex items-center gap-4">
          <Bookmark className="h-8 w-8 text-foreground/70" />
          <div className="text-right flex-1">
            <div className="text-4xl font-black">{stats.saved}</div>
            <div className="text-xs font-bold uppercase tracking-wider">Saved Posts</div>
          </div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(150,76%,78%)] p-5 flex items-center gap-4">
          <Heart className="h-8 w-8 text-foreground/70" />
          <div className="text-right flex-1">
            <div className="text-4xl font-black">{stats.liked}</div>
            <div className="text-xs font-bold uppercase tracking-wider">Liked Posts</div>
          </div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(45,100%,70%)] p-5 flex items-center gap-4">
          <MessageSquare className="h-8 w-8 text-foreground/70" />
          <div className="text-right flex-1">
            <div className="text-4xl font-black">{stats.comments}</div>
            <div className="text-xs font-bold uppercase tracking-wider">Comments</div>
          </div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(350,76%,72%)] p-5 flex items-center gap-4">
          <HelpCircle className="h-8 w-8 text-foreground/70" />
          <div className="text-right flex-1">
            <div className="text-4xl font-black">{stats.quizzes}</div>
            <div className="text-xs font-bold uppercase tracking-wider">Quizzes</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-4">Recent Activity</h3>
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(270,67%,80%)] p-8 text-center">
          {recentComments.length > 0 ? (
            <div className="space-y-3 text-left">
              {recentComments.map((c) => (
                <div key={c.id} className="flex items-start gap-3 border-b border-foreground/10 pb-3 last:border-0">
                  <MessageSquare className="h-5 w-5 mt-0.5 text-foreground/60 shrink-0" />
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{c.content}</p>
                    <p className="text-xs text-foreground/60">on {(c.blog_posts as any)?.title || "Unknown"} • {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-foreground/40" />
              <p className="font-bold uppercase">No Activity Yet</p>
              <p className="text-sm text-foreground/60 mt-1">Start exploring content, leave comments, and save your favorite posts!</p>
              <Link to="/">
                <Button className="mt-4 rounded-full bg-[hsl(350,76%,72%)] text-foreground hover:bg-[hsl(350,76%,65%)] gap-2">
                  Browse Content <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Saved Tab ───
function SavedTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState<any[]>([]);

  const load = () => {
    if (!user) return;
    supabase.from("saved_posts").select("*, blog_posts(title, slug, category)").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setSaved(data);
    });
  };

  useEffect(() => { load(); }, [user]);

  const unsave = async (id: string) => {
    await supabase.from("saved_posts").delete().eq("id", id);
    toast({ title: "Post unsaved" });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight uppercase">Saved Posts ({saved.length})</h2>
      {saved.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(150,76%,78%)] p-8 text-center">
          <Bookmark className="h-10 w-10 mx-auto mb-2 text-foreground/40" />
          <p className="font-bold uppercase">No Saved Posts Yet</p>
          <p className="text-sm text-foreground/60 mt-1">Save posts to read them later!</p>
          <Link to="/"><Button className="mt-4 rounded-full gap-2">Browse Posts <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Saved On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saved.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{(s.blog_posts as any)?.title || "Unknown"}</TableCell>
                  <TableCell><Badge variant="secondary">{(s.blog_posts as any)?.category || "—"}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="destructive" onClick={() => unsave(s.id)}>Unsave</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Liked Tab ───
function LikedTab() {
  const { user } = useAuth();
  const [liked, setLiked] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("likes").select("*, blog_posts(title, category)").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setLiked(data);
    });
  }, [user]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight uppercase">Liked Posts ({liked.length})</h2>
      {liked.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(350,76%,72%)] p-8 text-center">
          <Heart className="h-10 w-10 mx-auto mb-2 text-foreground/40" />
          <p className="font-bold uppercase">No Liked Posts Yet</p>
          <p className="text-sm text-foreground/60 mt-1">Like posts to keep track of your favorites!</p>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Liked On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liked.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{(l.blog_posts as any)?.title || "Unknown"}</TableCell>
                  <TableCell><Badge variant="secondary">{(l.blog_posts as any)?.category || "—"}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Comments Tab ───
function CommentsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<any[]>([]);

  const load = () => {
    if (!user) return;
    supabase.from("comments").select("*, blog_posts(title)").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setComments(data);
    });
  };

  useEffect(() => { load(); }, [user]);

  const deleteComment = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    toast({ title: "Comment deleted" });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight uppercase">My Comments ({comments.length})</h2>
      {comments.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(45,100%,70%)] p-8 text-center">
          <MessageSquare className="h-10 w-10 mx-auto mb-2 text-foreground/40" />
          <p className="font-bold uppercase">No Comments Yet</p>
          <p className="text-sm text-foreground/60 mt-1">Join the conversation by commenting on posts!</p>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comment</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-xs truncate">{c.content}</TableCell>
                  <TableCell className="text-muted-foreground">{(c.blog_posts as any)?.title || "Unknown"}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="destructive" onClick={() => deleteComment(c.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ───
function ProfileTab() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, bio").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
      }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName, bio }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Profile updated" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black tracking-tight uppercase">Edit Profile</h2>
      <div className="rounded-xl border-2 border-dashed border-border p-6 max-w-lg space-y-4">
        <div>
          <label className="text-sm font-bold uppercase tracking-wider">Display Name</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-bold uppercase tracking-wider">Bio</label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Email</label>
          <Input value={user?.email || ""} disabled className="mt-1" />
        </div>
        <Button onClick={save} disabled={saving} className="rounded-full">{saving ? "Saving…" : "Save Profile"}</Button>
      </div>
    </div>
  );
}

// ─── Main ───
export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <p className="text-lg">Please sign in to access your dashboard.</p>
        <Button onClick={() => navigate("/auth")} variant="outline">Sign In</Button>
      </div>
    );
  }

  const tabs: { label: string; key: Tab; icon: any }[] = [
    { label: "Overview", key: "overview", icon: LayoutDashboard },
    { label: "Saved", key: "saved", icon: Bookmark },
    { label: "Liked", key: "liked", icon: Heart },
    { label: "Comments", key: "comments", icon: MessageSquare },
    { label: "Profile", key: "profile", icon: User },
  ];

  const tabContent: Record<Tab, JSX.Element> = {
    overview: <OverviewTab />,
    saved: <SavedTab />,
    liked: <LikedTab />,
    comments: <CommentsTab />,
    profile: <ProfileTab />,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center h-14">
          <button onClick={() => navigate("/")} className="text-xl font-black tracking-tight italic mr-auto">
            UTOP<span className="gradient-text">AI</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
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
        {/* Title */}
        <h1 className="text-4xl font-black tracking-tight uppercase">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Manage your saved posts, likes, comments, and profile</p>

        {/* Horizontal Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide border-2 transition-all ${
                tab === t.key
                  ? "bg-foreground border-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-secondary"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tabContent[tab]}
      </div>
    </div>
  );
}
