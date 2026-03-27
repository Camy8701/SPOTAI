ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS google_auth_enabled BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles
SET google_auth_enabled = true
WHERE google_auth_enabled = false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  raw_name TEXT;
  derived_first_name TEXT;
  derived_last_name TEXT;
BEGIN
  raw_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  derived_first_name := NULLIF(split_part(raw_name, ' ', 1), '');
  derived_last_name := NULLIF(trim(regexp_replace(raw_name, '^[^[:space:]]+[[:space:]]*', '')), '');

  INSERT INTO public.profiles (
    user_id,
    display_name,
    avatar_url,
    first_name,
    last_name,
    onboarding_completed,
    google_auth_enabled
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(raw_name, ''), split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    derived_first_name,
    derived_last_name,
    false,
    false
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
