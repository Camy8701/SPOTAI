import { supabase } from "@/integrations/supabase/client";

type BasicProfile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type ScopedPost = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  status: string;
  author_id: string | null;
  authorName?: string;
};

const loadProfiles = async (userIds: string[]) => {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) return new Map<string, BasicProfile>();

  const { data } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", uniqueIds);

  return new Map((data || []).map((profile) => [profile.user_id, profile as BasicProfile]));
};

export const fetchCommunityManagementData = async (communityId: string, ownerId?: string | null) => {
  const [membersRes, adminsRes, bansRes, postsRes] = await Promise.all([
    supabase.from("community_members").select("*").eq("community_id", communityId).order("joined_at", { ascending: true }),
    supabase.from("community_admins" as any).select("*").eq("community_id", communityId).order("created_at", { ascending: true }),
    supabase.from("community_bans" as any).select("*").eq("community_id", communityId).order("created_at", { ascending: false }),
    supabase.from("blog_posts").select("id, title, slug, created_at, status, author_id").order("created_at", { ascending: false }).limit(20),
  ]);

  const profileMap = await loadProfiles([
    ...(membersRes.data || []).map((item: any) => item.user_id),
    ...(adminsRes.data || []).map((item: any) => item.user_id),
    ...(bansRes.data || []).map((item: any) => item.user_id),
    ...(postsRes.data || []).map((item: any) => item.author_id || ""),
    ownerId || "",
  ]);

  const adminSet = new Set((adminsRes.data || []).map((admin) => admin.user_id));

  return {
    members: (membersRes.data || []).map((member) => ({
      ...member,
      profile: profileMap.get(member.user_id),
      isOwner: ownerId === member.user_id,
      isAdmin: ownerId === member.user_id || adminSet.has(member.user_id),
    })),
    admins: (adminsRes.data || []).map((admin) => ({
      ...admin,
      profile: profileMap.get(admin.user_id),
    })),
    bans: (bansRes.data || []).map((ban) => ({
      ...ban,
      profile: profileMap.get(ban.user_id),
    })),
    posts: ((postsRes.data || []) as ScopedPost[]).map((post) => ({
      ...post,
      authorName: profileMap.get(post.author_id || "")?.display_name || "Unknown author",
    })),
  };
};

export const fetchGroupManagementData = async (groupId: string, ownerId?: string | null) => {
  const [membersRes, adminsRes, bansRes, postsRes] = await Promise.all([
    supabase.from("group_members").select("*").eq("group_id", groupId).order("joined_at", { ascending: true }),
    supabase.from("group_admins").select("*").eq("group_id", groupId).order("created_at", { ascending: true }),
    supabase.from("group_bans").select("*").eq("group_id", groupId).order("created_at", { ascending: false }),
    supabase.from("blog_posts").select("id, title, slug, created_at, status, author_id").eq("group_id", groupId).order("created_at", { ascending: false }).limit(20),
  ]);

  const profileMap = await loadProfiles([
    ...(membersRes.data || []).map((item) => item.user_id),
    ...(adminsRes.data || []).map((item) => item.user_id),
    ...(bansRes.data || []).map((item) => item.user_id),
    ...(postsRes.data || []).map((item) => item.author_id || ""),
    ownerId || "",
  ]);

  const adminSet = new Set((adminsRes.data || []).map((admin) => admin.user_id));
  const members = membersRes.data || [];

  return {
    pendingMembers: members
      .filter((member) => member.status === "pending")
      .map((member) => ({
        ...member,
        profile: profileMap.get(member.user_id),
      })),
    approvedMembers: members
      .filter((member) => member.status === "approved")
      .map((member) => ({
        ...member,
        profile: profileMap.get(member.user_id),
        isOwner: ownerId === member.user_id,
        isAdmin: ownerId === member.user_id || adminSet.has(member.user_id),
      })),
    admins: (adminsRes.data || []).map((admin) => ({
      ...admin,
      profile: profileMap.get(admin.user_id),
    })),
    bans: (bansRes.data || []).map((ban) => ({
      ...ban,
      profile: profileMap.get(ban.user_id),
    })),
    posts: ((postsRes.data || []) as ScopedPost[]).map((post) => ({
      ...post,
      authorName: profileMap.get(post.author_id || "")?.display_name || "Unknown author",
    })),
  };
};

export const addCommunityAdmin = async (communityId: string, userId: string) => {
  const { error } = await supabase.from("community_admins").upsert({ community_id: communityId, user_id: userId }, { onConflict: "community_id,user_id" });
  if (error) throw error;
};

export const removeCommunityAdmin = async (communityId: string, userId: string) => {
  const { error } = await supabase.from("community_admins").delete().eq("community_id", communityId).eq("user_id", userId);
  if (error) throw error;
};

export const removeCommunityMember = async (communityId: string, userId: string) => {
  const [memberRes, adminRes] = await Promise.all([
    supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", userId),
    supabase.from("community_admins").delete().eq("community_id", communityId).eq("user_id", userId),
  ]);
  if (memberRes.error) throw memberRes.error;
  if (adminRes.error) throw adminRes.error;
};

export const banCommunityUser = async (communityId: string, userId: string, reason?: string) => {
  const [banRes, memberRes, adminRes] = await Promise.all([
    supabase.from("community_bans").upsert({ community_id: communityId, user_id: userId, reason: reason || null }, { onConflict: "community_id,user_id" }),
    supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", userId),
    supabase.from("community_admins").delete().eq("community_id", communityId).eq("user_id", userId),
  ]);
  if (banRes.error) throw banRes.error;
  if (memberRes.error) throw memberRes.error;
  if (adminRes.error) throw adminRes.error;
};

export const unbanCommunityUser = async (communityId: string, userId: string) => {
  const { error } = await supabase.from("community_bans").delete().eq("community_id", communityId).eq("user_id", userId);
  if (error) throw error;
};

export const addGroupAdmin = async (groupId: string, userId: string) => {
  const { error } = await supabase.from("group_admins").upsert({ group_id: groupId, user_id: userId }, { onConflict: "group_id,user_id" });
  if (error) throw error;
};

export const removeGroupAdmin = async (groupId: string, userId: string) => {
  const { error } = await supabase.from("group_admins").delete().eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
};

export const removeGroupMember = async (groupId: string, userId: string) => {
  const [memberRes, adminRes] = await Promise.all([
    supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId),
    supabase.from("group_admins").delete().eq("group_id", groupId).eq("user_id", userId),
  ]);
  if (memberRes.error) throw memberRes.error;
  if (adminRes.error) throw adminRes.error;
};

export const banGroupUser = async (groupId: string, userId: string, reason?: string) => {
  const [banRes, memberRes, adminRes] = await Promise.all([
    supabase.from("group_bans").upsert({ group_id: groupId, user_id: userId, reason: reason || null }, { onConflict: "group_id,user_id" }),
    supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId),
    supabase.from("group_admins").delete().eq("group_id", groupId).eq("user_id", userId),
  ]);
  if (banRes.error) throw banRes.error;
  if (memberRes.error) throw memberRes.error;
  if (adminRes.error) throw adminRes.error;
};

export const unbanGroupUser = async (groupId: string, userId: string) => {
  const { error } = await supabase.from("group_bans").delete().eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
};

export const updateGroupRequest = async (memberId: string, status: "approved" | "rejected") => {
  const { error } = await supabase.from("group_members").update({ status }).eq("id", memberId);
  if (error) throw error;
};

export const deleteScopedPost = async (postId: string) => {
  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
  if (error) throw error;
};
