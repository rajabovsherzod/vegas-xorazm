import { api } from "@/lib/api/api-client";

export interface DashboardStats {
  todaySales: {
    amount: number;
    count: number;
  };
  pendingOrders: number;
  completedOrders: number;
  lowStockProducts: number;
  recentOrders: any[];
}

export const statsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return await api.get("/stats/dashboard");
  }
};
