import { api } from "@/lib/api/api-client";

export interface OrderItem {
  productId: number;
  quantity: string;
}

export interface CreateOrderPayload {
  partnerId?: number;
  customerName?: string;
  type: "retail" | "wholesale";
  paymentMethod: "cash" | "card" | "transfer" | "debt";
  exchangeRate: string;
  items: OrderItem[];
}

export interface Order {
  id: number;
  sellerId: number;
  partnerId?: number;
  customerName?: string;
  totalAmount: string;
  finalAmount: string;
  currency: string;
  exchangeRate: string;
  status: "draft" | "completed" | "cancelled";
  type: "retail" | "wholesale";
  paymentMethod: "cash" | "card" | "transfer" | "debt";
  createdAt: string;
  updatedAt: string;
  seller?: {
    fullName: string;
    username: string;
  };
  partner?: {
    name: string;
    phone: string;
  };
  items?: any[];
}

export const orderService = {
  // Barcha buyurtmalar (Admin/Owner)
  getAll: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>("/orders");
    // api.get allaqachon data ni qaytaradi, shuning uchun res.data emas, res ni qaytaramiz
    return Array.isArray(res) ? res : [];
  },

  // Yangi buyurtma yaratish (Seller)
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await api.post<Order>("/orders", payload);
    return res;
  },

  // Status o'zgartirish (Admin/Owner)
  updateStatus: async (orderId: number, status: "completed" | "cancelled"): Promise<Order> => {
    const res = await api.patch<Order>(`/orders/${orderId}/status`, { status });
    return res;
  },
};
