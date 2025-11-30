import { z } from "zod";

// --- VALIDATION SCHEMAS ---

// Create uchun qoidalar
export const createProductSchema = z.object({
  body: z.object({
    // FIX: required_error olib tashlandi, .min(3) bilan matn kiritilishini ta'minlaymiz
    name: z.string().min(3, { message: "Nom kamida 3 ta belgi bo'lishi kerak" }), 
    
    categoryId: z.number().optional(),
    
    // Zod Union tipida required_error ni ishlatish ancha murakkab, shuning uchun bazoviy validatsiyani qilamiz
    price: z.union([z.string(), z.number()]),
    
    stock: z.union([z.string(), z.number()]).default(0),
    
    unit: z.string().default("dona"),
    barcode: z.string().optional(),
    currency: z.enum(["UZS", "USD"]).default("UZS"),
    isActive: z.boolean().optional().default(true),
  }),
});

// Update uchun qoidalar
export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, { message: "Nom kamida 3 ta belgi bo'lishi kerak" }).optional(),
    categoryId: z.number().optional(),
    price: z.union([z.string(), z.number()]).optional(),
    stock: z.union([z.string(), z.number()]).optional(),
    unit: z.string().optional(),
    barcode: z.string().optional(),
    currency: z.enum(["UZS", "USD"]).optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

// Tiplarni export qilamiz
export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];