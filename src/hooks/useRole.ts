import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  defaultAdminPermissions,
  fullAdminPermissions,
  type AdminPermissions,
} from "@/lib/admin-permissions";

export function useRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissions, setPermissions] = useState<AdminPermissions>(defaultAdminPermissions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setPermissions(defaultAdminPermissions);
      setLoading(false);
      return;
    }

    Promise.all([
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id),
      supabase
        .from("admin_permissions" as any)
        .select("is_super_admin, can_manage_admins, can_manage_users, can_manage_posts, can_manage_social, can_manage_quiz, can_manage_media, can_manage_tools")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]).then(([rolesRes, permissionsRes]) => {
      const admin = rolesRes.data?.some((r) => r.role === "admin") ?? false;
      setIsAdmin(admin);

      if (!admin) {
        setIsSuperAdmin(false);
        setPermissions(defaultAdminPermissions);
        setLoading(false);
        return;
      }

      if (!permissionsRes.data) {
        setIsSuperAdmin(true);
        setPermissions(fullAdminPermissions);
        setLoading(false);
        return;
      }

      setIsSuperAdmin(Boolean(permissionsRes.data.is_super_admin));
      setPermissions(
        permissionsRes.data.is_super_admin
          ? fullAdminPermissions
          : {
              manage_admins: Boolean(permissionsRes.data.can_manage_admins),
              manage_users: Boolean(permissionsRes.data.can_manage_users),
              manage_posts: Boolean(permissionsRes.data.can_manage_posts),
              manage_social: Boolean(permissionsRes.data.can_manage_social),
              manage_quiz: Boolean(permissionsRes.data.can_manage_quiz),
              manage_media: Boolean(permissionsRes.data.can_manage_media),
              manage_tools: Boolean(permissionsRes.data.can_manage_tools),
            },
      );
      setLoading(false);
    });
  }, [user]);

  return { isAdmin, isSuperAdmin, permissions, loading };
}
