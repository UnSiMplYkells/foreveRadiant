-- Migration: 20261123000003_storage_buckets.sql
-- Description: Configure 'product-images' and 'products' Supabase Storage buckets with public read and admin-only write/delete RLS policies

-- 1. Create or ensure 'product-images' and 'products' storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS policies for product image buckets

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read for product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- SELECT: Public can view and download product images
CREATE POLICY "Public read for product images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('product-images', 'products'));

-- INSERT: Only authenticated administrators can upload product images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('product-images', 'products')
  AND public.is_admin()
);

-- UPDATE: Only authenticated administrators can update product images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('product-images', 'products')
  AND public.is_admin()
)
WITH CHECK (
  bucket_id IN ('product-images', 'products')
  AND public.is_admin()
);

-- DELETE: Only authenticated administrators can delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('product-images', 'products')
  AND public.is_admin()
);
