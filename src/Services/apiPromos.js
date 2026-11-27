import supabase from "./supabase";

function isMissingPromoSchemaError(error) {
  if (!error) return false;
  const msg = String(error.message || "").toLowerCase();
  const code = String(error.code || "");
  return (
    code === "42P01" ||
    code === "42883" ||
    code === "PGRST205" ||
    code === "PGRST202" ||
    msg.includes("promo_codes") && msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    msg.includes("could not find the function")
  );
}

/**
 * Validate a promo code on the storefront using the PostgreSQL RPC
 * @param {string} code
 */
export async function validatePromoCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) {
    throw new Error("Please enter a promo code.");
  }

  const { data, error } = await supabase.rpc("validate_promo_code", {
    p_code: normalized,
  });

  if (error) {
    if (isMissingPromoSchemaError(error)) {
      throw new Error("Promo codes are not initialized on the database yet. Please run the promo migration SQL in Supabase.");
    }
    throw new Error(error.message || "Could not verify promo code.");
  }

  if (!data?.valid) {
    throw new Error(data?.message || "Invalid or expired promo code.");
  }

  return {
    code: data.code,
    discountPercent: Number(data.discount_percent) || 0,
    mode: data.mode,
    expiresAt: data.expires_at,
    description: data.description || "",
    message: data.message,
  };
}

/**
 * Atomically increment promo usage_count on order placement
 * @param {string} code
 */
export async function redeemPromoCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return null;

  const { data, error } = await supabase.rpc("redeem_promo_code", {
    p_code: normalized,
  });

  if (error) {
    if (isMissingPromoSchemaError(error)) return null;
    throw new Error(error.message || "Could not redeem promo code.");
  }

  if (!data?.success) {
    throw new Error(data?.message || "Promo code is no longer valid.");
  }

  return data;
}

/**
 * Admin: Fetch all promo codes (manual + time-based)
 */
export async function fetchAllPromoCodes() {
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingPromoSchemaError(error)) {
      return { items: [], schemaMissing: true };
    }
    throw new Error(error.message || "Failed to load promo codes.");
  }

  return { items: data || [], schemaMissing: false };
}

/**
 * Admin: Issue a new promo code
 */
export async function createPromoCode(payload) {
  const cleanPayload = {
    code: String(payload.code || "").trim().toUpperCase(),
    discount_percent: Number(payload.discount_percent),
    description: String(payload.description || "").trim(),
    mode: payload.mode === "timed" ? "timed" : "manual",
    is_active: payload.is_active !== false,
    expires_at:
      payload.mode === "timed" && payload.expires_at
        ? new Date(payload.expires_at).toISOString()
        : null,
    max_uses: payload.max_uses ? Number(payload.max_uses) : null,
  };

  const { data, error } = await supabase
    .from("promo_codes")
    .insert([cleanPayload])
    .select()
    .single();

  if (error) {
    if (String(error.code) === "23505" || String(error.message).toLowerCase().includes("duplicate")) {
      throw new Error(`Promo code "${cleanPayload.code}" already exists.`);
    }
    throw new Error(error.message || "Could not create promo code.");
  }

  return data;
}

/**
 * Admin: Update promo code (toggle active state, change mode/expiry/discount)
 */
export async function updatePromoCode({ id, updates }) {
  const cleanUpdates = { ...updates };
  if (cleanUpdates.code !== undefined) {
    cleanUpdates.code = String(cleanUpdates.code).trim().toUpperCase();
  }
  if (cleanUpdates.mode === "manual") {
    cleanUpdates.expires_at = null;
  } else if (cleanUpdates.mode === "timed" && cleanUpdates.expires_at) {
    cleanUpdates.expires_at = new Date(cleanUpdates.expires_at).toISOString();
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .update(cleanUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Could not update promo code.");
  }

  return data;
}

/**
 * Admin: Delete a promo code
 */
export async function deletePromoCode(id) {
  const { error } = await supabase
    .from("promo_codes")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Could not delete promo code.");
  }

  return true;
}
