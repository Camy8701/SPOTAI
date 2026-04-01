# SpotAI: Manus Brief for Moving Backend Ownership to Supabase

## Objective

Move SpotAI's backend ownership to a Supabase project that we control before launch.

Use the existing repo as the primary source of truth. The goal is not to redesign the product. The goal is to make the current frontend work reliably against a clean, owned Supabase backend with auth, database, storage, realtime, and sane RLS.

Important business context:

- There are no real users yet.
- Prioritize a clean setup over backward-compatibility hacks.
- Keep Lovable for frontend productivity if useful, but backend ownership must move to Supabase.

## Repo / Source Of Truth

GitHub repo:

- Use the current GitHub repository for this project.
- This repo may have been renamed from `dreamweave-thoughtstream` to `SPOTI`.
- If the old URL still redirects, prefer the new canonical repo URL anyway so tooling, PRs, and docs stay aligned.

Key runtime files to inspect first:

- `src/integrations/supabase/client.ts`
- `src/integrations/lovable/index.ts`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useRole.ts`
- `src/pages/Index.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/ProfileSettings.tsx`
- `src/pages/CreatePost.tsx`
- `src/pages/Communities.tsx`
- `src/pages/Groups.tsx`
- `src/pages/Messages.tsx`
- `src/pages/BlogPost.tsx`
- `src/pages/AdminDashboard.tsx`
- `src/pages/UserDashboard.tsx`
- `src/pages/Quiz.tsx`
- `src/components/NotificationBell.tsx`

Key backend files to inspect first:

- `supabase/config.toml`
- `supabase/migrations/*`
- `src/integrations/supabase/types.ts`

## High-Level Reality Of The Current App

The current frontend already depends heavily on Supabase patterns:

- `@supabase/supabase-js` is a core dependency.
- Email/password auth already uses `supabase.auth`.
- Google auth currently flows through a Lovable auth bridge in `src/integrations/lovable/index.ts`, then sets a Supabase session.
- The app reads and writes many Supabase tables directly from the frontend.
- Storage is used for media uploads via a public `media` bucket.
- Realtime is used for at least:
  - direct messages
  - notifications

This means the backend migration should not invent a new data model. It should make the existing Supabase-oriented frontend actually safe and owned.

## What Needs To Be Done

### 1. Create and own the Supabase project properly

- Create or connect a new Supabase project under the user's account.
- Do not rely on the previous Lovable-managed backend.
- Update or replace `supabase/config.toml` project linkage as needed.
- Set the correct frontend env values:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

If you also need server-side secrets or auth settings, configure them in Supabase, not in Lovable-only infrastructure.

### 2. Rebuild the database schema from the repo, but normalize it

The repo already contains migrations, but they are not clean enough to apply blindly to a fresh project without review.

You should:

- audit the migration history
- identify duplicate/overlapping migrations
- produce a clean, working migration path or a clean baseline schema migration
- keep the repo coherent after your changes

Do not leave the project in a state where only the Supabase dashboard is correct but the repo migrations are misleading or broken.

### 3. Make auth fully owned by Supabase

Needed auth behaviors:

- email/password sign-up
- email/password sign-in
- password reset
- session persistence
- onboarding after signup
- Google OAuth sign-in / sign-up

Critical note:

- `src/integrations/lovable/index.ts` currently uses `@lovable.dev/cloud-auth-js` for Google OAuth and then calls `supabase.auth.setSession(...)`.
- If backend ownership moves to Supabase, this flow is likely the wrong long-term dependency.

Preferred outcome:

- move Google OAuth to native Supabase auth if needed
- remove Lovable auth as a hard backend dependency if it is no longer necessary
- keep UI behavior the same unless a minimal frontend auth change is required

Also configure the correct Supabase auth redirect URLs for the app paths already used in code:

- `/`
- `/auth`
- `/onboarding`
- `/reset-password`

### 4. Ensure profile lifecycle works from signup onward

The frontend expects profile creation and onboarding state to work.

The `profiles` table and auth trigger logic must support:

- `user_id`
- `display_name`
- `avatar_url`
- `bio`
- `first_name`
- `last_name`
- `headline`
- `onboarding_completed`
- `google_auth_enabled`
- `is_platform_banned`
- `platform_ban_reason`
- related moderation fields

The final `handle_new_user()` behavior in the repo was redefined multiple times. Make sure the final backend behavior is intentional and stable.

### 5. Support the current product areas already wired in the frontend

At minimum, the backend must support these runtime domains:

- profiles and roles
- blog posts
- comments
- likes
- saved posts
- communities
- community membership
- groups
- group membership with approval status
- conversations
- messages
- notifications
- freebies
- image library items
- prompt library items
- media records
- quiz questions
- quiz results
- quiz sessions
- quiz question attempts
- quiz player stats
- admin permissions
- scoped moderation tables for communities/groups

### 6. Support homepage content model

The homepage reads from `blog_posts` using:

- `status = 'published'`
- `community_id is null`
- `group_id is null`
- `homepage_section`

Current sections queried by `src/pages/Index.tsx`:

- `hero`
- `featured_stories`
- `featured_collections`
- `best_ai_tools`
- `news_articles`

There is also:

- `post_kind` on `blog_posts`

Important note:

- `Digital Products` is still a frontend placeholder section, not post-backed.

### 7. Support admin flows

The admin dashboard expects to be able to manage:

- blog posts
- freebies
- image library items
- prompt library items
- quiz questions
- users / profiles
- admin roles and permissions
- communities / groups / membership approvals
- media uploads
- analytics-style counts across many tables

You must provide a clean admin bootstrap path.

Because there are no users yet, acceptable options include:

- a safe SQL/bootstrap script to grant the owner's account `admin`
- creation of `admin_permissions` with full access
- documented steps for first-account bootstrap

Do not leave admin access ambiguous.

### 8. Support storage

Storage expectations already exist for a public `media` bucket:

- upload from admin flows
- public URL retrieval

Ensure:

- bucket exists
- policies work
- uploads from the app succeed

### 9. Support realtime where the frontend already uses it

At minimum:

- messages realtime
- notifications realtime

If publication settings are missing, add them in a clean migration.

### 10. Keep RLS practical

Do not make the schema "secure" in a way that breaks the existing product.

RLS must allow the frontend's real flows to succeed:

- onboarding/profile edits
- creating posts
- comments / likes / saves
- community joins
- group join requests
- messaging between participants
- notifications reads/updates
- quiz writes for the current user
- admin-only CRUD where expected

## Known Migration / Schema Gotchas

Please inspect these carefully instead of applying everything blindly.

### Duplicate / overlapping migrations

These appear to overlap and likely need consolidation:

- `20260307093000_add_image_and_prompt_libraries.sql`
- `20260307170212_138b3726-17ee-4c77-9302-0100c4d3e797.sql`

Both create:

- `image_library_items`
- `prompt_library_items`

These also overlap and likely need consolidation:

- `20260328113000_add_quiz_progress_tables.sql`
- `20260329175953_1338ca4f-57db-4aac-995b-61aad243fb98.sql`

Both create:

- `quiz_sessions`
- `quiz_player_stats`
- `quiz_question_attempts`

### Repeated `handle_new_user()` redefinitions

These all redefine onboarding/profile creation behavior:

- `20260302073706_b9e658c6-f7e6-4b62-b55b-5656c14198d2.sql`
- `20260327193000_add_profile_onboarding_fields.sql`
- `20260327204500_add_google_auth_gate.sql`
- `20260327205231_66b4976e-2b74-4336-a808-53fce95488c2.sql`

The final version in the repo currently inserts only `profiles(user_id)` and uses `ON CONFLICT DO NOTHING`.

That may be acceptable, but confirm it matches the intended auth/onboarding UX.

### Old project linkage

`supabase/config.toml` currently contains:

- `project_id = "iytlqjjkebgqhhpmkefw"`

Treat that as legacy unless it is intentionally the new owned project.

## Important Local-Only Changes Not On GitHub

These changes currently exist locally but are not committed to GitHub, so you will not see them unless the user shares or pushes them.

### Local-only frontend auth/profile changes

Uncommitted local changes exist in:

- `src/contexts/AuthContext.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/ProfileSettings.tsx`

Summary:

- `AuthContext` now builds a fallback profile from auth metadata if the `profiles` row is not ready yet.
- `Onboarding` writes richer metadata back to the auth user:
  - `first_name`
  - `last_name`
  - `display_name`
  - `headline`
  - `bio`
  - `onboarding_completed`
- `ProfileSettings` does the same metadata sync on profile edits.

If you are only reading GitHub, account for this manually or ask the user to push/share those changes.

### Local-only homepage seed migration

There is an uncommitted local migration not on GitHub:

- `supabase/migrations/20260330095500_seed_homepage_showcase_posts.sql`

Purpose:

- seed placeholder homepage posts for:
  - `hero`
  - `featured_stories`
  - `featured_collections`
  - `best_ai_tools`
  - `news_articles`

If you want the homepage to be visually populated immediately on the new Supabase backend, recreate or replace this seed intentionally.

## What I Want You To Deliver

### Required deliverables

1. A clean Supabase project owned by the user.
2. A repo state where migrations accurately represent the backend.
3. Auth fully working against owned Supabase.
4. Storage working for `media`.
5. Realtime working where used.
6. Admin bootstrap working.
7. Minimal validation that the existing frontend flows work.

### Validation checklist

Please verify these flows explicitly:

1. Sign up with email/password.
2. Profile row is created correctly.
3. Sign in works.
4. Password reset flow is configured.
5. Google OAuth works against Supabase-owned auth, or explain exactly what still depends on Lovable.
6. Onboarding/profile fields persist.
7. Homepage queries work.
8. Creating/editing posts works.
9. Communities/groups join flows work.
10. Messaging works, including realtime updates.
11. Notifications work, including realtime updates.
12. Admin dashboard can load and perform expected CRUD.
13. Media uploads work and public URLs resolve.

## Constraints

- Do not change product scope.
- Do not redesign the UI unless needed for auth/backend compatibility.
- Do not keep hidden dependencies on Lovable backend services if the point is owned backend migration.
- If a small frontend change is required to complete backend ownership correctly, make the smallest defensible change and explain it.
- Prefer a clean baseline over preserving messy duplicate migrations.

## If You Need To Make A Judgment Call

Prefer this priority order:

1. owned backend and correct auth
2. repo coherence
3. working runtime behavior
4. minimal frontend disruption
5. optional seed/demo content

## Short Version

Read the repo deeply, normalize the Supabase backend properly, make auth/storage/realtime/RLS match the existing frontend, remove any unnecessary Lovable backend dependency, and leave the repo in a clean state that the user actually owns before launch.
