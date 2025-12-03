import { api } from "@/lib/api/api-client";
import type { Product, CreateProductPayload, UpdateProductPayload, PaginatedResponse } from "@/types/api";

interface GetProductsParams {
  search?: string;
  categoryId?: string | number;
  page?: number;
  limit?: number;
  showHidden?: string;
}

/**
 * Product Service
 * 
 * Mahsulotlar bilan ishlash uchun API metodlari
 */
export const productService = {
  /**
   * Barcha mahsulotlarni olish
   */
  getAll: async (params?: GetProductsParams): Promise<PaginatedResponse<Product>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";

    return await api.get<PaginatedResponse<Product>>(endpoint);
  },

  /**
   * Yangi mahsulot yaratish
   */
  create: async (data: CreateProductPayload): Promise<Product> => {
    return await api.post<Product>("/products", data);
  },

  /**
   * Mahsulotni yangilash
   */
  update: async (id: number, data: UpdateProductPayload): Promise<Product> => {
    return await api.patch<Product>(`/products/${id}`, data);
  },

  /**
   * Mahsulot kirim qilish (add stock)
   */
  addStock: async (id: number, quantity: number, newPrice?: number): Promise<Product> => {
    return await api.post<Product>(`/products/${id}/stock`, { quantity, newPrice });
  },

  /**
   * Mahsulotni o'chirish (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    return await api.delete<void>(`/products/${id}`);
  }
};

