-- Migration: 20261123000005_order_email_trigger.sql
-- Description: Database trigger to invoke send-email Edge Function via pg_net when an order becomes 'paid'

-- 1. Ensure pg_net extension is available for non-blocking HTTP requests
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Trigger function to prepare payload and dispatch HTTP request to Edge Function
CREATE OR REPLACE FUNCTION public.trigger_order_confirmation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_items jsonb;
  v_payload jsonb;
  v_project_ref text;
  v_functions_url text;
  v_anon_key text;
BEGIN
  -- Only trigger when status transitions to 'paid'
  IF (TG_OP = 'INSERT' AND NEW.status = 'paid') OR 
     (TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM 'paid') AND NEW.status = 'paid') THEN

    -- Aggregate order items for the receipt
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'name', oi.product_name,
          'quantity', oi.product_quantity,
          'price', oi.product_price,
          'size', oi.product_size_ml
        )
      ),
      '[]'::jsonb
    )
    INTO v_items
    FROM public.order_items oi
    WHERE oi.order_id = NEW.order_id;

    -- Build payload for send-email function
    v_payload := jsonb_build_object(
      'email', NEW.email,
      'fullName', NEW.full_name,
      'orderId', NEW.order_id,
      'totalPrice', NEW.total_price,
      'shippingAddress', NEW.shipping_address,
      'subject', 'Your Forever Radiant Order Receipt #' || NEW.order_id,
      'message', 'Thank you for your purchase! Your order has been confirmed and is being prepared.',
      'order_items', v_items
    );

    -- Retrieve configured project ref or fallback to project ref dncqfwbhphbhudkwerlt
    v_project_ref := COALESCE(
      nullif(current_setting('app.settings.project_ref', true), ''),
      'dncqfwbhphbhudkwerlt'
    );
    
    v_functions_url := 'https://' || v_project_ref || '.supabase.co/functions/v1/send-email';
    
    v_anon_key := COALESCE(
      nullif(current_setting('app.settings.service_role_key', true), ''),
      nullif(current_setting('app.settings.anon_key', true), ''),
      ''
    );

    -- Asynchronous, non-blocking HTTP post via pg_net
    BEGIN
      PERFORM net.http_post(
        url := v_functions_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_anon_key
        ),
        body := v_payload,
        timeout_milliseconds := 5000
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log warning without rolling back the order transaction
      RAISE WARNING 'Failed to enqueue order email notification for order %: %', NEW.order_id, SQLERRM;
    END;

  END IF;

  RETURN NEW;
END;
$$;

-- 3. Bind trigger to orders table
DROP TRIGGER IF EXISTS on_order_paid_send_email ON public.orders;

CREATE TRIGGER on_order_paid_send_email
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_order_confirmation_email();
