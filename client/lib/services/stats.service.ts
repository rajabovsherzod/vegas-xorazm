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
  categorySales: Array<{
    categoryId: number | null;
    categoryName: string | null;
    orderCount: number;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

export interface OwnerStats {
  todaySales: {
    amount: number;
    count: number;
  };
  weeklySales: {
    amount: number;
    count: number;
  };
  monthlySales: {
    amount: number;
    count: number;
  };
  totalOrders: number;
  inventoryValue: number;
  staffCount: number;
  dailySalesChart: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  topProducts: Array<{
    productId: number;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  categorySales: Array<{
    categoryId: number | null;
    categoryName: string | null;
    orderCount: number;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topSellers: Array<{
    sellerId: number;
    sellerName: string;
    orderCount: number;
    totalRevenue: number;
  }>;
}

export const statsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return await api.get("/stats/dashboard");
  },
  
  getOwnerStats: async (): Promise<OwnerStats> => {
    return await api.get("/stats/owner");
  }
};
  
  getOwnerStats: async (): Promise<OwnerStats> => {
    return await api.get("/stats/owner");
  }
};

  
  getOwnerStats: async (): Promise<OwnerStats> => {
    return await api.get("/stats/owner");
  }
};
  
  getOwnerStats: async (): Promise<OwnerStats> => {
    return await api.get("/stats/owner");
  }
};
