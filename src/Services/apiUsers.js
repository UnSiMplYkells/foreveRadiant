import supabase from "./supabase";

/**
 * Pure API: Fetch detailed profile for a given user ID
 */
export async function fetchUpdatedUserDetails(userId) {
  if (!userId) return null;

  const { data: userDetailed, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return userDetailed || null;
}

/**
 * Pure API: Update or create user profile details
 */
export async function updateUserDetails(userId, updates) {
  if (!userId) throw new Error("User ID is required");

  const { data: existingDetailItem, error: existingError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existingError && existingError.code !== "PGRST116") {
    throw new Error(existingError.message);
  }

  if (existingDetailItem) {
    const changes = {};
    let hasChanges = false;

    ["address_I", "phonenumber_I", "address_II", "phonenumber_II"].forEach((field) => {
      if (updates[field] !== undefined && updates[field] !== existingDetailItem[field]) {
        changes[field] = updates[field];
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      return { existingDetailItem, noChanges: true };
    }

    const { data, error } = await supabase
      .from("users")
      .update(changes)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { updated: data };
  }

  const { data, error } = await supabase
    .from("users")
    .upsert({ user_id: userId, ...updates })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return { newDetailItem: data };
}

/**
 * Pure API: Fetch user role ('customer' or 'admin')
 */
export async function fetchUserRole(userId) {
  if (!userId) return "customer";

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error) return "customer";
  return data?.role || "customer";
}


