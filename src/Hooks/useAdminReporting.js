import { useQuery } from "@tanstack/react-query";
import { fetchAdminKPIs, fetchSalesTrends } from "../Services/apiReporting";

export function useAdminKPIs() {
  const {
    data: kpis = { total_revenue: 0, total_orders: 0, average_order_value: 0 },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-kpis"],
    queryFn: fetchAdminKPIs,
    staleTime: 60 * 1000,
  });

  return { kpis, isLoading, error };
}

export function useSalesTrends() {
  const {
    data: salesTrends = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sales-trends"],
    queryFn: fetchSalesTrends,
    staleTime: 60 * 1000,
  });

  return { salesTrends, isLoading, error };
}
