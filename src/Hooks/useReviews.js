import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProductReviews, addReview, deleteReview } from "../Services/apiReviews";
import toast from "react-hot-toast";

/**
 * Hook to fetch reviews for a specific product
 * @param {number|string} productId
 */
export function useProductReviews(productId) {
  const numericId = Number(productId);

  const {
    data: reviews = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["productReviews", numericId],
    queryFn: () => fetchProductReviews(numericId),
    enabled: Boolean(numericId),
    staleTime: 30 * 1000,
  });

  // Calculate review metrics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalReviews).toFixed(1)
    : "5.0";

  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return {
    reviews,
    isLoading,
    error,
    totalReviews,
    averageRating,
    ratingCounts,
    refetch,
  };
}

/**
 * Hook to submit a new review
 * @param {number|string} productId
 */
export function useCreateReview(productId) {
  const queryClient = useQueryClient();
  const numericId = Number(productId);

  const { mutate: submitReview, isLoading: isSubmitting } = useMutation({
    mutationFn: (newReview) => addReview({ ...newReview, productId: numericId }),
    onSuccess: () => {
      toast.success("Thank you! Your review has been published.");
      queryClient.invalidateQueries({ queryKey: ["productReviews", numericId] });
    },
    onError: (err) => {
      toast.error(err.message || "Could not publish your review");
    },
  });

  return { submitReview, isSubmitting };
}

/**
 * Hook to delete a review
 * @param {number|string} productId
 */
export function useDeleteReview(productId) {
  const queryClient = useQueryClient();
  const numericId = Number(productId);

  const { mutate: removeReview, isLoading: isDeleting } = useMutation({
    mutationFn: (reviewId) => deleteReview(reviewId),
    onSuccess: () => {
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["productReviews", numericId] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete review");
    },
  });

  return { removeReview, isDeleting };
}
