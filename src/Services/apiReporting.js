import supabase from "./supabase";

/**
 * Fetch executive KPIs for the last 30 days via Supabase RPC
 */
export async function fetchAdminKPIs() {
  const { data, error } = await supabase.rpc("get_admin_kpis");

  if (error) {
    console.error("Error executing get_admin_kpis:", error.message);
    throw new Error(error.message);
  }

  // Returns array with 1 row: [{ total_revenue, total_orders, average_order_value }]
  return (
    data?.[0] || {
      total_revenue: 0,
      total_orders: 0,
      average_order_value: 0,
    }
  );
}

/**
 * Fetch 30-day daily sales & revenue breakdown via Supabase RPC
 */
export async function fetchSalesTrends() {
  const { data, error } = await supabase.rpc("get_sales_trends");

  if (error) {
    console.error("Error executing get_sales_trends:", error.message);
    throw new Error(error.message);
  }

  return data || [];
}
