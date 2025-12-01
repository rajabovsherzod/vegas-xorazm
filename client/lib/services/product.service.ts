import { api } from "@/lib/api/api-client";
export interface Product {
  id: number;
  name: string;
  barcode: string | null;
  categoryId: number | null;
  price: number;
  originalPrice: number | null;
  currency: 'UZS' | 'USD';
  stock: number;
  unit: string;
  image: string | null;
  isActive: boolean;
}

export interface CreateProductData {
  name: string;
  barcode?: string;
  categoryId?: number;
  price: number;
  originalPrice?: number;
  currency: 'UZS' | 'USD';
  stock: number;
  unit: string;
}

export const productService = {
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
    const endpoint = queryString ? `/products?${queryString}` : "/products";
    
    return await api.get(endpoint);
  },
  create: async (data: CreateProductData) => {
    return await api.post("/products", data);
  },
  update: async (id: number, data: Partial<CreateProductData>) => {
    return await api.patch(`/products/${id}`, data);
  },
  delete: async (id: number) => {
    return await api.delete(`/products/${id}`);
  }
};

