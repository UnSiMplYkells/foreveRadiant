-- Migration: 20261123000002_concurrency_safe_inventory_rpc.sql
-- Description: Concurrency-safe inventory deduction using row-level pessimistic locking (SELECT FOR UPDATE) and products RLS

-- 1. Enable RLS on products table if not already enabled
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- RLS: Anyone (including unauthenticated visitors) can view products
CREATE POLICY "Public can view products"
ON public.products FOR SELECT
USING (true);

-- RLS: Only admins can insert products
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- RLS: Only admins can update products directly
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS: Only admins can delete products
CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (public.is_admin());


-- 2. Concurrency-Safe Checkout RPC with Row-Level Pessimistic Locking
-- This function runs inside a single atomic database transaction.
-- It locks each product row with SELECT ... FOR UPDATE, guaranteeing no two concurrent checkouts
-- can over-allocate stock even under extreme concurrency spikes.

CREATE OR REPLACE FUNCTION public.process_order_checkout(
  p_order_id text,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_product_id bigint;
  v_quantity int;
  v_product_name text;
  v_current_stock int;
  v_items_processed int := 0;
BEGIN
  -- Input validation
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Item list cannot be empty for checkout';
  END IF;

  -- Iterate through items and lock corresponding product rows in order of ID to prevent deadlocks
  FOR v_item IN 
    SELECT value FROM jsonb_array_elements(p_items) ORDER BY (value->>'product_id')::bigint ASC
  LOOP
    v_product_id := (v_item->>'product_id')::bigint;
    v_quantity := (v_item->>'quantity')::int;

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity for product % must be greater than zero', v_product_id;
    END IF;

    -- Pessimistic row-level lock (blocks concurrent transactions modifying this product until transaction commits)
    SELECT id, name, available 
    INTO v_product_id, v_product_name, v_current_stock
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % does not exist', v_product_id;
    END IF;

    -- Stock verification
    IF v_current_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient inventory for "%" (ID: %). Available: %, Requested: %', 
        v_product_name, v_product_id, v_current_stock, v_quantity;
    END IF;

    -- Atomic decrement
    UPDATE public.products
    SET available = available - v_quantity
    WHERE id = v_product_id;

    v_items_processed := v_items_processed + 1;
  END LOOP;

  -- Update order status to paid if order_id is supplied
  IF p_order_id IS NOT NULL AND p_order_id <> '' THEN
    UPDATE public.orders
    SET status = 'paid'
    WHERE order_id = p_order_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'items_processed', v_items_processed,
    'message', 'Inventory locked and decremented successfully'
  );
END;
$$;

-- Grant execution to authenticated users and service_role
GRANT EXECUTE ON FUNCTION public.process_order_checkout(text, jsonb) TO authenticated, service_role;


-- 3. Inventory Restoration RPC (for cancelled, expired, or refunded orders)
CREATE OR REPLACE FUNCTION public.restore_order_inventory(
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_product_id bigint;
  v_quantity int;
  v_items_restored int := 0;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'No items to restore');
  END IF;

  FOR v_item IN 
    SELECT value FROM jsonb_array_elements(p_items) ORDER BY (value->>'product_id')::bigint ASC
  LOOP
    v_product_id := (v_item->>'product_id')::bigint;
    v_quantity := (v_item->>'quantity')::int;

    IF v_quantity > 0 THEN
      -- Lock row
      PERFORM 1 FROM public.products WHERE id = v_product_id FOR UPDATE;

      -- Increment stock back
      UPDATE public.products
      SET available = available + v_quantity
      WHERE id = v_product_id;

      v_items_restored := v_items_restored + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'items_restored', v_items_restored
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.restore_order_inventory(jsonb) TO authenticated, service_role;
