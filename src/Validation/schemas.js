import { z } from "zod";

// ==========================================
// 1. ADMIN PRODUCT SCHEMA & DTO
// ==========================================
export const sizeVariantSchema = z.object({
  size: z.string().trim().min(1, "Size label is required (e.g. 50ml)"),
  price: z.coerce.number().positive("Price must be greater than zero"),
});

export const productSchema = z.object({
  name: z
    .string({ required_error: "Product name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),

  price: z.coerce
    .number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than zero"),

  available: z.coerce
    .number({ required_error: "Available inventory is required", invalid_type_error: "Stock must be a number" })
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),

  discount: z.coerce
    .number({ invalid_type_error: "Discount must be a number" })
    .min(0, "Discount cannot be less than 0%")
    .max(100, "Discount cannot exceed 100%")
    .default(0),

  category: z
    .string({ required_error: "Category is required" })
    .trim()
    .min(1, "Please select or enter a category"),

  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(5, "Description must be at least 5 characters long"),

  size: z
    .union([
      z.array(sizeVariantSchema),
      z.array(z.string()).transform((arr) => arr.map((s) => ({ size: s, price: 0 }))),
      z.string().transform((str) => [{ size: str, price: 0 }]),
    ])
    .default([]),

  image_url: z
    .union([
      z.array(z.string().url("Each image must be a valid URL")),
      z.string().url("Must be a valid URL"),
    ])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .default([]),
});

export function validateProductPayload(data) {
  return productSchema.parse(data);
}


// ==========================================
// 2. USER REGISTRATION & LOGIN SCHEMAS
// ==========================================
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export const userRegistrationSchema = z
  .object({
    fullName: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters long")
      .max(80, "Full name cannot exceed 80 characters"),

    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address"),

    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters long")
      .max(72, "Password cannot exceed 72 characters"),

    confirmPassword: z
      .string({ required_error: "Please confirm your password" })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function validateRegistrationPayload(data) {
  return userRegistrationSchema.parse(data);
}

export function validateLoginPayload(data) {
  return loginSchema.parse(data);
}


// ==========================================
// 3. CHECKOUT & ORDER DELIVERY SCHEMA & DTO
// ==========================================
export const checkoutItemSchema = z.object({
  product_id: z.coerce.number().positive("Valid product ID required"),
  product_name: z.string().min(1, "Product name required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
  size: z.union([z.string(), z.number()]).optional(),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Recipient name is required"),
  userEmail: z.string().trim().email("Valid email required"),
  shippingAddress: z
    .string({ required_error: "Shipping address is required" })
    .trim()
    .min(5, "Shipping address must be at least 5 characters"),
  contactInfo: z
    .string({ required_error: "Contact phone number is required" })
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Contact number must be between 10 and 15 digits"),
  zipCode: z
    .string({ required_error: "Zipcode is required" })
    .trim()
    .regex(/^\d{6}$/, "Zipcode must be exactly 6 digits"),
  totalPrice: z.coerce.number().positive("Total price must be greater than zero"),
  items: z.array(checkoutItemSchema).min(1, "Order must contain at least one item"),
});

export function validateCheckoutPayload(data) {
  return checkoutSchema.parse(data);
}


// ==========================================
// 4. PRODUCT REVIEW SCHEMA & DTO
// ==========================================
export const reviewSchema = z.object({
  rating: z.coerce
    .number({ required_error: "Please select a rating" })
    .int()
    .min(1, "Please select at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  title: z
    .string({ required_error: "Review headline is required" })
    .trim()
    .min(3, "Headline must be at least 3 characters")
    .max(100, "Headline cannot exceed 100 characters"),
  review: z
    .string({ required_error: "Review comments are required" })
    .trim()
    .min(10, "Review must be at least 10 characters long")
    .max(1000, "Review cannot exceed 1000 characters"),
  userName: z
    .string({ required_error: "Your name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  userEmail: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .optional()
    .or(z.literal("")),
});

export function validateReviewPayload(data) {
  return reviewSchema.parse(data);
}

