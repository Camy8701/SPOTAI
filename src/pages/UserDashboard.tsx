import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Heart,
  Bookmark,
  MessageSquare,
  User,
  HelpCircle,
  Users,
  UsersRound,
  MessagesSquare,
  ArrowUpRight,
  BookOpen,
  Headphones,
  Images,
  Sparkles,
  CheckCircle2,
  Clock3,
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
import {
  ProfileAvatarPicker,
  getAvatarDataUrl,
  getAvatarSelectionFromDataUrl,
  getDefaultAvatarSelection,
} from "@/components/auth/ProfileAvatarPicker";

type Tab =
  | "overview"
  | "saved"
  | "liked"
  | "comments"
  | "quiz"
  | "communities"
  | "groups"
  | "messages"
  | "profile";

function SpotlightShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-border bg-card p-6 shadow-[0_12px_34px_rgba(15,23,42,0.06)] md:p-8">
      <div className="mb-6">
        <h2 className="text-3xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.7rem] border border-dashed border-border bg-secondary/60 px-6 py-10 text-center">
      <Icon className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-4 text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {cta ? <div className="mt-5">{cta}</div> : null}
    </div>
  );
}

function OverviewTab() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    saved: 0,
    liked: 0,
    comments: 0,
    quizResults: 0,
    communities: 0,
    groupsApproved: 0,
    groupsPending: 0,
    conversations: 0,
  });
  const [resources, setResources] = useState({
    ebooks: 0,
    podcasts: 0,
    images: 0,
    prompts: 0,
  });
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [recentQuizResults, setRecentQuizResults] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      supabase.from("saved_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("likes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("comments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("quiz_results").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("community_members").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("group_members").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "approved"),
      supabase.from("group_members").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending"),
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`),
      supabase.from("freebies").select("id", { count: "exact", head: true }).eq("type", "ebook"),
      supabase.from("freebies").select("id", { count: "exact", head: true }).eq("type", "podcast"),
      supabase.from("image_library_items").select("id", { count: "exact", head: true }),
      supabase.from("prompt_library_items").select("id", { count: "exact", head: true }),
      supabase
        .from("comments")
        .select("id, content, created_at, blog_posts(title, slug)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("quiz_results")
        .select("id, quiz_title, score, total_questions, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(4),
    ]).then(([
      saved,
      liked,
      comments,
      quizResults,
      communities,
      groupsApproved,
      groupsPending,
      conversations,
      ebooks,
      podcasts,
      images,
      prompts,
      recentCommentsRes,
      recentQuizResultsRes,
    ]) => {
      setStats({
        saved: saved.count ?? 0,
        liked: liked.count ?? 0,
        comments: comments.count ?? 0,
        quizResults: quizResults.count ?? 0,
        communities: communities.count ?? 0,
        groupsApproved: groupsApproved.count ?? 0,
        groupsPending: groupsPending.count ?? 0,
        conversations: conversations.count ?? 0,
      });
      setResources({
        ebooks: ebooks.count ?? 0,
        podcasts: podcasts.count ?? 0,
        images: images.count ?? 0,
        prompts: prompts.count ?? 0,
      });
      setRecentComments(recentCommentsRes.data ?? []);
      setRecentQuizResults(recentQuizResultsRes.data ?? []);
    });
  }, [user]);

  const statCards = [
    { label: "Saved posts", value: stats.saved, tone: "bg-[hsl(217,91%,94%)] text-blue-700" },
    { label: "Liked posts", value: stats.liked, tone: "bg-[hsl(330,81%,94%)] text-pink-700" },
    { label: "Comments", value: stats.comments, tone: "bg-[hsl(35,100%,93%)] text-amber-700" },
    { label: "Quiz results", value: stats.quizResults, tone: "bg-[hsl(271,81%,94%)] text-violet-700" },
    { label: "Communities", value: stats.communities, tone: "bg-[hsl(150,76%,92%)] text-emerald-700" },
    {
      label: "Groups",
      value: stats.groupsApproved,
      meta: stats.groupsPending > 0 ? `${stats.groupsPending} pending` : "approved",
      tone: "bg-[hsl(342,80%,94%)] text-rose-700",
    },
    { label: "Conversations", value: stats.conversations, tone: "bg-[hsl(193,90%,93%)] text-cyan-700" },
  ];

  const resourceCards = [
    { label: "Ebooks", value: resources.ebooks, href: "/freebies/ebooks", icon: BookOpen, accent: "bg-blue-500" },
    { label: "Podcasts", value: resources.podcasts, href: "/freebies/podcasts", icon: Headphones, accent: "bg-violet-500" },
    { label: "Images", value: resources.images, href: "/image-library", icon: Images, accent: "bg-cyan-500" },
    { label: "Prompts", value: resources.prompts, href: "/prompt-library", icon: Sparkles, accent: "bg-fuchsia-500" },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.1),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_24%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Member Dashboard
            </span>
            <h2 className="mt-5 text-5xl leading-[0.95] tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
              Track everything you do across SpotAI.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              This dashboard only surfaces data the platform actually stores. Social activity, quiz results, saved content,
              memberships, and profile settings live here. Static browse pages are exposed as catalog links, not fake usage metrics.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-background/80 p-5 backdrop-blur">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-2xl border border-border object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary text-2xl font-semibold">
                  {(profile?.display_name || user?.email || "S").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Signed in as</p>
                <p className="mt-1 text-xl font-semibold">{profile?.display_name || user?.email?.split("@")[0]}</p>
                <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SpotlightShell title="Your activity" description="Live stats from your saved posts, comments, quiz results, memberships, and conversations.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-[1.5rem] border border-border bg-secondary/70 p-5">
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${card.tone}`}>
                {card.label}
              </div>
              <p className="mt-4 text-4xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{card.meta || "Stored in your account"}</p>
            </div>
          ))}
        </div>
      </SpotlightShell>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <SpotlightShell title="Recent history" description="The latest persisted actions from your account.">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border bg-secondary/60 p-5">
              <div className="mb-4 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-violet-500" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quiz results</p>
              </div>
              {recentQuizResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No stored quiz results yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentQuizResults.map((result) => (
                    <div key={result.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{result.quiz_title}</p>
                        <Badge variant="secondary">{result.score}/{result.total_questions}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Completed {new Date(result.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-border bg-secondary/60 p-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-sky-500" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Comments</p>
              </div>
              {recentComments.length === 0 ? (
                <p className="text-sm text-muted-foreground">You have not commented on posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentComments.map((comment) => (
                    <div key={comment.id} className="rounded-2xl border border-border bg-background p-4">
                      <p className="line-clamp-2 text-sm">{comment.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {(comment.blog_posts as any)?.title || "Blog post"} · {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SpotlightShell>

        <SpotlightShell title="Platform resources" description="Available catalog counts from the real content libraries.">
          <div className="grid gap-4 sm:grid-cols-2">
            {resourceCards.map((card) => (
              <Link
                key={card.label}
                to={card.href}
                className="group rounded-[1.5rem] border border-border bg-secondary/60 p-5 transition-colors hover:border-foreground/20 hover:bg-secondary"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${card.accent}`}>
                    <card.icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight">{card.value}</p>
                <p className="mt-1 text-sm font-medium">{card.label}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Open library</p>
              </Link>
            ))}
          </div>
        </SpotlightShell>
      </div>
    </div>
  );
}

function SavedTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState<any[]>([]);

  const load = () => {
    if (!user) return;
    supabase
      .from("saved_posts")
      .select("*, blog_posts(title, slug, category)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setSaved(data || []));
  };

  useEffect(() => {
    load();
  }, [user]);

  const unsave = async (id: string) => {
    await supabase.from("saved_posts").delete().eq("id", id);
    toast({ title: "Post removed from saved items" });
    load();
  };

  return (
    <SpotlightShell title="Saved posts" description="Articles and stories you bookmarked for later.">
      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved posts yet"
          description="Save articles from the news and stories sections to build your reading queue."
          cta={<Link to="/library"><Button className="rounded-full">Browse news & articles</Button></Link>}
        />
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Saved on</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saved.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{(item.blog_posts as any)?.title || "Untitled post"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{(item.blog_posts as any)?.category || "General"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => unsave(item.id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SpotlightShell>
  );
}

function LikedTab() {
  const { user } = useAuth();
  const [liked, setLiked] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("likes")
      .select("*, blog_posts(title, category)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setLiked(data || []));
  }, [user]);

  return (
    <SpotlightShell title="Liked posts" description="Posts you have actively liked across the blog.">
      {liked.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No likes yet"
          description="Like posts to keep track of the stories and collections that matter to you."
          cta={<Link to="/home"><Button className="rounded-full">Go to homepage</Button></Link>}
        />
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Liked on</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liked.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{(item.blog_posts as any)?.title || "Untitled post"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{(item.blog_posts as any)?.category || "General"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SpotlightShell>
  );
}

function CommentsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<any[]>([]);

  const load = () => {
    if (!user) return;
    supabase
      .from("comments")
      .select("*, blog_posts(title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setComments(data || []));
  };

  useEffect(() => {
    load();
  }, [user]);

  const deleteComment = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    toast({ title: "Comment deleted" });
    load();
  };

  return (
    <SpotlightShell title="Comments" description="Everything you have posted in article discussions.">
      {comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Start a conversation on any article and it will show up here."
          cta={<Link to="/library"><Button className="rounded-full">Explore articles</Button></Link>}
        />
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comment</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-sm">{comment.content}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{(comment.blog_posts as any)?.title || "Blog post"}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => deleteComment(comment.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SpotlightShell>
  );
}

function QuizResultsTab() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .then(({ data }) => setResults(data || []));
  }, [user]);

  const bestScore = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((best, item) => {
      const ratio = item.total_questions > 0 ? item.score / item.total_questions : 0;
      return ratio > best.ratio ? { ratio, label: `${item.score}/${item.total_questions}` } : best;
    }, { ratio: -1, label: "0/0" });
  }, [results]);

  return (
    <SpotlightShell title="Quiz history" description="Stored quiz rounds from the live Games page.">
      {results.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No quiz history yet"
          description="Play the AI quiz and your results will be stored here automatically."
          cta={<Link to="/quiz"><Button className="rounded-full">Open games</Button></Link>}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-border bg-secondary/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Stored rounds</p>
              <p className="mt-3 text-4xl font-semibold">{results.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border bg-secondary/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best score</p>
              <p className="mt-3 text-4xl font-semibold">{bestScore?.label || "0/0"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border bg-secondary/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Latest round</p>
              <p className="mt-3 text-lg font-semibold">
                {new Date(results[0].completed_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.quiz_title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{result.score}/{result.total_questions}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(result.completed_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </SpotlightShell>
  );
}

function CommunitiesTab() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data: membershipRows } = await supabase
        .from("community_members")
        .select("community_id, joined_at")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });

      const communityIds = (membershipRows || []).map((item) => item.community_id);
      if (communityIds.length === 0) {
        setMemberships([]);
        return;
      }

      const { data: communities } = await supabase
        .from("communities")
        .select("*")
        .in("id", communityIds);

      const merged = (membershipRows || []).map((item) => ({
        ...item,
        community: (communities || []).find((community) => community.id === item.community_id),
      }));
      setMemberships(merged);
    };

    load();
  }, [user]);

  return (
    <SpotlightShell title="Communities" description="Public communities you joined from the social side of SpotAI.">
      {memberships.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No community memberships yet"
          description="Join a public community to keep its language and topic groups visible here."
          cta={<Link to="/communities"><Button className="rounded-full">Explore communities</Button></Link>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {memberships.map((membership) => (
            <div key={membership.community_id} className="rounded-[1.5rem] border border-border bg-secondary/60 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{membership.community?.name || "Community"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{membership.community?.description || "No description"}</p>
                </div>
                <Badge variant="secondary">{membership.community?.language?.toUpperCase() || "EN"}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>{membership.community?.topic || "general"}</span>
                <span>Joined {new Date(membership.joined_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SpotlightShell>
  );
}

function GroupsTab() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data: membershipRows } = await supabase
        .from("group_members")
        .select("group_id, status, joined_at")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });

      const groupIds = (membershipRows || []).map((item) => item.group_id);
      if (groupIds.length === 0) {
        setMemberships([]);
        return;
      }

      const { data: groups } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);

      const merged = (membershipRows || []).map((item) => ({
        ...item,
        group: (groups || []).find((group) => group.id === item.group_id),
      }));
      setMemberships(merged);
    };

    load();
  }, [user]);

  const badgeTone = (status: string) => {
    if (status === "approved") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    if (status === "pending") return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
  };

  return (
    <SpotlightShell title="Groups" description="Private-group applications and memberships tied to your account.">
      {memberships.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No group requests yet"
          description="Request to join or create a private group and the membership state will appear here."
          cta={<Link to="/groups"><Button className="rounded-full">Open groups</Button></Link>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {memberships.map((membership) => (
            <div key={membership.group_id} className="rounded-[1.5rem] border border-border bg-secondary/60 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{membership.group?.name || "Private group"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{membership.group?.description || "No description"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${badgeTone(membership.status)}`}>
                  {membership.status}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>{membership.group?.topic || "general"}</span>
                <span>{new Date(membership.joined_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SpotlightShell>
  );
}

function MessagesTab() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      const otherIds = (data || []).map((conversation) =>
        conversation.participant_1 === user.id ? conversation.participant_2 : conversation.participant_1,
      );

      const { data: profiles } = otherIds.length > 0
        ? await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", otherIds)
        : { data: [] as any[] };

      const merged = (data || []).map((conversation) => {
        const otherId = conversation.participant_1 === user.id ? conversation.participant_2 : conversation.participant_1;
        return {
          ...conversation,
          otherProfile: (profiles || []).find((profileItem) => profileItem.user_id === otherId),
        };
      });

      setConversations(merged);
    };

    load();
  }, [user]);

  return (
    <SpotlightShell title="Messages" description="Conversation threads currently attached to your account.">
      {conversations.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No conversations yet"
          description="Search for a user in Messages to start a conversation."
          cta={<Link to="/messages"><Button className="rounded-full">Open messages</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              to="/messages"
              className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-border bg-secondary/60 p-5 transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-4">
                {conversation.otherProfile?.avatar_url ? (
                  <img
                    src={conversation.otherProfile.avatar_url}
                    alt=""
                    className="h-12 w-12 rounded-2xl border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background font-semibold">
                    {(conversation.otherProfile?.display_name || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{conversation.otherProfile?.display_name || "User"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Updated {new Date(conversation.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </SpotlightShell>
  );
}

function ProfileTab() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [headline, setHeadline] = useState(profile?.headline || "");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [selectedAvatar, setSelectedAvatar] = useState(() => getDefaultAvatarSelection());
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, display_name, headline, bio, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setDisplayName(data.display_name || "");
        setHeadline(data.headline || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || null);
        const matchedAvatar = getAvatarSelectionFromDataUrl(data.avatar_url);
        setSelectedAvatar(matchedAvatar ?? getDefaultAvatarSelection());
        setAvatarDirty(false);
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const nextAvatarUrl = avatarDirty ? getAvatarDataUrl(selectedAvatar) : avatarUrl;
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        display_name: displayName.trim(),
        headline: headline.trim() || null,
        bio,
        avatar_url: nextAvatarUrl,
      })
      .eq("user_id", user.id);
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setAvatarUrl(nextAvatarUrl);
    setAvatarDirty(false);
    await refreshProfile();
    toast({ title: "Profile updated" });
  };

  const previewAvatarUrl = avatarDirty ? getAvatarDataUrl(selectedAvatar) : avatarUrl;

  return (
    <SpotlightShell title="Profile settings" description="Edit your identity details, bio, and SpotAI avatar from one place.">
      <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="rounded-[1.7rem] border border-border bg-secondary/60 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Current profile</p>
            <div className="mt-5 flex items-center gap-4">
              {previewAvatarUrl ? (
                <img src={previewAvatarUrl} alt="" className="h-20 w-20 rounded-[1.25rem] border border-border object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.25rem] border border-border bg-background text-2xl font-semibold">
                  {(displayName || user?.email || "S").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xl font-semibold">{displayName || "Your display name"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{[firstName, lastName].filter(Boolean).join(" ") || "Name not set yet"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            {headline ? <p className="mt-4 text-sm text-muted-foreground">{headline}</p> : null}
            {!avatarDirty && avatarUrl && !getAvatarSelectionFromDataUrl(avatarUrl) ? (
              <p className="mt-4 text-xs text-muted-foreground">
                You currently use an external custom avatar. Choosing a SpotAI avatar below will replace it.
              </p>
            ) : null}
          </div>

          <ProfileAvatarPicker
            className="bg-card"
            value={selectedAvatar}
            onChange={(selection) => {
              setSelectedAvatar(selection);
              setAvatarDirty(true);
            }}
          />
        </div>

        <div className="rounded-[1.7rem] border border-border bg-secondary/60 p-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-foreground">First name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-2 rounded-2xl" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Last name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-2 rounded-2xl" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Display name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-2 rounded-2xl" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Headline</label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-2 rounded-2xl" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} className="mt-2 rounded-2xl" />
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Email</label>
              <Input value={user?.email || ""} disabled className="mt-2 rounded-2xl" />
            </div>
            <Button onClick={save} disabled={saving} className="rounded-full">
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </div>
      </div>
    </SpotlightShell>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading, profile } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">Loading...</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-16">
          <div className="rounded-[2rem] border border-border bg-card px-8 py-12 text-center shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="mt-5 text-4xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
              Sign in to access your dashboard
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your saved content, quiz history, memberships, and profile settings are available once you sign in.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => navigate("/auth")} className="rounded-full">Sign In</Button>
              <Button onClick={() => navigate("/home")} variant="outline" className="rounded-full">Back home</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs: { label: string; key: Tab; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "Overview", key: "overview", icon: LayoutDashboard },
    { label: "Saved", key: "saved", icon: Bookmark },
    { label: "Liked", key: "liked", icon: Heart },
    { label: "Comments", key: "comments", icon: MessageSquare },
    { label: "Quiz", key: "quiz", icon: HelpCircle },
    { label: "Communities", key: "communities", icon: Users },
    { label: "Groups", key: "groups", icon: UsersRound },
    { label: "Messages", key: "messages", icon: MessagesSquare },
    { label: "Profile", key: "profile", icon: User },
  ];

  const tabContent: Record<Tab, JSX.Element> = {
    overview: <OverviewTab />,
    saved: <SavedTab />,
    liked: <LikedTab />,
    comments: <CommentsTab />,
    quiz: <QuizResultsTab />,
    communities: <CommunitiesTab />,
    groups: <GroupsTab />,
    messages: <MessagesTab />,
    profile: <ProfileTab />,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="mb-8 rounded-[2rem] border border-border bg-secondary/40 p-6 md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  SpotAI account center
                </span>
                <h1 className="mt-5 text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  Your dashboard
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Keep your account activity, memberships, messages, quiz progress, and profile details in sync with the actual platform.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-background px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account</p>
                <p className="mt-2 text-lg font-semibold">{profile?.display_name || user.email?.split("@")[0]}</p>
                <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </section>

          <div className="mb-8 flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === item.key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          {tabContent[tab]}
        </div>
      </div>
    </Layout>
  );
}
