-- Migration: 20261124000000_verified_purchaser_reviews.sql
-- Description: Enforce verified purchase requirement before customers can submit reviews

-- 1. Ensure reviews table has is_verified_buyer column
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_verified_buyer boolean DEFAULT true;

-- 2. Create function to check if a user has bought a product
CREATE OR REPLACE FUNCTION public.has_user_purchased_product(p_user_id uuid, p_product_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_purchased boolean := false;
BEGIN
  IF p_user_id IS NULL OR p_product_id IS NULL THEN
    RETURN false;
  END IF;

  -- Allow administrators to review for product onboarding/testing
  IF public.is_admin() THEN
    RETURN true;
  END IF;

  -- Check if user has an order item for this product with a paid/confirmed order
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON (
      oi.order_id = o.order_id
      OR oi.order_id = o.id::text
    )
    WHERE (oi.user_id = p_user_id OR o.user_id = p_user_id)
      AND oi.product_id = p_product_id
      AND (
        o.is_paid = true
        OR lower(coalesce(o.status, '')) IN ('paid', 'processing', 'shipped', 'delivered')
      )
  ) INTO v_has_purchased;

  IF v_has_purchased THEN
    RETURN true;
  END IF;

  -- Fallback check: check directly by user_id on order_items if order has matching status
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    WHERE oi.user_id = p_user_id
      AND oi.product_id = p_product_id
      AND EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.user_id = p_user_id
          AND (
            o.is_paid = true
            OR lower(coalesce(o.status, '')) IN ('paid', 'processing', 'shipped', 'delivered')
          )
          AND (o.order_id = oi.order_id OR o.id::text = oi.order_id)
      )
  ) INTO v_has_purchased;

  RETURN v_has_purchased;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_user_purchased_product(uuid, bigint) TO authenticated, anon;

-- 3. Database Trigger: Enforce verified purchase check BEFORE INSERT on reviews
CREATE OR REPLACE FUNCTION public.check_review_verified_buyer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins to submit reviews
  IF public.is_admin() THEN
    NEW.is_verified_buyer := true;
    RETURN NEW;
  END IF;

  -- Customers must be authenticated
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: You must be signed in to submit a customer review.';
  END IF;

  -- Customer must have actually bought the product
  IF NOT public.has_user_purchased_product(NEW.user_id, NEW.product_id) THEN
    RAISE EXCEPTION 'Verified Purchase Required: Only customers who have purchased this product can leave a review.';
  END IF;

  NEW.is_verified_buyer := true;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_review_verified_buyer ON public.reviews;
CREATE TRIGGER trg_check_review_verified_buyer
BEFORE INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.check_review_verified_buyer();
