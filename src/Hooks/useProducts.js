import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "../Services/apiProducts";
import { useEffect } from "react";

/**
 * Custom React Query hook for fetching products with server-side pagination and category filtering.
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=12]
 * @param {string} [options.category='All']
 * @param {string} [options.search='']
 */
export function useProducts({ page = 1, limit = 12, category = "All", search = "" } = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    error,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["products", { page, limit, category, search }],
    queryFn: () => getProducts({ page, limit, category, search }),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { products = [], count = 0, totalPages = 1 } = data || {};

  // Prefetch adjacent pages for instantaneous pagination UX
  useEffect(() => {
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ["products", { page: page + 1, limit, category, search }],
        queryFn: () => getProducts({ page: page + 1, limit, category, search }),
      });
    }
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ["products", { page: page - 1, limit, category, search }],
        queryFn: () => getProducts({ page: page - 1, limit, category, search }),
      });
    }
  }, [page, totalPages, limit, category, search, queryClient]);

  return {
    products,
    count,
    totalPages,
    currentPage: page,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
  };
}
