import { api } from "@/lib/api/api-client";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/api";

// Re-export types for backward compatibility
export type { Category, CreateCategoryPayload };

interface GetCategoriesParams {
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Category Service
 * 
 * Kategoriyalar bilan ishlash uchun API metodlari
 */
export const categoryService = {
  /**
   * Barcha kategoriyalarni olish
   */
  getAll: async (params?: GetCategoriesParams): Promise<Category[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/categories?${queryString}` : "/categories";

    return await api.get<Category[]>(endpoint);
  },

  /**
   * Yangi kategoriya yaratish
   */
  create: async (data: CreateCategoryPayload): Promise<Category> => {
    return await api.post<Category>("/categories", data);
  },

  /**
   * Kategoriyani yangilash
   */
  update: async (id: number, data: UpdateCategoryPayload): Promise<Category> => {
    return await api.patch<Category>(`/categories/${id}`, data);
  },

  /**
   * Kategoriyani o'chirish (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    return await api.delete<void>(`/categories/${id}`);
  }
};

