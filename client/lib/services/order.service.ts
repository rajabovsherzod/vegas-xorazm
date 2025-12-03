import { api } from "@/lib/api/api-client";
import type { Order, CreateOrderPayload, UpdateOrderStatusPayload, OrderStatus } from "@/types/api";

// Re-export types for backward compatibility
export type { Order, CreateOrderPayload, OrderStatus };
export type { OrderItem } from "@/types/api";

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
   * Buyurtma cheki chiqarilganligini belgilash
   */
  markAsPrinted: async (orderId: number): Promise<Order> => {
    return await api.patch<Order>(`/orders/${orderId}/printed`, {});
  },
};
