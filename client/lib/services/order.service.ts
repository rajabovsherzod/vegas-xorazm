import { api } from "@/lib/api/api-client";
import type { Order, CreateOrderPayload, UpdateOrderStatusPayload, OrderStatus } from "@/types/api";

// Re-export types for backward compatibility
export type { Order, CreateOrderPayload, OrderStatus };
export type { OrderItem } from "@/types/api";


export interface RefundPayload {
  items: { 
    productId: number; 
    quantity: number 
  }[];
  reason?: string;
}
/**
 * Order Service
 * 
 * Buyurtmalar bilan ishlash uchun API metodlari
 */
export const orderService = {
  /**
   * Barcha buyurtmalarni olish (Admin/Owner)
   */
  getAll: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>("/orders");
    return Array.isArray(res) ? res : [];
  },

  /**
   * Yangi buyurtma yaratish (Seller)
   */
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    return await api.post<Order>("/orders", payload);
  },

  /**
   * Buyurtma statusini o'zgartirish (Admin/Owner)
   */
  updateStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    const payload: UpdateOrderStatusPayload = { status };
    return await api.patch<Order>(`/orders/${orderId}/status`, payload);
  },

  /**
   * Bitta buyurtmani olish (ID bo'yicha)
   */
  getById: async (orderId: number): Promise<Order> => {
    return await api.get<Order>(`/orders/${orderId}`);
  },

  /**
   * Buyurtmani tahrir qilish (faqat draft status)
   */
  update: async (orderId: number, payload: CreateOrderPayload): Promise<Order> => {
    return await api.patch<Order>(`/orders/${orderId}`, payload);
  },

  /**
   * Buyurtma cheki chiqarilganligini belgilash
   */
  markAsPrinted: async (orderId: number): Promise<Order> => {
    return await api.patch<Order>(`/orders/${orderId}/printed`, {});
  },

  refund: async (orderId: number, payload: RefundPayload): Promise<any> => {
    const data = await api.post<any>(`/orders/${orderId}/refund`, payload);
    return data;
  },
};
