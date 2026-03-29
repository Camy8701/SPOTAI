ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_platform_banned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS platform_ban_reason TEXT,
  ADD COLUMN IF NOT EXISTS platform_banned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS platform_banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  can_manage_admins BOOLEAN NOT NULL DEFAULT false,
  can_manage_users BOOLEAN NOT NULL DEFAULT false,
  can_manage_posts BOOLEAN NOT NULL DEFAULT false,
  can_manage_social BOOLEAN NOT NULL DEFAULT false,
  can_manage_quiz BOOLEAN NOT NULL DEFAULT false,
  can_manage_media BOOLEAN NOT NULL DEFAULT false,
  can_manage_tools BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_platform_banned(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT is_platform_banned
      FROM public.profiles
      WHERE user_id = _user_id
      LIMIT 1
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_platform_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN NOT public.has_role(_user_id, 'admin'::public.app_role) THEN false
      WHEN EXISTS (
        SELECT 1
        FROM public.admin_permissions ap
        WHERE ap.user_id = _user_id
      )
        THEN EXISTS (
          SELECT 1
          FROM public.admin_permissions ap
          WHERE ap.user_id = _user_id
            AND ap.is_super_admin = true
        )
      ELSE true
    END;
$$;

CREATE OR REPLACE FUNCTION public.has_admin_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  permission_row public.admin_permissions%ROWTYPE;
BEGIN
  IF NOT public.has_role(_user_id, 'admin'::public.app_role) THEN
    RETURN false;
  END IF;

  SELECT *
  INTO permission_row
  FROM public.admin_permissions
  WHERE user_id = _user_id;

  IF NOT FOUND OR permission_row.is_super_admin THEN
    RETURN true;
  END IF;

  CASE _permission
    WHEN 'manage_admins' THEN RETURN permission_row.can_manage_admins;
    WHEN 'manage_users' THEN RETURN permission_row.can_manage_users;
    WHEN 'manage_posts' THEN RETURN permission_row.can_manage_posts;
    WHEN 'manage_social' THEN RETURN permission_row.can_manage_social;
    WHEN 'manage_quiz' THEN RETURN permission_row.can_manage_quiz;
    WHEN 'manage_media' THEN RETURN permission_row.can_manage_media;
    WHEN 'manage_tools' THEN RETURN permission_row.can_manage_tools;
    ELSE RETURN false;
  END CASE;
END;
$$;

DROP POLICY IF EXISTS "Users can read their own permissions" ON public.admin_permissions;
DROP POLICY IF EXISTS "Super admins can manage admin permissions" ON public.admin_permissions;

CREATE POLICY "Users can read their own permissions"
ON public.admin_permissions
FOR SELECT
USING (auth.uid() = user_id OR public.has_admin_permission(auth.uid(), 'manage_admins'));

CREATE POLICY "Super admins can manage admin permissions"
ON public.admin_permissions
FOR ALL
USING (public.has_admin_permission(auth.uid(), 'manage_admins'))
WITH CHECK (public.has_admin_permission(auth.uid(), 'manage_admins'));

DROP TRIGGER IF EXISTS update_admin_permissions_updated_at ON public.admin_permissions;
CREATE TRIGGER update_admin_permissions_updated_at
BEFORE UPDATE ON public.admin_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.community_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.community_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_bans ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_community_admin(_community_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = _community_id
      AND (
        c.created_by = _user_id
        OR public.has_admin_permission(_user_id, 'manage_social')
        OR EXISTS (
          SELECT 1
          FROM public.community_admins ca
          WHERE ca.community_id = c.id
            AND ca.user_id = _user_id
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = _group_id
      AND (
        g.created_by = _user_id
        OR public.has_admin_permission(_user_id, 'manage_social')
        OR EXISTS (
          SELECT 1
          FROM public.group_admins ga
          WHERE ga.group_id = g.id
            AND ga.user_id = _user_id
        )
      )
  );
$$;

DROP POLICY IF EXISTS "Community admins are viewable" ON public.community_admins;
DROP POLICY IF EXISTS "Community admins can manage community admins" ON public.community_admins;
DROP POLICY IF EXISTS "Community admins can manage bans" ON public.community_bans;
DROP POLICY IF EXISTS "Community bans are visible to moderators" ON public.community_bans;
DROP POLICY IF EXISTS "Group admins are visible to members and moderators" ON public.group_admins;
DROP POLICY IF EXISTS "Group admins can manage group admins" ON public.group_admins;
DROP POLICY IF EXISTS "Group bans are visible to moderators" ON public.group_bans;
DROP POLICY IF EXISTS "Group admins can manage bans" ON public.group_bans;

CREATE POLICY "Community admins are viewable"
ON public.community_admins
FOR SELECT
USING (true);

CREATE POLICY "Community admins can manage community admins"
ON public.community_admins
FOR ALL
USING (public.is_community_admin(public.community_admins.community_id, auth.uid()))
WITH CHECK (public.is_community_admin(public.community_admins.community_id, auth.uid()));

CREATE POLICY "Community bans are visible to moderators"
ON public.community_bans
FOR SELECT
USING (public.is_community_admin(public.community_bans.community_id, auth.uid()));

CREATE POLICY "Community admins can manage bans"
ON public.community_bans
FOR ALL
USING (public.is_community_admin(public.community_bans.community_id, auth.uid()))
WITH CHECK (public.is_community_admin(public.community_bans.community_id, auth.uid()));

CREATE POLICY "Group admins are visible to members and moderators"
ON public.group_admins
FOR SELECT
USING (
  public.is_group_admin(public.group_admins.group_id, auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = public.group_admins.group_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'approved'
  )
);

CREATE POLICY "Group admins can manage group admins"
ON public.group_admins
FOR ALL
USING (public.is_group_admin(public.group_admins.group_id, auth.uid()))
WITH CHECK (public.is_group_admin(public.group_admins.group_id, auth.uid()));

CREATE POLICY "Group bans are visible to moderators"
ON public.group_bans
FOR SELECT
USING (public.is_group_admin(public.group_bans.group_id, auth.uid()));

CREATE POLICY "Group admins can manage bans"
ON public.group_bans
FOR ALL
USING (public.is_group_admin(public.group_bans.group_id, auth.uid()))
WITH CHECK (public.is_group_admin(public.group_bans.group_id, auth.uid()));

INSERT INTO public.community_members (community_id, user_id)
SELECT c.id, c.created_by
FROM public.communities c
WHERE NOT EXISTS (
  SELECT 1
  FROM public.community_members cm
  WHERE cm.community_id = c.id
    AND cm.user_id = c.created_by
);

INSERT INTO public.group_members (group_id, user_id, status)
SELECT g.id, g.created_by, 'approved'::public.member_status
FROM public.groups g
WHERE NOT EXISTS (
  SELECT 1
  FROM public.group_members gm
  WHERE gm.group_id = g.id
    AND gm.user_id = g.created_by
);

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;

ALTER TABLE public.blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_single_scope_check;

ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_single_scope_check
  CHECK (num_nonnulls(community_id, group_id) <= 1);

CREATE INDEX IF NOT EXISTS idx_blog_posts_community_id ON public.blog_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_group_id ON public.blog_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_admins_community_id ON public.community_admins(community_id);
CREATE INDEX IF NOT EXISTS idx_group_admins_group_id ON public.group_admins(group_id);
CREATE INDEX IF NOT EXISTS idx_community_bans_community_id ON public.community_bans(community_id);
CREATE INDEX IF NOT EXISTS idx_group_bans_group_id ON public.group_bans(group_id);

CREATE OR REPLACE FUNCTION public.can_create_scoped_post(_community_id UUID, _group_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN _user_id IS NULL OR public.is_platform_banned(_user_id) THEN false
      WHEN num_nonnulls(_community_id, _group_id) > 1 THEN false
      WHEN _community_id IS NULL AND _group_id IS NULL THEN true
      WHEN _community_id IS NOT NULL THEN
        public.is_community_admin(_community_id, _user_id)
        OR EXISTS (
          SELECT 1
          FROM public.community_members cm
          WHERE cm.community_id = _community_id
            AND cm.user_id = _user_id
        )
      WHEN _group_id IS NOT NULL THEN
        public.is_group_admin(_group_id, _user_id)
        OR EXISTS (
          SELECT 1
          FROM public.group_members gm
          WHERE gm.group_id = _group_id
            AND gm.user_id = _user_id
            AND gm.status = 'approved'
        )
      ELSE false
    END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_post(_post_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blog_posts bp
    WHERE bp.id = _post_id
      AND (
        (_user_id IS NOT NULL AND (bp.author_id = _user_id OR public.has_admin_permission(_user_id, 'manage_posts')))
        OR (
          bp.status = 'published'
          AND bp.community_id IS NULL
          AND bp.group_id IS NULL
        )
        OR (
          bp.status = 'published'
          AND bp.community_id IS NOT NULL
          AND _user_id IS NOT NULL
          AND (
            public.is_community_admin(bp.community_id, _user_id)
            OR EXISTS (
              SELECT 1
              FROM public.community_members cm
              WHERE cm.community_id = bp.community_id
                AND cm.user_id = _user_id
            )
          )
        )
        OR (
          bp.status = 'published'
          AND bp.group_id IS NOT NULL
          AND _user_id IS NOT NULL
          AND (
            public.is_group_admin(bp.group_id, _user_id)
            OR EXISTS (
              SELECT 1
              FROM public.group_members gm
              WHERE gm.group_id = bp.group_id
                AND gm.user_id = _user_id
                AND gm.status = 'approved'
            )
          )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_moderate_post(_post_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blog_posts bp
    WHERE bp.id = _post_id
      AND (
        bp.author_id = _user_id
        OR public.has_admin_permission(_user_id, 'manage_posts')
        OR (bp.community_id IS NOT NULL AND public.is_community_admin(bp.community_id, _user_id))
        OR (bp.group_id IS NOT NULL AND public.is_group_admin(bp.group_id, _user_id))
      )
  );
$$;

DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins and authors can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins and authors can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins and authors can delete posts" ON public.blog_posts;

CREATE POLICY "Posts are viewable within their scope"
ON public.blog_posts
FOR SELECT
USING (public.can_view_post(id, auth.uid()));

CREATE POLICY "Users can insert posts within their scope"
ON public.blog_posts
FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND public.can_create_scoped_post(community_id, group_id, auth.uid())
);

CREATE POLICY "Authors and moderators can update posts"
ON public.blog_posts
FOR UPDATE
USING (public.can_moderate_post(id, auth.uid()))
WITH CHECK (
  public.can_moderate_post(id, auth.uid())
  AND public.can_create_scoped_post(community_id, group_id, auth.uid())
);

CREATE POLICY "Authors and moderators can delete posts"
ON public.blog_posts
FOR DELETE
USING (public.can_moderate_post(id, auth.uid()));

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments or admins" ON public.comments;

CREATE POLICY "Comments are viewable when post is viewable"
ON public.comments
FOR SELECT
USING (public.can_view_post(post_id, auth.uid()));

CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT public.is_platform_banned(auth.uid())
  AND public.can_view_post(post_id, auth.uid())
);

CREATE POLICY "Users can update own comments"
ON public.comments
FOR UPDATE
USING (auth.uid() = user_id AND NOT public.is_platform_banned(auth.uid()))
WITH CHECK (auth.uid() = user_id AND NOT public.is_platform_banned(auth.uid()));

CREATE POLICY "Users and moderators can delete comments"
ON public.comments
FOR DELETE
USING (
  auth.uid() = user_id
  OR public.has_admin_permission(auth.uid(), 'manage_posts')
  OR public.can_moderate_post(post_id, auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_admin_permission(auth.uid(), 'manage_admins'))
WITH CHECK (public.has_admin_permission(auth.uid(), 'manage_admins'));

DROP POLICY IF EXISTS "Creators and admins can update communities" ON public.communities;
DROP POLICY IF EXISTS "Creators and admins can delete communities" ON public.communities;
DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_members;

CREATE POLICY "Creators and social admins can update communities"
ON public.communities
FOR UPDATE
USING (auth.uid() = created_by OR public.has_admin_permission(auth.uid(), 'manage_social'));

CREATE POLICY "Creators and social admins can delete communities"
ON public.communities
FOR DELETE
USING (auth.uid() = created_by OR public.has_admin_permission(auth.uid(), 'manage_social'));

CREATE POLICY "Users can join communities"
ON public.community_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT public.is_platform_banned(auth.uid())
  AND NOT EXISTS (
    SELECT 1
    FROM public.community_bans cb
    WHERE cb.community_id = public.community_members.community_id
      AND cb.user_id = auth.uid()
  )
);

CREATE POLICY "Users can leave communities or moderators can remove"
ON public.community_members
FOR DELETE
USING (
  auth.uid() = user_id
  OR public.is_community_admin(public.community_members.community_id, auth.uid())
);

DROP POLICY IF EXISTS "Creators and admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Creators and admins can delete groups" ON public.groups;
DROP POLICY IF EXISTS "Group members visible to group creator and self" ON public.group_members;
DROP POLICY IF EXISTS "Users can request to join groups" ON public.group_members;
DROP POLICY IF EXISTS "Group owners can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave or owners can remove" ON public.group_members;

CREATE POLICY "Creators and social admins can update groups"
ON public.groups
FOR UPDATE
USING (auth.uid() = created_by OR public.has_admin_permission(auth.uid(), 'manage_social'));

CREATE POLICY "Creators and social admins can delete groups"
ON public.groups
FOR DELETE
USING (auth.uid() = created_by OR public.has_admin_permission(auth.uid(), 'manage_social'));

CREATE POLICY "Group members visible to moderators and self"
ON public.group_members
FOR SELECT
USING (
  auth.uid() = user_id
  OR public.is_group_admin(public.group_members.group_id, auth.uid())
);

CREATE POLICY "Users can request to join groups"
ON public.group_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT public.is_platform_banned(auth.uid())
  AND NOT EXISTS (
    SELECT 1
    FROM public.group_bans gb
    WHERE gb.group_id = public.group_members.group_id
      AND gb.user_id = auth.uid()
  )
);

CREATE POLICY "Group admins can manage members"
ON public.group_members
FOR UPDATE
USING (public.is_group_admin(public.group_members.group_id, auth.uid()))
WITH CHECK (public.is_group_admin(public.group_members.group_id, auth.uid()));

CREATE POLICY "Users can leave or moderators can remove"
ON public.group_members
FOR DELETE
USING (
  auth.uid() = user_id
  OR public.is_group_admin(public.group_members.group_id, auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions
FOR ALL
USING (public.has_admin_permission(auth.uid(), 'manage_quiz'))
WITH CHECK (public.has_admin_permission(auth.uid(), 'manage_quiz'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users and platform admins can update profiles"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id OR public.has_admin_permission(auth.uid(), 'manage_users'))
WITH CHECK (auth.uid() = user_id OR public.has_admin_permission(auth.uid(), 'manage_users'));

DROP POLICY IF EXISTS "Admins can manage media" ON public.media;
CREATE POLICY "Admins can manage media"
ON public.media
FOR ALL
USING (public.has_admin_permission(auth.uid(), 'manage_media'))
WITH CHECK (public.has_admin_permission(auth.uid(), 'manage_media'));

DROP POLICY IF EXISTS "Admins can view all quiz results" ON public.quiz_results;
CREATE POLICY "Admins can view all quiz results"
ON public.quiz_results
FOR SELECT
USING (auth.uid() = user_id OR public.has_admin_permission(auth.uid(), 'manage_quiz'));

DROP POLICY IF EXISTS "Users can create own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
CREATE POLICY "Users can create own likes"
ON public.likes
FOR INSERT
WITH CHECK (auth.uid() = user_id AND NOT public.is_platform_banned(auth.uid()));

CREATE POLICY "Users can delete own likes"
ON public.likes
FOR DELETE
USING (auth.uid() = user_id AND NOT public.is_platform_banned(auth.uid()));

DROP POLICY IF EXISTS "Users can save posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can unsave posts" ON public.saved_posts;
CREATE POLICY "Users can save posts"
ON public.saved_posts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT public.is_platform_banned(auth.uid())
  AND public.can_view_post(post_id, auth.uid())
);

CREATE POLICY "Users can unsave posts"
ON public.saved_posts
FOR DELETE
USING (auth.uid() = user_id AND NOT public.is_platform_banned(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
CREATE POLICY "Authenticated users can create communities"
ON public.communities
FOR INSERT
WITH CHECK (auth.uid() = created_by AND NOT public.is_platform_banned(auth.uid()));

CREATE POLICY "Authenticated users can create groups"
ON public.groups
FOR INSERT
WITH CHECK (auth.uid() = created_by AND NOT public.is_platform_banned(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Conversation participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Senders can update their messages" ON public.messages;

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  (auth.uid() = participant_1 OR auth.uid() = participant_2)
  AND NOT public.is_platform_banned(auth.uid())
);

CREATE POLICY "Conversation participants can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND NOT public.is_platform_banned(auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

CREATE POLICY "Senders can update their messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id AND NOT public.is_platform_banned(auth.uid()))
WITH CHECK (auth.uid() = sender_id AND NOT public.is_platform_banned(auth.uid()));

CREATE OR REPLACE FUNCTION public.get_popular_posts()
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  excerpt text,
  category text,
  status text,
  published_at timestamptz,
  created_at timestamptz,
  featured_image text,
  like_count bigint,
  comment_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    bp.id,
    bp.title,
    bp.slug,
    bp.excerpt,
    bp.category::text,
    bp.status::text,
    bp.published_at,
    bp.created_at,
    bp.featured_image,
    COALESCE(l.cnt, 0) AS like_count,
    COALESCE(c.cnt, 0) AS comment_count
  FROM blog_posts bp
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS cnt FROM likes WHERE post_id IS NOT NULL GROUP BY post_id
  ) l ON l.post_id = bp.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS cnt FROM comments GROUP BY post_id
  ) c ON c.post_id = bp.id
  WHERE bp.status = 'published'
    AND bp.community_id IS NULL
    AND bp.group_id IS NULL
  ORDER BY bp.created_at DESC;
$$;
