import { api } from "@/lib/api/api-client";
import { PaginatedResponse, Product } from "@/types/api";

export interface StockHistory {
  id: number;
  productId: number;
  product: Product;
  quantity: string;
  oldStock: string | null;
  newStock: string | null;
  newPrice: string | null;
  addedBy: number | null;
  admin: { fullName: string; username: string } | null;
  note: string | null;
  createdAt: string;
}

export const stockHistoryService = {
  getAll: async (params: any = {}): Promise<{ history: StockHistory[], pagination: any }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
    });
    
    return await api.get(`/stock-history?${searchParams.toString()}`);
  }
};






import { PaginatedResponse, Product } from "@/types/api";

export interface StockHistory {
  id: number;
  productId: number;
  product: Product;
  quantity: string;
  oldStock: string | null;
  newStock: string | null;
  newPrice: string | null;
  addedBy: number | null;
  admin: { fullName: string; username: string } | null;
  note: string | null;
  createdAt: string;
}

export const stockHistoryService = {
  getAll: async (params: any = {}): Promise<{ history: StockHistory[], pagination: any }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
    });
    
    return await api.get(`/stock-history?${searchParams.toString()}`);
  }
};







import { PaginatedResponse, Product } from "@/types/api";

export interface StockHistory {
  id: number;
  productId: number;
  product: Product;
  quantity: string;
  oldStock: string | null;
  newStock: string | null;
  newPrice: string | null;
  addedBy: number | null;
  admin: { fullName: string; username: string } | null;
  note: string | null;
  createdAt: string;
}

export const stockHistoryService = {
  getAll: async (params: any = {}): Promise<{ history: StockHistory[], pagination: any }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
    });
    
    return await api.get(`/stock-history?${searchParams.toString()}`);
  }
};






import { PaginatedResponse, Product } from "@/types/api";

export interface StockHistory {
  id: number;
  productId: number;
  product: Product;
  quantity: string;
  oldStock: string | null;
  newStock: string | null;
  newPrice: string | null;
  addedBy: number | null;
  admin: { fullName: string; username: string } | null;
  note: string | null;
  createdAt: string;
}

export const stockHistoryService = {
  getAll: async (params: any = {}): Promise<{ history: StockHistory[], pagination: any }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
    });
    
    return await api.get(`/stock-history?${searchParams.toString()}`);
  }
};







