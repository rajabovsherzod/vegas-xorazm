import * as z from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Login kamida 3 ta belgidan iborat bo'lishi kerak",
  }),
  password: z.string().min(5, {
    message: "Parol kamida 5 ta belgidan iborat bo'lishi kerak",
  }),
});

export type LoginValues = z.infer<typeof loginSchema>;