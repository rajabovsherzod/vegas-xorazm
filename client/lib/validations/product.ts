import * as z from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 harf bo'lishi kerak"),
  barcode: z.string().min(1, "Barkod kiritish majburiy"),
  price: z.coerce.number().min(0, "Narx manfiy bo'lishi mumkin emas"),
  originalPrice: z.coerce.number().optional(),
  currency: z.enum(["UZS", "USD"]).default("UZS"),
  stock: z.coerce.number().min(0, "Soni manfiy bo'lishi mumkin emas"),
  unit: z.string().default("dona"),
  categoryId: z.coerce.number().optional(),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;


export const createProductSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 harf bo'lishi kerak"),
  barcode: z.string().min(1, "Barkod kiritish majburiy"),
  price: z.coerce.number().min(0, "Narx manfiy bo'lishi mumkin emas"),
  originalPrice: z.coerce.number().optional(),
  currency: z.enum(["UZS", "USD"]).default("UZS"),
  stock: z.coerce.number().min(0, "Soni manfiy bo'lishi mumkin emas"),
  unit: z.string().default("dona"),
  categoryId: z.coerce.number().optional(),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;



export const createProductSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 harf bo'lishi kerak"),
  barcode: z.string().min(1, "Barkod kiritish majburiy"),
  price: z.coerce.number().min(0, "Narx manfiy bo'lishi mumkin emas"),
  originalPrice: z.coerce.number().optional(),
  currency: z.enum(["UZS", "USD"]).default("UZS"),
  stock: z.coerce.number().min(0, "Soni manfiy bo'lishi mumkin emas"),
  unit: z.string().default("dona"),
  categoryId: z.coerce.number().optional(),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;


export const createProductSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 harf bo'lishi kerak"),
  barcode: z.string().min(1, "Barkod kiritish majburiy"),
  price: z.coerce.number().min(0, "Narx manfiy bo'lishi mumkin emas"),
  originalPrice: z.coerce.number().optional(),
  currency: z.enum(["UZS", "USD"]).default("UZS"),
  stock: z.coerce.number().min(0, "Soni manfiy bo'lishi mumkin emas"),
  unit: z.string().default("dona"),
  categoryId: z.coerce.number().optional(),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;


