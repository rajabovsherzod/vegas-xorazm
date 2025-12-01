import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().min(3, "Ism familiya to'liq bo'lishi kerak"),
  username: z.string().min(3, "Login kamida 3 ta belgi bo'lishi kerak"),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lishi kerak"),
  
  // 🔥 TUZATILDI: required_error o'rniga errorMap ishlatamiz
  role: z.enum(["admin", "seller"], {
    errorMap: () => ({ message: "Rolni tanlang" }), 
  }),

  cardId: z.string().optional(),
  
  // Inputdan string kelsa ham numberga o'giramiz
  fixSalary: z.coerce.number().min(0).default(0),
  bonusPercent: z.coerce.number().min(0).max(100).default(0),
  finePerHour: z.coerce.number().min(0).default(0),
  
  workStartTime: z.string().default("09:00"),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = Partial<CreateUserFormValues>;