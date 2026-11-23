-- Migration: 20261123180000_fix_users_trigger.sql
-- Description: Fix missing unique constraint on public.users(user_id) and make handle_new_user trigger bulletproof

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_user_id_key'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_user_id_key UNIQUE (user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, role)
  VALUES (new.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user suppressed error: %', SQLERRM;
    RETURN new;
END;
$$;
