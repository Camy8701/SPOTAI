import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, CheckCheck, Filter, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FilterStatus = "all" | "unread" | "read";
type FilterType = "all" | "new_post" | "trending" | "system";

const TYPE_LABELS: Record<string, string> = {
  new_post: "New Post",
  trending: "Trending",
  system: "System",
};

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
  });

  const filtered = notifications.filter((n) => {
    if (statusFilter === "unread" && n.is_read) return false;
    if (statusFilter === "read" && !n.is_read) return false;
    if (typeFilter !== "all" && n.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Bell className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Please sign in to view notifications.</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">{unreadCount} unread</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(["all", "unread", "read"] as FilterStatus[]).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="capitalize text-xs"
              >
                {s}
              </Button>
            ))}
          </div>
          <span className="text-muted-foreground text-xs">|</span>
          <div className="flex gap-1">
            {(["all", "new_post", "trending", "system"] as FilterType[]).map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter(t)}
                className="text-xs"
              >
                {t === "all" ? "All Types" : TYPE_LABELS[t] || t}
              </Button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No notifications found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`relative flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer group ${
                  n.is_read
                    ? "bg-card border-border"
                    : "bg-primary/5 border-primary/20"
                }`}
                onClick={() => {
                  if (!n.is_read) markReadMutation.mutate(n.id);
                  if (n.link) navigate(n.link);
                }}
              >
                {!n.is_read && (
                  <span className="absolute top-4 left-2 h-2 w-2 rounded-full bg-primary" />
                )}
                <div className="flex-1 min-w-0 ml-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {TYPE_LABELS[n.type] || n.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-foreground truncate">{n.title}</p>
                  {n.message && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); markReadMutation.mutate(n.id); }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
