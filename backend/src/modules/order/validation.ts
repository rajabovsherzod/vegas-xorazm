import { z } from "zod";
import { orderTypeEnum, paymentMethodEnum } from "../../db/schema";

// 1. Order Item
const orderItemSchema = z.object({
  // 🛠️ TUZATILDI: Ichidagi { invalid_type_error: ... } ni olib tashladik.
  // Shunchaki z.number() ni o'zi "Required" va "Number bo'lishi shart" degan ma'noni bildiradi.
  productId: z.number(), 
  
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, "Miqdor to'g'ri bo'lishi kerak (masalan: '2' yoki '1.5')"),
});

// 2. Create Order
export const createOrderSchema = z.object({
  body: z.object({
    partnerId: z.number().optional(),
    customerName: z.string().optional(),
    
    type: z.enum(orderTypeEnum.enumValues as [string, ...string[]]).default('retail'),
    paymentMethod: z.enum(paymentMethodEnum.enumValues as [string, ...string[]]).default('cash'),
    
    // --- YANGI: Kursni qabul qilamiz ---
    // Default 1 berib turamiz, agar frontend yubormasa (eski mantiq buzilmasligi uchun)
    exchangeRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Kurs raqam bo'lishi kerak").default("1"),

    items: z.array(orderItemSchema).min(1, "Kamida bitta mahsulot tanlanishi kerak"),
  }),
});

// 3. Update Order Status
export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["completed", "cancelled"]),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>["body"];