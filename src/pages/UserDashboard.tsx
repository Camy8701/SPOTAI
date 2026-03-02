import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Heart,
  Bookmark,
  MessageSquare,
  Activity,
  ArrowLeft,
  User,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Tab = "overview" | "saved" | "liked" | "comments" | "profile";

function UserSidebar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items = [
    { title: "Overview", icon: LayoutDashboard, key: "overview" as Tab },
    { title: "Saved Posts", icon: Bookmark, key: "saved" as Tab },
    { title: "Liked Posts", icon: Heart, key: "liked" as Tab },
    { title: "My Comments", icon: MessageSquare, key: "comments" as Tab },
    { title: "Profile", icon: User, key: "profile" as Tab },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My Dashboard</SidebarGroupLabel>
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

function OverviewTab() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ saved: 0, liked: 0, comments: 0 });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("saved_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("likes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("comments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([saved, liked, comments]) => {
      setStats({
        saved: saved.count ?? 0,
        liked: liked.count ?? 0,
        comments: comments.count ?? 0,
      });
    });
  }, [user]);

  const cards = [
    { label: "Saved Posts", value: stats.saved, icon: Bookmark, color: "text-yellow-500" },
    { label: "Liked Posts", value: stats.liked, icon: Heart, color: "text-red-500" },
    { label: "My Comments", value: stats.comments, icon: MessageSquare, color: "text-purple-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
      <h2 className="text-xl font-bold text-foreground">Saved Posts</h2>
      <div className="rounded-md border">
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
                <TableCell className="text-foreground font-medium">{(s.blog_posts as any)?.title || "Unknown"}</TableCell>
                <TableCell><Badge variant="secondary">{(s.blog_posts as any)?.category || "—"}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="destructive" onClick={() => unsave(s.id)}>Unsave</Button>
                </TableCell>
              </TableRow>
            ))}
            {saved.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No saved posts</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

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
      <h2 className="text-xl font-bold text-foreground">Liked Posts</h2>
      <div className="rounded-md border">
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
                <TableCell className="text-foreground font-medium">{(l.blog_posts as any)?.title || "Unknown"}</TableCell>
                <TableCell><Badge variant="secondary">{(l.blog_posts as any)?.category || "—"}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {liked.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No liked posts yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

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
      <h2 className="text-xl font-bold text-foreground">My Comments</h2>
      <div className="rounded-md border">
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
                <TableCell className="text-foreground max-w-xs truncate">{c.content}</TableCell>
                <TableCell className="text-muted-foreground">{(c.blog_posts as any)?.title || "Unknown"}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="destructive" onClick={() => deleteComment(c.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {comments.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No comments yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

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
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Display Name</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Bio</label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <Input value={user?.email || ""} disabled />
        </div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Profile"}</Button>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4">
        <p className="text-lg">Please sign in to access your dashboard.</p>
        <Button onClick={() => navigate("/auth")} variant="outline">Sign In</Button>
      </div>
    );
  }

  const tabContent: Record<Tab, JSX.Element> = {
    overview: <OverviewTab />,
    saved: <SavedTab />,
    liked: <LikedTab />,
    comments: <CommentsTab />,
    profile: <ProfileTab />,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <UserSidebar tab={tab} setTab={setTab} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-bold text-foreground">My Dashboard</h1>
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
