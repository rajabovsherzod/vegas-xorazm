import { z } from "zod";

// Enum qiymatlarini qo'lda yozgan ma'qul (Circular Dependency xavfini yo'qotish uchun)
const roles = ["owner", "admin", "seller"] as const;

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, "Ism kamida 3 harf bo'lishi kerak").max(255),
    username: z.string().min(3, "Login kamida 3 harf bo'lishi kerak").max(50),
    password: z.string().min(5, "Parol kamida 5 ta belgidan iborat bo'lishi kerak"),
    
    role: z.enum(roles, {
      errorMap: () => ({ message: "Rol noto'g'ri tanlandi" })
    }),

    // 🔥 MUHIM O'ZGARISH: z.coerce.string()
    // Bu frontenddan number kelsa ham stringga aylantirib oladi.
    fixSalary: z.coerce.string().regex(/^\d+(\.\d{1,2})?$/, "Oylik noto'g'ri").default("0"),
    bonusPercent: z.coerce.string().regex(/^\d+(\.\d{1,2})?$/, "Bonus noto'g'ri").default("0"),
    finePerHour: z.coerce.string().regex(/^\d+(\.\d{1,2})?$/, "Jarima noto'g'ri").default("0"),

    workStartTime: z.string().regex(timeRegex, "Vaqt formati (HH:MM)").default("09:00:00"),

    cardId: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().optional(),
    password: z.string().min(5).optional(),
    role: z.enum(roles).optional(),
    
    fixSalary: z.coerce.string().optional(),
    bonusPercent: z.coerce.string().optional(),
    finePerHour: z.coerce.string().optional(),
    
    workStartTime: z.string().regex(timeRegex).optional(),
    cardId: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];

