-- Migration: 20261123220000_admin_kpi_and_sales_trends_rpc.sql
-- Description: Aggregated business metrics and 30-day daily sales trends for Forever Radiant Admin Reporting

-- 1. get_admin_kpis(): Returns Total Revenue, Total Orders, and Average Order Value for the last 30 days
CREATE OR REPLACE FUNCTION public.get_admin_kpis()
RETURNS TABLE (
  total_revenue numeric,
  total_orders bigint,
  average_order_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(o.total_price), 0)::numeric AS total_revenue,
    COUNT(o.id)::bigint AS total_orders,
    COALESCE(ROUND(AVG(o.total_price), 2), 0)::numeric AS average_order_value
  FROM public.orders o
  WHERE o.created_at >= (CURRENT_DATE - INTERVAL '29 days');
END;
$$;

-- 2. get_sales_trends(): Returns a continuous 30-day daily breakdown of revenue and orders count
CREATE OR REPLACE FUNCTION public.get_sales_trends()
RETURNS TABLE (
  sale_date text,
  formatted_date text,
  daily_revenue numeric,
  orders_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      (CURRENT_DATE - INTERVAL '29 days')::date,
      CURRENT_DATE::date,
      '1 day'::interval
    )::date AS day
  ),
  daily_sales AS (
    SELECT
      created_at::date AS order_day,
      COALESCE(SUM(total_price), 0) AS revenue,
      COUNT(id) AS orders_count
    FROM public.orders
    WHERE created_at >= (CURRENT_DATE - INTERVAL '29 days')
    GROUP BY created_at::date
  )
  SELECT
    TO_CHAR(ds.day, 'YYYY-MM-DD') AS sale_date,
    TO_CHAR(ds.day, 'Mon DD') AS formatted_date,
    COALESCE(s.revenue, 0)::numeric AS daily_revenue,
    COALESCE(s.orders_count, 0)::bigint AS orders_count
  FROM date_series ds
  LEFT JOIN daily_sales s ON ds.day = s.order_day
  ORDER BY ds.day ASC;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_admin_kpis() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_sales_trends() TO authenticated, anon, service_role;
