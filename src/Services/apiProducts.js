import supabase from "./supabase";
import { validateProductPayload } from "../Validation/schemas";

/**
 * Fetch products with server-side pagination, category filtering, and optional search.
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=12]
 * @param {string} [options.category='All']
 * @param {string} [options.search='']
 */
export async function getProducts({ page = 1, limit = 12, category = "All", search = "" } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" });

  // Server-side category filtering
  if (category && category.toLowerCase() !== "all") {
    query = query.ilike("category", category);
  }

  // Server-side search filtering
  if (search && search.trim() !== "") {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  // Pagination & ordering
  query = query.order("id", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error loading products:", error);
    throw new Error(`Products could not be loaded: ${error.message}`);
  }

  const totalPages = Math.ceil((count || 0) / limit) || 1;

  return {
    products: data || [],
    count: count || 0,
    totalPages,
    currentPage: page,
  };
}

// Backward-compatible getProduct function
export async function getProduct() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Products could not be loaded");
  }

  return data;
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductDetails(productId) {
  if (!productId) throw new Error("Product ID is required");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw new Error("Product not found");
  }

  return data;
}

/**
 * Insert a new product (Admin only - verified client-side with Zod and enforced by Supabase RLS)
 */
export async function createProduct(productData) {
  const validated = validateProductPayload(productData);

  const { data, error } = await supabase
    .from("products")
    .insert([validated])
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update an existing product (Admin only)
 */
export async function updateProduct(productId, productData) {
  if (!productId) throw new Error("Product ID is required for update");
  const validated = validateProductPayload(productData);

  const { data, error } = await supabase
    .from("products")
    .update(validated)
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating product ${productId}:`, error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a product (Admin only)
 */
export async function deleteProduct(productId) {
  if (!productId) throw new Error("Product ID is required for deletion");

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .select();

  if (error) {
    console.error(`Error deleting product ${productId}:`, error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Upload a product image to Supabase Storage 'product-images' bucket
 */
export async function uploadProductImage(file) {
  if (!file) throw new Error("No image file provided");

  const fileExt = file.name.split(".").pop();
  const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;

  const bucketName = "product-images";

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
