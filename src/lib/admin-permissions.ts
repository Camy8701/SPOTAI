export type AdminPermissionKey =
  | "manage_admins"
  | "manage_users"
  | "manage_posts"
  | "manage_social"
  | "manage_quiz"
  | "manage_media"
  | "manage_tools";

export type AdminPermissions = Record<AdminPermissionKey, boolean>;

export const defaultAdminPermissions: AdminPermissions = {
  manage_admins: false,
  manage_users: false,
  manage_posts: false,
  manage_social: false,
  manage_quiz: false,
  manage_media: false,
  manage_tools: false,
};

export const fullAdminPermissions: AdminPermissions = {
  manage_admins: true,
  manage_users: true,
  manage_posts: true,
  manage_social: true,
  manage_quiz: true,
  manage_media: true,
  manage_tools: true,
};

export const ADMIN_PERMISSION_LABELS: Record<AdminPermissionKey, { label: string; description: string }> = {
  manage_admins: {
    label: "Manage admins",
    description: "Grant or limit platform admin access.",
  },
  manage_users: {
    label: "Manage users",
    description: "Ban users and review account-level access.",
  },
  manage_posts: {
    label: "Manage posts",
    description: "Moderate posts and comments across the platform.",
  },
  manage_social: {
    label: "Manage communities",
    description: "Delete communities/groups and review social moderation.",
  },
  manage_quiz: {
    label: "Manage quiz",
    description: "Edit quiz questions and game analytics.",
  },
  manage_media: {
    label: "Manage media",
    description: "Control image, prompt, and media libraries.",
  },
  manage_tools: {
    label: "Manage tools",
    description: "Reserved for tool-specific operational controls.",
  },
};
