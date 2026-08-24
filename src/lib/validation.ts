import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

export const checkoutSchema = z.object({
  customer: z.object({
    fullName: z.string().trim().min(2).max(160),
    phone: z.string().trim().min(10).max(40),
    whatsapp: z.string().trim().min(10).max(40),
    email: z.union([z.string().email(), z.literal("")]).optional(),
    address: z.string().trim().min(8).max(500),
    area: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(120),
    postalCode: z.string().trim().max(30).optional(),
    notes: z.string().trim().max(800).optional()
  }),
  paymentMethod: z.enum(["COD", "EASYPAISA"]),
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullable().optional(),
    quantity: z.number().int().min(1).max(20)
  })).min(1).max(50)
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sku: z.string().trim().min(2).max(80),
  shortDescription: z.string().trim().max(500).optional(),
  description: z.string().trim().min(10),
  categoryId: z.string().uuid().nullable().optional(),
  collectionId: z.string().uuid().nullable().optional(),
  price: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative().nullable().optional(),
  costPrice: z.number().int().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
  material: z.string().trim().max(120).optional(),
  weight: z.string().trim().max(80).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean(),
  newArrival: z.boolean(),
  bestseller: z.boolean().default(false),
  limited: z.boolean().default(false),
  seoTitle: z.string().trim().max(180).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  variants: z.array(z.object({
    id: z.string().uuid().optional(),
    sku: z.string().trim().min(2).max(80),
    size: z.string().trim().max(40).optional(),
    color: z.string().trim().max(60).optional(),
    price: z.number().int().nonnegative().nullable().optional(),
    salePrice: z.number().int().nonnegative().nullable().optional(),
    stock: z.number().int().nonnegative()
  })).default([])
});

export const reviewSchema = z.object({
  token: z.string().min(32).max(200),
  rating: z.number().int().min(1).max(5),
  displayName: z.string().trim().min(2).max(100),
  title: z.string().trim().max(140).optional(),
  body: z.string().trim().min(10).max(2000)
});

