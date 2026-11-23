import supabase from "./supabase";

export async function createOrder(userId, totalPrice, orderStatus, zipCode, shipTo, orderId, fullName, userEmail, contactInfo) {
  const { data: orderDetails, error } = await supabase
    .from("orders")
    .insert([
      {
        user_id: userId,
        total_price: totalPrice,
        status: orderStatus && orderStatus !== "not paid" ? orderStatus : "pending",
        is_paid: false,
        payment_status: "unpaid",
        zip_code: zipCode,
        shipping_address: shipTo,
        order_id: orderId,
        email: userEmail,
        full_name: fullName,
        contact: contactInfo,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error.message);
    throw new Error(error.message);
  }

  return orderDetails;
}

export async function createOrderItems(userId, orderId, checkedCartItems) {
  const items = checkedCartItems.map((item) => ({
    user_id: userId,
    order_id: orderId,
    product_name: item.products.name,
    product_quantity: item.quantity,
    product_price: Number(item.size_price) || Number(item.products.price),
    product_size_ml: item.size,
    product_id: item.product_id,
  }));

  const { data, error } = await supabase.from("order_items").insert(items);

  if (error) {
    console.error("Error inserting order items:", error.message);
    throw error;
  }
  return data;
}

export async function fetchOrderItems(userId) {
  if (!userId) return [];

  const { data: fetchedOrderItems, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  return fetchedOrderItems;
}

/**
 * Fetch all orders across the entire store (Admin only)
 */
export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all orders:", error);
    throw new Error(error.message);
  }
  return data || [];
}

export async function updateOrderStatus(orderId, newStatus) {
  // Business Guardrail Check: Never fulfill an order if payment is not confirmed
  if (newStatus === "shipped" || newStatus === "delivered" || newStatus === "processing") {
    let checkQuery = supabase.from("orders").select("id, order_id, is_paid, payment_status, status");
    if (typeof orderId === "number" || (!isNaN(orderId) && !String(orderId).includes("-"))) {
      checkQuery = checkQuery.eq("id", Number(orderId));
    } else {
      checkQuery = checkQuery.eq("order_id", orderId);
    }
    const { data: orderRecord, error: checkError } = await checkQuery.maybeSingle();
    if (!checkError && orderRecord) {
      const isPaid =
        orderRecord.is_paid === true ||
        String(orderRecord.payment_status).toLowerCase() === "paid" ||
        String(orderRecord.status).toLowerCase() === "paid";
      if (!isPaid && (newStatus === "shipped" || newStatus === "delivered")) {
        throw new Error(
          `Action Blocked: Order #${orderRecord.order_id || orderId} is marked UNPAID. You cannot ship or fulfill an order until payment is verified.`
        );
      }
    }
  }

  let query = supabase.from("orders").update({ status: newStatus });
  if (typeof orderId === "number" || (!isNaN(orderId) && !String(orderId).includes("-"))) {
    query = query.eq("id", Number(orderId));
  } else {
    query = query.eq("order_id", orderId);
  }

  const { data, error } = await query.select();

  if (error) {
    console.error("Error updating status:", error.message);
    throw new Error(error.message);
  }

  return data?.[0] || data;
}

/**
 * Admin action: Verify and record payment for an order
 * Transitions an unpaid order to paid and sets status to 'processing'
 */
export async function confirmOrderPayment(orderId, paymentMethod = "manual_bank_transfer") {
  let query = supabase
    .from("orders")
    .update({
      is_paid: true,
      payment_status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: paymentMethod,
      status: "processing",
    });

  if (typeof orderId === "number" || (!isNaN(orderId) && !String(orderId).includes("-"))) {
    query = query.eq("id", Number(orderId));
  } else {
    query = query.eq("order_id", orderId);
  }

  const { data, error } = await query.select();

  if (error) {
    console.error("Error confirming payment:", error.message);
    throw new Error(error.message);
  }

  return data?.[0] || data;
}

/**
 * Storefront payment confirmation fallback
 */
export async function markOrderPaid(orderId, paymentMethod = "flutterwave") {
  let query = supabase
    .from("orders")
    .update({
      is_paid: true,
      payment_status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: paymentMethod,
      status: "processing",
    });

  if (typeof orderId === "number" || (!isNaN(orderId) && !String(orderId).includes("-"))) {
    query = query.eq("id", Number(orderId));
  } else {
    query = query.eq("order_id", orderId);
  }

  const { data, error } = await query.select();

  if (error) {
    console.error("Error marking order paid:", error.message);
    throw new Error(error.message);
  }

  return data?.[0] || data;
}

export async function deleteMultipleCartItem(userId, checkedCartItems) {
  const cartItemIds = checkedCartItems.map((item) => item.id);

  const { data, error } = await supabase
    .from("cart")
    .delete()
    .in("id", cartItemIds)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("Error deleting multiple cart items:", error.message);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Concurrency-Safe Inventory Checkout RPC with Row-Level Pessimistic Locking
 * Calls postgres function `process_order_checkout`
 * @param {string} orderId
 * @param {Array<{product_id: number, quantity: number}>} items
 */
export async function processCheckoutRPC(orderId, items) {
  const formattedItems = items.map((i) => ({
    product_id: Number(i.product_id),
    quantity: Number(i.quantity || i.product_quantity),
  }));

  const { data, error } = await supabase.rpc("process_order_checkout", {
    p_order_id: orderId,
    p_items: formattedItems,
  });

  if (error) {
    console.error("Pessimistic Locking RPC Error:", error);
    throw new Error(error.message);
  }

  return data;
}
