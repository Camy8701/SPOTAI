ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS headline text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_auth_enabled boolean NOT NULL DEFAULT false;