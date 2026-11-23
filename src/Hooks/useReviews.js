import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProductReviews,
  addReview,
  deleteReview,
  checkUserHasPurchased,
} from "../Services/apiReviews";
import { useUserProfile } from "./useUserProfile";
import toast from "react-hot-toast";

/**
 * Hook to verify if current authenticated customer has bought this product
 * @param {number|string} productId
 */
export function useVerifiedPurchase(productId) {
  const { user, isAdmin, isAuthenticated } = useUserProfile();
  const numericId = Number(productId);

  const {
    data: hasPurchased = false,
    isLoading: isCheckingPurchase,
  } = useQuery({
    queryKey: ["verified-purchase", user?.id, numericId],
    queryFn: async () => {
      if (isAdmin) return true; // Admins can test/review
      if (!user?.id || !numericId) return false;
      return await checkUserHasPurchased(user.id, numericId);
    },
    enabled: Boolean(isAuthenticated && numericId),
    staleTime: 60 * 1000,
  });

  return {
    hasPurchased: isAdmin || Boolean(hasPurchased),
    isCheckingPurchase: isAuthenticated && isCheckingPurchase,
    isAuthenticated,
    user,
    isAdmin,
  };
}

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
