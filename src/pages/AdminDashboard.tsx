import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import {
  FileText,
  Users,
  UsersRound,
  BarChart3,
  Heart,
  Bookmark,
  MessageSquare,
  MessagesSquare,
  HelpCircle,
  ArrowLeft,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Eye,
  PenLine,
  XCircle,
  Gift,
  BookOpen,
  Headphones,
  Upload,
  Images,
  Sparkles,
  Plus,
  Globe,
  Crown,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
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

type Tab = "analytics" | "posts" | "users" | "quiz" | "social" | "freebies" | "images" | "prompts";

// ─── Analytics / Overview Tab ───
function AnalyticsOverviewTab() {
  const [stats, setStats] = useState({
    posts: 0, users: 0, comments: 0, likes: 0, saved: 0, quizResults: 0,
    published: 0, drafts: 0, communities: 0, groups: 0, communityMembers: 0,
    groupMembers: 0, conversations: 0, messages: 0, freebies: 0, ebooks: 0,
    podcasts: 0, pendingMembers: 0, mediaFiles: 0, imageItems: 0,
    promptItems: 0, quizQuestions: 0,
  });
  const [recentLikes, setRecentLikes] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [recentFreebies, setRecentFreebies] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [allLikes, setAllLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper: group items by date (YYYY-MM-DD)
  const groupByDay = (items: any[], key = "created_at") => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      const day = new Date(item[key]).toISOString().slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    });
    return map;
  };

  // Build last 30 days chart data
  const chartData = useMemo(() => {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    const profilesByDay = groupByDay(allProfiles);
    const postsByDay = groupByDay(allPosts);
    const commentsByDay = groupByDay(allComments);
    const likesByDay = groupByDay(allLikes);

    return days.map((day) => ({
      date: day.slice(5), // MM-DD
      users: profilesByDay[day] || 0,
      posts: postsByDay[day] || 0,
      comments: commentsByDay[day] || 0,
      likes: likesByDay[day] || 0,
    }));
  }, [allProfiles, allPosts, allComments, allLikes]);

  // Cumulative user growth
  const growthData = useMemo(() => {
    let cumulative = 0;
    const profilesByDay = groupByDay(allProfiles);
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    // Count all profiles before our 30-day window
    const windowStart = days[0];
    allProfiles.forEach((p) => {
      if (p.created_at.slice(0, 10) < windowStart) cumulative++;
    });
    return days.map((day) => {
      cumulative += profilesByDay[day] || 0;
      return { date: day.slice(5), total: cumulative };
    });
  }, [allProfiles]);

  // Category pie data
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    allPosts.forEach((p) => {
      const cat = p.category || "uncategorized";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allPosts]);

  const PIE_COLORS = [
    "hsl(150, 76%, 48%)", "hsl(270, 67%, 55%)", "hsl(45, 100%, 50%)",
    "hsl(200, 80%, 50%)", "hsl(330, 70%, 55%)", "hsl(20, 90%, 55%)",
  ];

  const load = () => {
    setLoading(true);
    Promise.all([
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      supabase.from("likes").select("id", { count: "exact", head: true }),
      supabase.from("saved_posts").select("id", { count: "exact", head: true }),
      supabase.from("quiz_results").select("id", { count: "exact", head: true }),
      supabase.from("quiz_questions").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("communities").select("id", { count: "exact", head: true }),
      supabase.from("groups").select("id", { count: "exact", head: true }),
      supabase.from("community_members").select("id", { count: "exact", head: true }),
      supabase.from("group_members").select("id", { count: "exact", head: true }),
      supabase.from("conversations").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }),
      supabase.from("freebies").select("id", { count: "exact", head: true }),
      supabase.from("freebies").select("id", { count: "exact", head: true }).eq("type", "ebook"),
      supabase.from("freebies").select("id", { count: "exact", head: true }).eq("type", "podcast"),
      supabase.from("image_library_items").select("id", { count: "exact", head: true }),
      supabase.from("prompt_library_items").select("id", { count: "exact", head: true }),
      supabase.from("group_members").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("media").select("id", { count: "exact", head: true }),
      supabase.from("likes").select("*, blog_posts(title)").order("created_at", { ascending: false }).limit(10),
      supabase.from("comments").select("*, blog_posts(title), profiles(display_name)").order("created_at", { ascending: false }).limit(10),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("messages").select("*, conversations(participant_1, participant_2)").order("created_at", { ascending: false }).limit(10),
      supabase.from("blog_posts").select("id, title, status, created_at, category").order("created_at", { ascending: false }).limit(10),
      supabase.from("freebies").select("*").order("created_at", { ascending: false }).limit(5),
      // Time-series for charts
      supabase.from("profiles").select("created_at").order("created_at", { ascending: true }),
      supabase.from("blog_posts").select("created_at, category, status").order("created_at", { ascending: true }),
      supabase.from("comments").select("created_at").order("created_at", { ascending: true }),
      supabase.from("likes").select("created_at").order("created_at", { ascending: true }),
    ]).then(([
      posts, users, comments, likes, saved, quiz, quizQuestions, published, drafts,
      communities, groups, communityMembers, groupMembers, conversations, messages,
      freebies, ebooks, podcasts, imageItems, promptItems, pendingMembers, mediaFiles,
      rLikes, rComments, rUsers, rMessages, rTopPosts, rFreebies,
      chartProfiles, chartPosts, chartComments, chartLikes,
    ]) => {
      setStats({
        posts: posts.count ?? 0, users: users.count ?? 0, comments: comments.count ?? 0,
        likes: likes.count ?? 0, saved: saved.count ?? 0, quizResults: quiz.count ?? 0,
        quizQuestions: quizQuestions.count ?? 0,
        published: published.count ?? 0, drafts: drafts.count ?? 0,
        communities: communities.count ?? 0, groups: groups.count ?? 0,
        communityMembers: communityMembers.count ?? 0, groupMembers: groupMembers.count ?? 0,
        conversations: conversations.count ?? 0, messages: messages.count ?? 0,
        freebies: freebies.count ?? 0, ebooks: ebooks.count ?? 0, podcasts: podcasts.count ?? 0,
        imageItems: imageItems.count ?? 0, promptItems: promptItems.count ?? 0,
        pendingMembers: pendingMembers.count ?? 0, mediaFiles: mediaFiles.count ?? 0,
      });
      if (rLikes.data) setRecentLikes(rLikes.data);
      if (rComments.data) setRecentComments(rComments.data);
      if (rUsers.data) setRecentUsers(rUsers.data);
      if (rMessages.data) setRecentMessages(rMessages.data);
      if (rTopPosts.data) setTopPosts(rTopPosts.data);
      if (rFreebies.data) setRecentFreebies(rFreebies.data);
      if (chartProfiles.data) setAllProfiles(chartProfiles.data);
      if (chartPosts.data) setAllPosts(chartPosts.data);
      if (chartComments.data) setAllComments(chartComments.data);
      if (chartLikes.data) setAllLikes(chartLikes.data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const hasAlerts = stats.drafts > 3 || stats.pendingMembers > 0;

  return (
    <div className="space-y-8">
      {/* Section Title + Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Platform Analytics</h2>
          <p className="text-sm text-muted-foreground">Complete overview of everything happening on the platform</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2 rounded-full border-2 border-foreground">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── Row 1: Core Metrics ── */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-4">Content Command Center</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {[
            { icon: FileText, value: stats.posts, label: "Total Posts", sub: `${stats.published} published`, bg: "hsl(150,76%,78%)" },
            { icon: Users, value: stats.users, label: "Users", sub: "Registered", bg: "hsl(270,67%,80%)" },
            { icon: Heart, value: stats.likes, label: "Likes", sub: `${stats.comments} comments`, bg: "hsl(45,100%,70%)" },
            { icon: MessageSquare, value: stats.messages, label: "Messages", sub: `${stats.conversations} conversations`, bg: "hsl(200,80%,78%)" },
            { icon: HelpCircle, value: stats.quizResults, label: "Quiz Plays", sub: `${stats.quizQuestions} live questions`, bg: "hsl(330,70%,80%)" },
            { icon: Gift, value: stats.freebies, label: "Freebies", sub: `${stats.ebooks} ebooks · ${stats.podcasts} pods`, bg: "hsl(20,90%,78%)" },
            { icon: Images, value: stats.imageItems, label: "Image Items", sub: "Library inventory", bg: "hsl(193,90%,84%)" },
            { icon: Sparkles, value: stats.promptItems, label: "Prompt Items", sub: "Prompt library", bg: "hsl(292,72%,86%)" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border-2 border-dashed border-border p-4" style={{ backgroundColor: card.bg }}>
              <card.icon className="h-6 w-6 mb-2 text-foreground/70" />
              <div className="text-3xl font-black">{card.value}</div>
              <div className="text-xs font-bold uppercase tracking-wider mt-1">{card.label}</div>
              <div className="text-xs text-foreground/60 mt-0.5">{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Social & Community Metrics ── */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-4">Social & Community</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: Users, value: stats.communities, label: "Communities", sub: `${stats.communityMembers} members`, bg: "hsl(170,60%,78%)" },
            { icon: Crown, value: stats.groups, label: "Groups", sub: `${stats.groupMembers} members`, bg: "hsl(290,60%,80%)" },
            { icon: MessageSquare, value: stats.conversations, label: "Conversations", sub: "Active DMs", bg: "hsl(210,70%,80%)" },
            { icon: Bookmark, value: stats.saved, label: "Saved Posts", sub: "By readers", bg: "hsl(50,90%,75%)" },
            { icon: Upload, value: stats.mediaFiles, label: "Media Files", sub: "Uploaded", bg: "hsl(130,50%,78%)" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border-2 border-dashed border-border p-4" style={{ backgroundColor: card.bg }}>
              <card.icon className="h-6 w-6 mb-2 text-foreground/70" />
              <div className="text-3xl font-black">{card.value}</div>
              <div className="text-xs font-bold uppercase tracking-wider mt-1">{card.label}</div>
              <div className="text-xs text-foreground/60 mt-0.5">{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts Section ── */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" /> Trends & Analytics (Last 30 Days)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Line Chart */}
          <div className="rounded-xl border-2 border-border p-5 bg-card">
            <h4 className="font-bold text-sm mb-4">User Growth (Cumulative)</h4>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(270, 67%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(270, 67%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="hsl(270, 67%, 55%)" fill="url(#userGrad)" strokeWidth={2} name="Total Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Activity Bar Chart */}
          <div className="rounded-xl border-2 border-border p-5 bg-card">
            <h4 className="font-bold text-sm mb-4">Daily Engagement</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="likes" fill="hsl(330, 70%, 55%)" radius={[2, 2, 0, 0]} name="Likes" />
                <Bar dataKey="comments" fill="hsl(200, 80%, 50%)" radius={[2, 2, 0, 0]} name="Comments" />
                <Bar dataKey="posts" fill="hsl(150, 76%, 48%)" radius={[2, 2, 0, 0]} name="Posts" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* New Users Per Day */}
          <div className="rounded-xl border-2 border-border p-5 bg-card">
            <h4 className="font-bold text-sm mb-4">New Signups Per Day</h4>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="users" stroke="hsl(45, 100%, 50%)" strokeWidth={2} dot={{ r: 3 }} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Post Categories Pie */}
          <div className="rounded-xl border-2 border-border p-5 bg-card">
            <h4 className="font-bold text-sm mb-4">Content by Category</h4>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} style={{ fontSize: 11 }}>
                    {categoryData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">No posts yet</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Alerts ── */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Platform Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`rounded-xl border-2 border-dashed border-border p-5 text-center ${stats.drafts > 3 ? "bg-[hsl(45,100%,85%)]" : "bg-[hsl(150,76%,88%)]"}`}>
            <PenLine className="h-8 w-8 mx-auto mb-2 text-foreground/60" />
            <div className="text-2xl font-black">{stats.drafts}</div>
            <p className="text-sm font-bold">Unpublished Drafts</p>
            {stats.drafts > 3 && <p className="text-xs text-foreground/60 mt-1">Consider reviewing and publishing</p>}
          </div>
          <div className={`rounded-xl border-2 border-dashed border-border p-5 text-center ${stats.pendingMembers > 0 ? "bg-[hsl(20,90%,85%)]" : "bg-[hsl(150,76%,88%)]"}`}>
            <Users className="h-8 w-8 mx-auto mb-2 text-foreground/60" />
            <div className="text-2xl font-black">{stats.pendingMembers}</div>
            <p className="text-sm font-bold">Pending Group Requests</p>
            {stats.pendingMembers > 0 && <p className="text-xs text-foreground/60 mt-1">Members awaiting approval</p>}
          </div>
          <div className="rounded-xl border-2 border-dashed border-border p-5 text-center bg-[hsl(150,76%,88%)]">
            {hasAlerts ? (
              <>
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-foreground/60" />
                <p className="text-sm font-bold">Action Required</p>
                <p className="text-xs text-foreground/60 mt-1">Review items above</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-foreground/60" />
                <p className="text-sm font-bold">All Clear!</p>
                <p className="text-xs text-foreground/60 mt-1">Platform running smoothly</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Activity Feed ── */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-4">Recent Activity</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Users */}
          <div className="rounded-xl border-2 border-dashed border-border p-5">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-blue-500" /> New User Signups
            </h4>
            <div className="space-y-2">
              {recentUsers.slice(0, 6).map((u) => (
                <div key={u.id} className="text-sm border-b border-border pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{(u.display_name || "?")[0]}</div>
                    )}
                    <span className="font-medium">{u.display_name || "Anonymous"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              ))}
              {recentUsers.length === 0 && <p className="text-sm text-muted-foreground">No users yet</p>}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="rounded-xl border-2 border-dashed border-border p-5">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-green-500" /> Recent Messages
            </h4>
            <div className="space-y-2">
              {recentMessages.slice(0, 6).map((m) => (
                <div key={m.id} className="text-sm border-b border-border pb-2">
                  <span className="font-medium line-clamp-1">{m.content}</span>
                  <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
                </div>
              ))}
              {recentMessages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet</p>}
            </div>
          </div>

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
                  <div className="text-xs text-muted-foreground">
                    by {(c.profiles as any)?.display_name || "Anonymous"} on {(c.blog_posts as any)?.title || "Unknown"} • {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {recentComments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Breakdown ── */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-4">Content Breakdown</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Post Status */}
          <div className="rounded-xl border-2 border-dashed border-border p-5">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" /> Post Status
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
                <span className="text-sm">Total saved by users</span>
                <Badge variant="secondary">{stats.saved}</Badge>
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="rounded-xl border-2 border-dashed border-border p-5">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4" /> Latest Posts
            </h4>
            <div className="space-y-2">
              {topPosts.slice(0, 5).map((p) => (
                <div key={p.id} className="text-sm border-b border-border pb-2 flex items-center justify-between">
                  <span className="font-medium line-clamp-1 flex-1">{p.title}</span>
                  <Badge variant={p.status === "published" ? "default" : "outline"} className="ml-2 text-xs">{p.status}</Badge>
                </div>
              ))}
              {topPosts.length === 0 && <p className="text-sm text-muted-foreground">No posts yet</p>}
            </div>
          </div>

          {/* Freebies Breakdown */}
          <div className="rounded-xl border-2 border-dashed border-border p-5">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
              <Gift className="h-4 w-4" /> Freebies Library
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1"><BookOpen className="h-3 w-3" /> Ebooks</span>
                <Badge className="bg-[hsl(200,80%,78%)] text-foreground hover:bg-[hsl(200,80%,70%)]">{stats.ebooks}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1"><Headphones className="h-3 w-3" /> Podcasts</span>
                <Badge className="bg-[hsl(330,70%,80%)] text-foreground hover:bg-[hsl(330,70%,72%)]">{stats.podcasts}</Badge>
              </div>
              {recentFreebies.length > 0 && (
                <div className="border-t border-border pt-2 mt-2">
                  <p className="text-xs font-bold uppercase mb-1">Latest</p>
                  {recentFreebies.slice(0, 3).map((f) => (
                    <div key={f.id} className="text-xs text-muted-foreground">{f.title} ({f.type})</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Platform Summary Bar ── */}
      <div className="rounded-xl border-2 border-dashed border-border p-5 bg-muted/30">
        <h3 className="text-lg font-black uppercase tracking-tight mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" /> Platform Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Posts", value: stats.posts },
            { label: "Users", value: stats.users },
            { label: "Comments", value: stats.comments },
            { label: "Likes", value: stats.likes },
            { label: "Messages", value: stats.messages },
            { label: "Communities", value: stats.communities },
            { label: "Groups", value: stats.groups },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl font-black">{item.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
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
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const emptyForm = {
    quiz_title: "AI Knowledge Arena",
    category: "general",
    difficulty: "medium",
    question: "",
    explanation: "",
    correct_answer: 0,
    options: ["", "", "", ""],
  };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    Promise.all([
      supabase.from("quiz_questions").select("*").order("created_at", { ascending: false }),
      supabase.from("quiz_results").select("score, total_questions"),
      supabase.from("quiz_results").select("*").order("completed_at", { ascending: false }).limit(20),
    ]).then(([questionsRes, allResultsRes, recentResultsRes]) => {
      if (questionsRes.data) setQuestions(questionsRes.data);
      if (allResultsRes.data) setAllResults(allResultsRes.data);
      if (recentResultsRes.data) setRecentResults(recentResultsRes.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingQuestion(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (question: any) => {
    const nextOptions = Array.isArray(question.options)
      ? question.options.map((option: unknown) => String(option)).slice(0, 4)
      : [];
    while (nextOptions.length < 4) nextOptions.push("");

    setEditingQuestion(question);
    setForm({
      quiz_title: question.quiz_title || "AI Knowledge Arena",
      category: question.category || "general",
      difficulty: question.difficulty || "medium",
      question: question.question || "",
      explanation: question.explanation || "",
      correct_answer: Number(question.correct_answer) || 0,
      options: nextOptions,
    });
    setDialogOpen(true);
  };

  const saveQuestion = async () => {
    const normalizedOptions = form.options.map((option) => option.trim()).filter(Boolean);
    if (!form.question.trim() || normalizedOptions.length < 2) {
      toast({
        title: "Missing question details",
        description: "Add a question and at least two answer options.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      quiz_title: form.quiz_title.trim() || "AI Knowledge Arena",
      category: form.category.trim() || "general",
      difficulty: form.difficulty,
      question: form.question.trim(),
      explanation: form.explanation.trim(),
      correct_answer: Math.min(form.correct_answer, normalizedOptions.length - 1),
      options: normalizedOptions,
    };

    if (editingQuestion) {
      const { error } = await supabase.from("quiz_questions").update(payload).eq("id", editingQuestion.id);
      if (error) {
        toast({ title: "Failed to update question", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Question updated" });
    } else {
      const { error } = await supabase.from("quiz_questions").insert(payload);
      if (error) {
        toast({ title: "Failed to create question", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Question created" });
    }

    setDialogOpen(false);
    setEditingQuestion(null);
    setForm(emptyForm);
    load();
  };

  const deleteQ = async (id: string) => {
    await supabase.from("quiz_questions").delete().eq("id", id);
    toast({ title: "Question deleted" });
    setQuestions((q) => q.filter((x) => x.id !== id));
  };

  const avgScore = allResults.length > 0
    ? Math.round(allResults.reduce((a, r) => a + (r.score / r.total_questions) * 100, 0) / allResults.length)
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
          <div className="text-4xl font-black">{allResults.length}</div>
          <div className="text-xs font-bold uppercase tracking-wider mt-1">Submissions</div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-border bg-[hsl(150,76%,78%)] p-5">
          <TrendingUp className="h-8 w-8 mb-3 text-foreground/70" />
          <div className="text-4xl font-black">{avgScore}%</div>
          <div className="text-xs font-bold uppercase tracking-wider mt-1">Avg Score</div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-tight uppercase">Quiz Questions ({questions.length})</h2>
          <Button onClick={openCreate} className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
        <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.slice(0, 20).map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="text-muted-foreground">{q.quiz_title}</TableCell>
                  <TableCell className="max-w-xs truncate">{q.question}</TableCell>
                  <TableCell><Badge variant="secondary">{q.category || "—"}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{q.difficulty || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(q)}>
                        <PenLine className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteQ(q.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No quiz questions yet. Add the first question to align the Games page with admin content.
                  </TableCell>
                </TableRow>
              )}
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
              {recentResults.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.quiz_title}</TableCell>
                  <TableCell><Badge>{r.score}/{r.total_questions}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(r.completed_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {recentResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No quiz results yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Quiz Question" : "Add Quiz Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                placeholder="Quiz title"
                value={form.quiz_title}
                onChange={(e) => setForm({ ...form, quiz_title: e.target.value })}
              />
              <Input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <Select value={form.difficulty} onValueChange={(value) => setForm({ ...form, difficulty: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Question"
              rows={3}
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />

            <div className="grid gap-3">
              {form.options.map((option, index) => (
                <Input
                  key={index}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const nextOptions = [...form.options];
                    nextOptions[index] = e.target.value;
                    setForm({ ...form, options: nextOptions });
                  }}
                />
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                value={String(form.correct_answer)}
                onValueChange={(value) => setForm({ ...form, correct_answer: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {form.options.map((option, index) => (
                    <SelectItem key={index} value={String(index)}>
                      Correct answer: option {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Explanation"
                rows={3}
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              />
            </div>

            <Button onClick={saveQuestion} className="w-full">
              {editingQuestion ? "Update Question" : "Create Question"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Social Tab ───
function SocialTab() {
  const { toast } = useToast();
  const [communities, setCommunities] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  const load = async () => {
    const [
      communitiesRes,
      groupsRes,
      pendingMembersRes,
      conversationsRes,
      recentMessagesRes,
    ] = await Promise.all([
      supabase.from("communities").select("*").order("created_at", { ascending: false }).limit(12),
      supabase.from("groups").select("*").order("created_at", { ascending: false }).limit(12),
      supabase.from("group_members").select("*").eq("status", "pending").order("joined_at", { ascending: false }).limit(12),
      supabase.from("conversations").select("*").order("updated_at", { ascending: false }).limit(10),
      supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    const pendingUserIds = Array.from(new Set((pendingMembersRes.data || []).map((item) => item.user_id)));
    const pendingGroupIds = Array.from(new Set((pendingMembersRes.data || []).map((item) => item.group_id)));
    const conversationUserIds = Array.from(
      new Set(
        (conversationsRes.data || []).flatMap((item) => [item.participant_1, item.participant_2]),
      ),
    );
    const messageSenderIds = Array.from(new Set((recentMessagesRes.data || []).map((item) => item.sender_id)));

    const profileIds = Array.from(new Set([...pendingUserIds, ...conversationUserIds, ...messageSenderIds]));
    const { data: profiles } = profileIds.length > 0
      ? await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", profileIds)
      : { data: [] as any[] };
    const { data: pendingGroups } = pendingGroupIds.length > 0
      ? await supabase.from("groups").select("id, name").in("id", pendingGroupIds)
      : { data: [] as any[] };

    const pendingWithContext = (pendingMembersRes.data || []).map((item) => ({
      ...item,
      profile: (profiles || []).find((profile) => profile.user_id === item.user_id),
      group: (pendingGroups || []).find((group) => group.id === item.group_id),
    }));

    const conversationsWithProfiles = (conversationsRes.data || []).map((item) => ({
      ...item,
      participantOne: (profiles || []).find((profile) => profile.user_id === item.participant_1),
      participantTwo: (profiles || []).find((profile) => profile.user_id === item.participant_2),
    }));

    const messagesWithProfiles = (recentMessagesRes.data || []).map((item) => ({
      ...item,
      senderProfile: (profiles || []).find((profile) => profile.user_id === item.sender_id),
    }));

    setCommunities(communitiesRes.data || []);
    setGroups(groupsRes.data || []);
    setPendingMembers(pendingWithContext);
    setConversations(conversationsWithProfiles);
    setRecentMessages(messagesWithProfiles);
  };

  useEffect(() => {
    load();
  }, []);

  const updatePendingMember = async (memberId: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("group_members").update({ status }).eq("id", memberId);
    if (error) {
      toast({ title: "Failed to update member", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Member ${status}` });
    load();
  };

  const deleteCommunity = async (id: string) => {
    const { error } = await supabase.from("communities").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete community", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Community deleted" });
    load();
  };

  const deleteGroup = async (id: string) => {
    const { error } = await supabase.from("groups").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete group", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Group deleted" });
    load();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: Globe, value: communities.length, label: "Communities", bg: "hsl(150,76%,78%)" },
          { icon: UsersRound, value: groups.length, label: "Groups", bg: "hsl(330,70%,80%)" },
          { icon: AlertTriangle, value: pendingMembers.length, label: "Pending Requests", bg: "hsl(45,100%,70%)" },
          { icon: MessagesSquare, value: conversations.length, label: "Tracked Conversations", bg: "hsl(200,80%,78%)" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border-2 border-dashed border-border p-5" style={{ backgroundColor: card.bg }}>
            <card.icon className="mb-3 h-8 w-8 text-foreground/70" />
            <div className="text-4xl font-black">{card.value}</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider">{card.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-black tracking-tight uppercase">Pending Group Requests</h2>
        <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.profile?.display_name || "User"}</TableCell>
                  <TableCell>{member.group?.name || "Group"}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(member.joined_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => updatePendingMember(member.id, "approved")}>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updatePendingMember(member.id, "rejected")}>
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pendingMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No pending member requests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-black tracking-tight uppercase">Communities</h2>
          <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communities.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell className="font-medium">{community.name}</TableCell>
                    <TableCell>{community.topic || "general"}</TableCell>
                    <TableCell className="text-muted-foreground">{community.language?.toUpperCase() || "EN"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="destructive" onClick={() => deleteCommunity(community.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-black tracking-tight uppercase">Groups</h2>
          <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.topic || "general"}</TableCell>
                    <TableCell className="text-muted-foreground">{group.language?.toUpperCase() || "EN"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="destructive" onClick={() => deleteGroup(group.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-xl border-2 border-dashed border-border p-5">
          <h2 className="mb-4 text-2xl font-black tracking-tight uppercase">Recent Conversations</h2>
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="rounded-xl border border-border bg-card p-4">
                <p className="font-medium">
                  {(conversation.participantOne?.display_name || "User A")} and {(conversation.participantTwo?.display_name || "User B")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {new Date(conversation.updated_at).toLocaleString()}
                </p>
              </div>
            ))}
            {conversations.length === 0 && <p className="text-sm text-muted-foreground">No accessible conversations yet.</p>}
          </div>
        </div>

        <div className="rounded-xl border-2 border-dashed border-border p-5">
          <h2 className="mb-4 text-2xl font-black tracking-tight uppercase">Recent Messages</h2>
          <div className="space-y-3">
            {recentMessages.map((message) => (
              <div key={message.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm">{message.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {(message.senderProfile?.display_name || "User")} · {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            {recentMessages.length === 0 && <p className="text-sm text-muted-foreground">No accessible messages yet.</p>}
          </div>
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

// ─── Image Library Tab ───
function ImagesTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    thumbnail_url: "",
    category: "general",
    collection: "default",
    orientation: "landscape",
    tags: "",
    is_featured: false,
    sort_order: 0,
  });

  const load = () => {
    supabase
      .from("image_library_items")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const all = new Set<string>();
    items.forEach((item) => {
      if (item.category) all.add(item.category);
    });
    return ["all", ...Array.from(all)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const keyword = `${item.title} ${item.description || ""} ${item.category || ""} ${item.collection || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
      const matchesSearch = keyword.includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      title: "",
      description: "",
      image_url: "",
      thumbnail_url: "",
      category: "general",
      collection: "default",
      orientation: "landscape",
      tags: "",
      is_featured: false,
      sort_order: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      image_url: item.image_url || "",
      thumbnail_url: item.thumbnail_url || "",
      category: item.category || "general",
      collection: item.collection || "default",
      orientation: item.orientation || "landscape",
      tags: (item.tags || []).join(", "),
      is_featured: !!item.is_featured,
      sort_order: item.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.image_url) {
      toast({ title: "Title and image URL are required", variant: "destructive" });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      image_url: form.image_url,
      thumbnail_url: form.thumbnail_url || null,
      category: form.category || "general",
      collection: form.collection || "default",
      orientation: form.orientation || "landscape",
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      is_featured: form.is_featured,
      sort_order: Number(form.sort_order) || 0,
    };

    if (editingItem) {
      const { error } = await supabase.from("image_library_items").update(payload).eq("id", editingItem.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Image updated" });
    } else {
      const { error } = await supabase.from("image_library_items").insert({
        ...payload,
        created_by: user?.id,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Image added" });
    }

    setDialogOpen(false);
    load();
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("image_library_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Image deleted" });
    load();
  };

  const uploadImage = async (file: File, onDone: (url: string) => void) => {
    const path = `image-library/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    onDone(pub.publicUrl);
    toast({ title: "Image uploaded" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-black tracking-tight uppercase">Manage Image Library ({filteredItems.length})</h2>
        <Button onClick={openCreate} className="rounded-full">+ Add Image</Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <Input placeholder="Search by title, category, tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="md:max-w-md" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[82vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Image Item" : "Add Image Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Category (e.g. abstract)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Collection (e.g. hero-set)" value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })} />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Select value={form.orientation} onValueChange={(v) => setForm({ ...form, orientation: v })}>
                <SelectTrigger><SelectValue placeholder="Orientation" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={form.is_featured ? "yes" : "no"}
                onValueChange={(v) => setForm({ ...form, is_featured: v === "yes" })}
              >
                <SelectTrigger><SelectValue placeholder="Featured" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Not Featured</SelectItem>
                  <SelectItem value="yes">Featured</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Sort Order"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
              />
            </div>

            <Input
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />

            <div>
              <label className="text-sm font-medium mb-1 block">Primary Image URL</label>
              <div className="flex gap-2">
                <Input placeholder="https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="flex-1" />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, (url) => setForm((f) => ({ ...f, image_url: url })));
                    }}
                  />
                  <span className="inline-flex items-center px-3 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4 mr-1" /> Upload
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Thumbnail URL (optional)</label>
              <Input placeholder="https://..." value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
            </div>

            <Button onClick={save} className="w-full">{editingItem ? "Update Image" : "Create Image"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <img src={item.thumbnail_url || item.image_url} alt={item.title} className="h-12 w-16 rounded-md object-cover border border-border" />
                </TableCell>
                <TableCell className="font-medium max-w-[220px] truncate">{item.title}</TableCell>
                <TableCell className="capitalize">{item.category}</TableCell>
                <TableCell className="capitalize">{item.collection}</TableCell>
                <TableCell>
                  {item.is_featured ? <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No image items yet. Add your first image asset.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Prompt Library Tab ───
function PromptsTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    prompt_text: "",
    category: "general",
    model: "any",
    difficulty: "medium",
    tags: "",
    is_featured: false,
    sort_order: 0,
  });

  const load = () => {
    supabase
      .from("prompt_library_items")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const all = new Set<string>();
    items.forEach((item) => {
      if (item.category) all.add(item.category);
    });
    return ["all", ...Array.from(all)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const keyword = `${item.title} ${item.description || ""} ${item.prompt_text || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
      const matchesSearch = keyword.includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      title: "",
      description: "",
      prompt_text: "",
      category: "general",
      model: "any",
      difficulty: "medium",
      tags: "",
      is_featured: false,
      sort_order: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      prompt_text: item.prompt_text || "",
      category: item.category || "general",
      model: item.model || "any",
      difficulty: item.difficulty || "medium",
      tags: (item.tags || []).join(", "),
      is_featured: !!item.is_featured,
      sort_order: item.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.prompt_text) {
      toast({ title: "Title and prompt text are required", variant: "destructive" });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      prompt_text: form.prompt_text,
      category: form.category || "general",
      model: form.model || "any",
      difficulty: form.difficulty || "medium",
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      is_featured: form.is_featured,
      sort_order: Number(form.sort_order) || 0,
    };

    if (editingItem) {
      const { error } = await supabase.from("prompt_library_items").update(payload).eq("id", editingItem.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Prompt updated" });
    } else {
      const { error } = await supabase.from("prompt_library_items").insert({
        ...payload,
        created_by: user?.id,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Prompt created" });
    }

    setDialogOpen(false);
    load();
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("prompt_library_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Prompt deleted" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-black tracking-tight uppercase">Manage Prompt Library ({filteredItems.length})</h2>
        <Button onClick={openCreate} className="rounded-full">+ Add Prompt</Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <Input placeholder="Search by title, use case, tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="md:max-w-md" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[82vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Prompt Item" : "Add Prompt Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Textarea placeholder="Prompt text" rows={8} value={form.prompt_text} onChange={(e) => setForm({ ...form, prompt_text: e.target.value })} />

            <div className="grid gap-3 md:grid-cols-3">
              <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Model (GPT-4o, Claude, etc.)" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              <Input placeholder="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              <Input
                type="number"
                placeholder="Sort Order"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
              />
            </div>

            <Select
              value={form.is_featured ? "yes" : "no"}
              onValueChange={(v) => setForm({ ...form, is_featured: v === "yes" })}
            >
              <SelectTrigger><SelectValue placeholder="Featured status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Not Featured</SelectItem>
                <SelectItem value="yes">Featured</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={save} className="w-full">{editingItem ? "Update Prompt" : "Create Prompt"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium max-w-[280px] truncate">{item.title}</TableCell>
                <TableCell className="capitalize">{item.category}</TableCell>
                <TableCell>{item.model || "any"}</TableCell>
                <TableCell className="capitalize">{item.difficulty || "medium"}</TableCell>
                <TableCell>
                  {item.is_featured ? <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No prompts yet. Add your first prompt item.
                </TableCell>
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
        <Button onClick={() => navigate("/home")} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Go Home</Button>
      </div>
    );
  }

  const tabs: { label: string; key: Tab; icon: any; count?: number }[] = [
    { label: "Analytics", key: "analytics", icon: BarChart3 },
    { label: "Posts", key: "posts", icon: FileText },
    { label: "Users", key: "users", icon: Users },
    { label: "Quiz", key: "quiz", icon: HelpCircle },
    { label: "Social", key: "social", icon: UsersRound },
    { label: "Freebies", key: "freebies", icon: Gift },
    { label: "Images", key: "images", icon: Images },
    { label: "Prompts", key: "prompts", icon: Sparkles },
  ];

  const tabContent: Record<Tab, JSX.Element> = {
    analytics: <AnalyticsOverviewTab />,
    posts: <PostsTab />,
    users: <UsersTab />,
    quiz: <QuizTab />,
    social: <SocialTab />,
    freebies: <FreebiesTab />,
    images: <ImagesTab />,
    prompts: <PromptsTab />,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header Bar */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center h-14">
          <button onClick={() => navigate("/home")} className="mr-auto">
            <span className="spotai-wordmark text-xl font-extrabold tracking-tight">
              SpotAI
            </span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {profile?.display_name || user.email}
            </span>
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
        <div className="mb-6 rounded-[1.75rem] border border-border bg-secondary/40 p-6">
          <h1 className="text-4xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage only the features the live product actually uses: posts, social data, quiz content, freebies, and the new media libraries.
          </p>
        </div>

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
