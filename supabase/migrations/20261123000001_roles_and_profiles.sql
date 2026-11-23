-- Migration: 20261123000001_roles_and_profiles.sql
-- Description: Add role column to users profiles, create is_admin helper, and set up strict RLS policies

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add role column to public.users table (default 'customer', can be 'admin')
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN role text NOT NULL DEFAULT 'customer';
  END IF;
END $$;

-- Add check constraint for role values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin'));
  END IF;
END $$;

-- 3. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);

-- 4. Secure helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT (role = 'admin')
      FROM public.users
      WHERE user_id = auth.uid()
      LIMIT 1
    ),
    false
  );
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 5. Enable Row Level Security on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplication
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;

-- Read: Users can view their own profile, admins can view all profiles
CREATE POLICY "Users can view own profile or admins view all"
ON public.users FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.is_admin()
);

-- Insert: Users can insert their own profile with customer role
CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (role = 'customer' OR public.is_admin())
);

-- Update: Users can update their own details, but cannot elevate their role to admin
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.is_admin()
)
WITH CHECK (
  public.is_admin() 
  OR (
    auth.uid() = user_id 
    AND role = (SELECT u.role FROM public.users u WHERE u.user_id = auth.uid())
  )
);

-- Delete: Only admins can delete user records
CREATE POLICY "Admins can delete profiles"
ON public.users FOR DELETE
TO authenticated
USING (public.is_admin());

-- 6. Trigger to automatically provision a profile row when a new auth user signs up
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
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
