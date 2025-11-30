import { z } from "zod";
import { roleEnum } from "../../db/schema"; 

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

// --- CREATE USER SCHEMA ---
export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, "Ism kamida 3 harf bo'lishi kerak").max(255),
    username: z.string().min(3, "Login kamida 3 harf bo'lishi kerak").max(50),
    password: z.string().min(5, "Parol kamida 5 ta belgidan iborat bo'lishi kerak"),
    
    // 🔥 TUZATISH:
    // 1. Drizzle enumValues ni `[string, ...string[]]` deb tanishtiramiz.
    // 2. { required_error } qismini olib tashladik (Zod object avtomatik required qiladi).
    role: z.enum(roleEnum.enumValues as [string, ...string[]]),

    // Moliyaviy ma'lumotlar
    fixSalary: z.string().regex(/^\d+(\.\d{1,2})?$/, "Oylik to'g'ri formatda bo'lishi kerak").default("0"),
    bonusPercent: z.string().regex(/^\d+(\.\d{1,2})?$/, "Bonus foizi to'g'ri bo'lishi kerak").default("0"),
    finePerHour: z.string().regex(/^\d+(\.\d{1,2})?$/, "Jarima miqdori to'g'ri bo'lishi kerak").default("0"),

    workStartTime: z.string().regex(timeRegex, "Vaqt formati noto'g'ri (HH:MM)").default("09:00:00"),

    cardId: z.string().optional(),
  }),
});

// --- UPDATE USER SCHEMA ---
export const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().optional(),
    password: z.string().min(5).optional(),
    
    // Bu yerda ham o'sha tuzatish:
    role: z.enum(roleEnum.enumValues as [string, ...string[]]).optional(),
    
    fixSalary: z.string().optional(),
    bonusPercent: z.string().optional(),
    finePerHour: z.string().optional(),
    workStartTime: z.string().regex(timeRegex).optional(),
    
    cardId: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];