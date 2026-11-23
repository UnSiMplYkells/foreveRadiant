-- Migration: 20261123210000_product_sizes_and_cart_pricing.sql
-- Description: Allow structured sizes and size-specific pricing across products, cart, and orders

ALTER TABLE public.cart ALTER COLUMN size TYPE text USING size::text;
ALTER TABLE public.cart ADD COLUMN IF NOT EXISTS size_price numeric;
