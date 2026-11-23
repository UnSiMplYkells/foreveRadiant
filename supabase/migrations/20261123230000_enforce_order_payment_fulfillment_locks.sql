-- Migration: 20261123230000_enforce_order_payment_fulfillment_locks.sql
-- Description: Enforce order payment check before fulfillment (cannot ship or deliver unpaid orders)

-- 1. Add is_paid, payment_method, paid_at columns if not present
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS is_paid boolean DEFAULT false;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'card';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- 2. Backfill existing records
UPDATE public.orders
SET is_paid = true,
    paid_at = COALESCE(paid_at, created_at)
WHERE status IN ('paid', 'shipped', 'delivered');

UPDATE public.orders
SET is_paid = false
WHERE status IN ('not paid', 'Pending', 'pending', 'unpaid');

-- 3. Create Trigger Function enforcing payment check before fulfillment
CREATE OR REPLACE FUNCTION public.check_order_payment_before_fulfillment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Strict Check: An order cannot be set to shipped or delivered if is_paid is false
  IF (NEW.status IN ('shipped', 'delivered')) AND (NEW.is_paid IS NOT TRUE) THEN
    RAISE EXCEPTION 'Fulfillment Blocked: Cannot mark order "%" as "%" because payment has not been received or confirmed (is_paid is false). Orders must be paid prior to shipping or delivery.',
      COALESCE(NEW.order_id, NEW.id::text), NEW.status;
  END IF;

  -- Synchronize paid status:
  IF NEW.status = 'paid' THEN
    NEW.is_paid := true;
    IF NEW.paid_at IS NULL THEN
      NEW.paid_at := now();
    END IF;
  END IF;

  -- If is_paid is toggled to true, record timestamp
  IF NEW.is_paid IS TRUE AND (OLD IS NULL OR OLD.is_paid IS NOT TRUE) AND NEW.paid_at IS NULL THEN
    NEW.paid_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_order_payment_before_fulfillment ON public.orders;

CREATE TRIGGER trg_check_order_payment_before_fulfillment
BEFORE INSERT OR UPDATE OF status, is_paid
ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.check_order_payment_before_fulfillment();

-- 4. Admin RPC to verify / confirm payment
CREATE OR REPLACE FUNCTION public.admin_confirm_order_payment(
  p_order_id text,
  p_payment_method text DEFAULT 'manual_bank_transfer'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  UPDATE public.orders
  SET is_paid = true,
      paid_at = now(),
      payment_method = p_payment_method,
      status = CASE WHEN status = 'pending' OR status = 'not paid' THEN 'processing' ELSE status END
  WHERE order_id = p_order_id OR id::text = p_order_id
  RETURNING * INTO v_order;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order.order_id,
    'is_paid', true,
    'status', v_order.status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_confirm_order_payment(text, text) TO authenticated;
