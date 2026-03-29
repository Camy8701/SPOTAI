import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Heart, BookOpen, User } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ProfileData {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  headline: string | null;
  created_at: string;
}

interface UserPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  category: string;
  published_at: string | null;
  created_at: string;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);

    const [profileRes, postsRes, likesRes, commentsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name, avatar_url, bio, headline, created_at").eq("user_id", userId!).single(),
      supabase.from("blog_posts").select("id, title, slug, excerpt, featured_image, category, published_at, created_at").eq("author_id", userId!).eq("status", "published").order("created_at", { ascending: false }).limit(10),
      supabase.from("likes").select("id", { count: "exact", head: true }).eq("user_id", userId!),
      supabase.from("comments").select("id", { count: "exact", head: true }).eq("user_id", userId!),
    ]);

    setProfile(profileRes.data || null);
    setPosts((postsRes.data as UserPost[]) || []);
    setPostCount(postsRes.data?.length || 0);
    setLikeCount(likesRes.count || 0);
    setCommentCount(commentsRes.count || 0);
    setLoading(false);
  };

  const startConversation = async () => {
    if (!user || !userId) {
      toast({ title: "Sign in required", description: "Please sign in to send messages." });
      return;
    }
    if (user.id === userId) {
      toast({ title: "That's you!", description: "You can't message yourself." });
      return;
    }

    // Check for existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${userId}),and(participant_1.eq.${userId},participant_2.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      navigate("/messages");
      return;
    }

    const { error } = await supabase.from("conversations").insert({
      participant_1: user.id,
      participant_2: userId,
    });

    if (error) {
      toast({ title: "Error", description: "Could not start conversation.", variant: "destructive" });
      return;
    }

    navigate("/messages");
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
          <Link to="/home"><Button>Back to Home</Button></Link>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/home" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} /> Back
        </Link>

        {/* Profile Header */}
        <div className="text-center mb-10">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name || ""} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-border" />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-primary/10 flex items-center justify-center border-4 border-border">
              <User className="h-10 w-10 text-primary" />
            </div>
          )}

          <h1 className="text-2xl font-bold text-foreground">
            {profile.display_name || "Unnamed User"}
          </h1>
          {profile.headline && (
            <p className="text-muted-foreground mt-1">{profile.headline}</p>
          )}
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{profile.bio}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Member since {format(new Date(profile.created_at), "MMMM yyyy")}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{postCount}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen className="h-3 w-3" /> Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{likeCount}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1"><Heart className="h-3 w-3" /> Likes</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{commentCount}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Comments</div>
            </div>
          </div>

          {/* Actions */}
          {!isOwnProfile && user && (
            <div className="mt-6">
              <Button onClick={startConversation} className="gap-2">
                <MessageCircle size={16} /> Send Message
              </Button>
            </div>
          )}
          {isOwnProfile && (
            <div className="mt-6">
              <Link to="/profile-settings">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            </div>
          )}
        </div>

        {/* User Posts */}
        {posts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">Posts</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <Link key={post.id} to={`/post/${post.slug}`} className="block group">
                  <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex gap-4">
                      {post.featured_image && (
                        <img src={post.featured_image} alt={post.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                      )}
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-primary uppercase">{post.category}</span>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{post.title}</h3>
                        {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.excerpt}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(post.published_at || post.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {posts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">This user hasn't published any posts yet.</p>
        )}
      </div>
    </Layout>
  );
};

export default UserProfile;
