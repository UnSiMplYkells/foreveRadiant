-- Migration: 20261123173000_reviews_system.sql
-- Description: Upgrade reviews table with product_id, rating, title, user_name, and RLS policies

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS product_id bigint REFERENCES public.products(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS user_name text NOT NULL DEFAULT 'Verified Customer',
  ADD COLUMN IF NOT EXISTS user_email text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure RLS is active
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Public read reviews'
  ) THEN
    CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Insert reviews'
  ) THEN
    CREATE POLICY "Insert reviews" ON public.reviews FOR INSERT WITH CHECK (product_id IS NOT NULL AND rating >= 1 AND rating <= 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users and admins delete reviews'
  ) THEN
    CREATE POLICY "Users and admins delete reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users update own reviews'
  ) THEN
    CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
