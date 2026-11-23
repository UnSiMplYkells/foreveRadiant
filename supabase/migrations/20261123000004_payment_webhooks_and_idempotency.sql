-- Migration: 20261123000004_payment_webhooks_and_idempotency.sql
-- Description: Create payment_events idempotency table, RLS policies for orders/order_items/cart, and atomic webhook handler RPC

-- 1. Create payment_events table for webhook idempotency
CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  provider text NOT NULL, -- 'stripe', 'paystack', 'flutterwave'
  event_type text NOT NULL,
  order_id text,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

-- Index for speedy idempotency lookup
CREATE INDEX IF NOT EXISTS idx_payment_events_key ON public.payment_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON public.payment_events(order_id);

-- Enable RLS on payment_events
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins and service role can access payment events" ON public.payment_events;

-- RLS: Only admins (or service role) can inspect webhook event logs
CREATE POLICY "Admins and service role can access payment events"
ON public.payment_events FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 2. Ensure RLS on orders, order_items, and cart tables

-- ORDERS Table RLS
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders or admins view all" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Users can view own orders or admins view all"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id)
WITH CHECK (public.is_admin() OR auth.uid() = user_id);


-- ORDER_ITEMS Table RLS
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items or admins view all" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;

CREATE POLICY "Users can view own order items or admins view all"
ON public.order_items FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own order items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);


-- CART Table RLS
ALTER TABLE IF EXISTS public.cart ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own cart" ON public.cart;

CREATE POLICY "Users manage own cart"
ON public.cart FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- KEEP_PROJECT_ALIVE Table RLS (Remediates Security Advisory)
ALTER TABLE IF EXISTS public.keep_project_alive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins or service role manage keep alive" ON public.keep_project_alive;

CREATE POLICY "Admins or service role manage keep alive"
ON public.keep_project_alive FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 3. Atomic Webhook Event Registration & Execution RPC
-- Registers the idempotency key and atomically executes stock decrement & order confirmation.
-- If the idempotency key was already recorded, it safely exits without double-processing.

CREATE OR REPLACE FUNCTION public.handle_payment_webhook(
  p_idempotency_key text,
  p_provider text,
  p_event_type text,
  p_order_id text,
  p_payload jsonb,
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_status text;
  v_checkout_res jsonb;
BEGIN
  -- 1. Check if event has already been registered
  SELECT status INTO v_existing_status
  FROM public.payment_events
  WHERE idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'duplicate', true,
      'status', v_existing_status,
      'message', 'Webhook event already processed or currently processing'
    );
  END IF;

  -- 2. Insert as 'processing' (Unique constraint guarantees no race condition)
  INSERT INTO public.payment_events (
    idempotency_key, provider, event_type, order_id, payload, status
  ) VALUES (
    p_idempotency_key, p_provider, p_event_type, p_order_id, p_payload, 'processing'
  );

  -- 3. If items are provided, execute concurrency-safe inventory deduction
  IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
    v_checkout_res := public.process_order_checkout(p_order_id, p_items);
  ELSE
    -- If order_id exists, simply ensure order status is updated to 'paid'
    IF p_order_id IS NOT NULL AND p_order_id <> '' THEN
      UPDATE public.orders SET status = 'paid' WHERE order_id = p_order_id;
    END IF;
  END IF;

  -- 4. Mark event as 'processed'
  UPDATE public.payment_events
  SET status = 'processed',
      processed_at = now()
  WHERE idempotency_key = p_idempotency_key;

  RETURN jsonb_build_object(
    'success', true,
    'duplicate', false,
    'status', 'processed',
    'order_id', p_order_id
  );

EXCEPTION WHEN OTHERS THEN
  -- Record failure on error so it can be debugged
  UPDATE public.payment_events
  SET status = 'failed',
      error_message = SQLERRM,
      processed_at = now()
  WHERE idempotency_key = p_idempotency_key;

  RAISE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_payment_webhook(text, text, text, text, jsonb, jsonb) TO service_role;
