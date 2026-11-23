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
 * Verify whether a customer has purchased a specific product
 * Checks orders with valid paid/completed status containing the product
 * @param {string} userId
 * @param {number|string} productId
 * @returns {Promise<boolean>}
 */
export async function checkUserHasPurchased(userId, productId) {
  if (!userId || !productId) return false;

  const numProductId = Number(productId);

  try {
    // 1. Try server RPC function first (authoritative database check)
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "has_user_purchased_product",
      {
        p_user_id: userId,
        p_product_id: numProductId,
      }
    );

    if (!rpcError && typeof rpcResult === "boolean") {
      return rpcResult;
    }
  } catch (err) {
    console.warn("RPC check fallback to query:", err?.message);
  }

  // 2. Direct client query fallback: fetch user's orders and check order items
  try {
    const { data: userOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, order_id, status, is_paid, order_items (id, product_id)")
      .eq("user_id", userId);

    if (ordersError || !userOrders) return false;

    const hasBought = userOrders.some((order) => {
      const isPaid =
        order.is_paid === true ||
        ["paid", "processing", "shipped", "delivered"].includes(
          String(order.status || "").toLowerCase()
        );

      if (!isPaid) return false;

      return (order.order_items || []).some(
        (item) => Number(item.product_id) === numProductId
      );
    });

    return hasBought;
  } catch (err) {
    console.error("Error checking customer purchase history:", err);
    return false;
  }
}

/**
 * Submit a new review for a product (Restricted to verified buyers)
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
  isAdmin = false,
}) {
  if (!productId) throw new Error("Product ID is required to leave a review");
  if (!rating || rating < 1 || rating > 5) throw new Error("A rating between 1 and 5 is required");
  if (!review || review.trim().length < 5) throw new Error("Review must be at least 5 characters");
  if (!userId) throw new Error("Sign in is required to submit a verified customer review");

  // Enforce verified purchase: customers must have bought the product
  if (!isAdmin) {
    const hasPurchased = await checkUserHasPurchased(userId, productId);
    if (!hasPurchased) {
      throw new Error(
        "Verified Purchase Required: Only customers who have purchased this formula can leave a review."
      );
    }
  }

  const payload = {
    product_id: Number(productId),
    rating: Number(rating),
    title: title ? title.trim() : null,
    review: review.trim(),
    user_name: userName ? userName.trim() : "Verified Customer",
    user_email: userEmail ? userEmail.trim() : null,
    user_id: userId,
    is_verified_buyer: true,
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
