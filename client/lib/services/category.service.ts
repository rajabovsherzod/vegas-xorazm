import { api } from "@/lib/api/api-client";

export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export const categoryService = {
  getAll: async (query?: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/categories?${queryString}` : "/categories";

    return await api.get<Category[]>(endpoint);
  },
  create: async (data: CreateCategoryData) => {
    return await api.post("/categories", data);
  },
  update: async (id: number, data: Partial<CreateCategoryData>) => {
    return await api.patch(`/categories/${id}`, data);
  },
  delete: async (id: number) => {
    return await api.delete(`/categories/${id}`);
  }
};

