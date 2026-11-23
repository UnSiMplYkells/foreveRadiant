import { useQuery } from "@tanstack/react-query";
import { fetchAllOrders } from "../Services/apiOrder";

export function useAllOrders() {
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["all-orders"],
    queryFn: fetchAllOrders,
    staleTime: 30 * 1000,
  });

  return { orders, isLoading, error };
}
