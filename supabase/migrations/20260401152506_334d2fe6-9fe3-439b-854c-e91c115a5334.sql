
-- =============================================
-- 1. SECURITY FIX: Profiles - require authentication for SELECT
-- =============================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- =============================================
-- 2. SECURITY FIX: Groups - hide private groups from non-members
-- =============================================
DROP POLICY IF EXISTS "Groups are viewable by everyone" ON public.groups;
CREATE POLICY "Groups are viewable by everyone or members"
  ON public.groups FOR SELECT
  USING (
    is_private = false
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
        AND group_members.status = 'approved'
    )
    OR has_role(auth.uid(), 'admin')
  );

-- =============================================
-- 3. SECURITY FIX: Group members - enforce pending status on insert
-- =============================================
DROP POLICY IF EXISTS "Users can request to join groups" ON public.group_members;
CREATE POLICY "Users can request to join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- =============================================
-- 4. SECURITY FIX: Quiz questions - hide correct_answer from public
-- =============================================
DROP POLICY IF EXISTS "Quiz questions are viewable by everyone" ON public.quiz_questions;
CREATE POLICY "Quiz questions public fields viewable by everyone"
  ON public.quiz_questions FOR SELECT
  USING (true);

-- Create a view that excludes correct_answer and explanation
CREATE OR REPLACE VIEW public.quiz_questions_public AS
  SELECT id, quiz_title, question, options, difficulty, category, created_at
  FROM public.quiz_questions;

-- Create a secure RPC to check answers server-side
CREATE OR REPLACE FUNCTION public.check_quiz_answer(
  _question_id uuid,
  _answer_index int
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.quiz_questions
    WHERE id = _question_id AND correct_answer = _answer_index
  )
$$;

-- =============================================
-- 5. Add missing columns to profiles
-- =============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_platform_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS platform_ban_reason text;

-- =============================================
-- 6. Create admin_permissions table
-- =============================================
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  is_super_admin boolean NOT NULL DEFAULT false,
  can_manage_admins boolean NOT NULL DEFAULT false,
  can_manage_users boolean NOT NULL DEFAULT false,
  can_manage_posts boolean NOT NULL DEFAULT false,
  can_manage_social boolean NOT NULL DEFAULT false,
  can_manage_quiz boolean NOT NULL DEFAULT false,
  can_manage_media boolean NOT NULL DEFAULT false,
  can_manage_tools boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all permissions"
  ON public.admin_permissions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can manage permissions"
  ON public.admin_permissions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_permissions ap
      WHERE ap.user_id = auth.uid() AND ap.is_super_admin = true
    )
    OR NOT EXISTS (SELECT 1 FROM public.admin_permissions)
  );

-- =============================================
-- 7. Create community_admins table
-- =============================================
CREATE TABLE IF NOT EXISTS public.community_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

ALTER TABLE public.community_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community admins viewable by members"
  ON public.community_admins FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Community creators can manage admins"
  ON public.community_admins FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_admins.community_id AND created_by = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- =============================================
-- 8. Create community_bans table
-- =============================================
CREATE TABLE IF NOT EXISTS public.community_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

ALTER TABLE public.community_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community bans viewable by community creator"
  ON public.community_bans FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_bans.community_id AND created_by = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Community creators can manage bans"
  ON public.community_bans FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_bans.community_id AND created_by = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- =============================================
-- 9. Create group_admins table
-- =============================================
CREATE TABLE IF NOT EXISTS public.group_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.group_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group admins viewable by members"
  ON public.group_admins FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Group creators can manage admins"
  ON public.group_admins FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_admins.group_id AND created_by = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- =============================================
-- 10. Create group_bans table
-- =============================================
CREATE TABLE IF NOT EXISTS public.group_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.group_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group bans viewable by group creator"
  ON public.group_bans FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_bans.group_id AND created_by = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Group creators can manage bans"
  ON public.group_bans FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_bans.group_id AND created_by = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );
