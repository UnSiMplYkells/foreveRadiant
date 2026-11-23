import { useQuery } from "@tanstack/react-query";
import { fetchProductDetails } from "../Services/apiProducts";

export function useProductDetails(productId) {
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductDetails(productId),
    enabled: Boolean(productId),
    staleTime: 60 * 1000,
  });

  return { product, isLoading, error };
}
