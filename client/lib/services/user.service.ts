import { api } from "@/lib/api/api-client"; // ApiClient yaratgan faylingiz manzilini to'g'ri ko'rsating
import { CreateUserFormValues } from "@/lib/validations/user";

// Backenddan keladigan User tipi (qisqartirilgan)
export interface User {
  id: number;
  fullName: string;
  username: string;
  role: "owner" | "admin" | "seller";
  isActive: boolean;
  createdAt: string;
}

export const userService = {
  // 1. Barcha xodimlarni olish
  // GET /users
  getAll: async () => {
    // api.get o'zi <User[]> tipini qaytaradi (ApiClient ichidagi mantiqqa ko'ra)
    return await api.get<User[]>("/users");
  },

  // 2. Yangi xodim yaratish
  // POST /users
  create: async (payload: CreateUserFormValues) => {
    return await api.post<User>("/users", payload);
  },

  // 3. Xodimni yangilash (ID bo'yicha)
  // PATCH /users/:id
  update: async (id: number, payload: Partial<CreateUserFormValues>) => {
    return await api.patch<User>(`/users/${id}`, payload);
  },

  // 4. Xodimni o'chirish (yoki bloklash)
  // DELETE /users/:id
  delete: async (id: number) => {
    return await api.delete<{ success: boolean }>(`/users/${id}`);
  },
  
  // 5. Bitta xodimni olish
  // GET /users/:id
  getById: async (id: number) => {
    return await api.get<User>(`/users/${id}`);
  }
};