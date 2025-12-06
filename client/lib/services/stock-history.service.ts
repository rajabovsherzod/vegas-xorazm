import { api } from "@/lib/api/api-client";
import { Product } from "@/types/api";

export interface StockHistory {
  id: number;
  productId: number;
  product: Product;
  quantity: string;
  oldStock: string | null;
  newStock: string | null;
  newPrice: string | null;
  
  // 🔥 O'ZGARISH SHU YERDA:
  // Oldin: addedBy: number | null;
  // Hozir (Beton):
  addedBy: {
    id: number;
    fullName: string;
    username: string;
    role?: string;
  } | null;

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





