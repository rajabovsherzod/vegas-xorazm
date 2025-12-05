import { z } from "zod";

// Create uchun qoidalar
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, { message: "Nom kamida 2 ta belgi bo'lishi kerak" }),
    categoryId: z.number().optional(),
    
    // Coerce: Agar string kelsa ham numberga o'giradi ("100" -> 100)
    price: z.coerce.number().min(0),
    stock: z.coerce.number().default(0),
    originalPrice: z.coerce.number().optional(), // Qo'shildi
    
    unit: z.string().default("dona"),
    barcode: z.string().min(1, { message: "Barkod kiritish majburiy" }),
    currency: z.enum(["UZS", "USD"]).default("UZS"),
    isActive: z.boolean().optional().default(true),
  }),
});

// Update uchun qoidalar
export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    categoryId: z.number().optional(),
    price: z.coerce.number().optional(),
    stock: z.coerce.number().optional(),
    originalPrice: z.coerce.number().optional(),
    unit: z.string().optional(),
    barcode: z.string().min(1).optional(),
    currency: z.enum(["UZS", "USD"]).optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

// Stock qo'shish uchun
export const addStockSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().min(0.01, "Miqdor noto'g'ri"),
    newPrice: z.coerce.number().optional()
  })
});

// Tiplarni export qilamiz
export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
export type AddStockInput = z.infer<typeof addStockSchema>["body"];