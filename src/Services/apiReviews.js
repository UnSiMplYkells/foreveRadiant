import supabase from "./supabase.js";

/**
 * Fetch all reviews for a specific product
 * @param {number|string} productId
 */
export async function fetchProductReviews(productId) {
  if (!productId) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error.message);
    throw new Error(`Could not load reviews: ${error.message}`);
  }

  return data || [];
}

/**
 * Submit a new review for a product
 * @param {Object} reviewData
 */
export async function addReview({
  productId,
  rating,
  title,
  review,
  userName = "Verified Customer",
  userEmail = null,
  userId = null,
}) {
  if (!productId) throw new Error("Product ID is required to leave a review");
  if (!rating || rating < 1 || rating > 5) throw new Error("A rating between 1 and 5 is required");
  if (!review || review.trim().length < 5) throw new Error("Review must be at least 5 characters");

  const payload = {
    product_id: Number(productId),
    rating: Number(rating),
    title: title ? title.trim() : null,
    review: review.trim(),
    user_name: userName ? userName.trim() : "Verified Customer",
    user_email: userEmail ? userEmail.trim() : null,
    user_id: userId || null,
  };

  const { data, error } = await supabase
    .from("reviews")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error submitting review:", error.message);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a review (by reviewer or admin)
 * @param {number|string} reviewId
 */
export async function deleteReview(reviewId) {
  const { data, error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .select();

  if (error) {
    console.error("Error deleting review:", error.message);
    throw new Error(error.message);
  }

  return data;
}
