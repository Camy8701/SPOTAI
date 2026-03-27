ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles
SET
  first_name = COALESCE(first_name, NULLIF(split_part(display_name, ' ', 1), '')),
  last_name = COALESCE(
    last_name,
    NULLIF(
      trim(
        regexp_replace(
          COALESCE(display_name, ''),
          '^[^[:space:]]+[[:space:]]*',
          ''
        )
      ),
      ''
    )
  ),
  onboarding_completed = true
WHERE onboarding_completed = false;

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
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(raw_name, ''), split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    derived_first_name,
    derived_last_name,
    false
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
