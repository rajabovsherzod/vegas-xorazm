import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { and, eq, gte, sql, desc } from "drizzle-orm";

export const statsService = {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Bugungi savdo (Completed)
    const [salesResult] = await db
      .select({
        totalAmount: sql<string>`sum(${orders.finalAmount})`,
        count: sql<number>`count(*)`
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'completed'),
          gte(orders.createdAt, today)
        )
      );

    // 2. Kutilayotgan (Draft/Pending)
    const [pendingResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, 'draft'));

    // 3. Tugallangan (Jami)
    const [completedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, 'completed'));

    // 4. Kam qolgan tovar (Low Stock)
    const [lowStockResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(
        and(
            eq(products.isActive, true),
            eq(products.isDeleted, false),
            sql`${products.stock} <= 10` 
        )
      );

    // 5. So'nggi buyurtmalar
    const recentOrders = await db.query.orders.findMany({
        limit: 6,
        orderBy: [desc(orders.createdAt)],
        with: {
            seller: true,
        }
    });

    return {
      todaySales: {
        amount: Number(salesResult?.totalAmount || 0),
        count: Number(salesResult?.count || 0)
      },
      pendingOrders: Number(pendingResult?.count || 0),
      completedOrders: Number(completedResult?.count || 0),
      lowStockProducts: Number(lowStockResult?.count || 0),
      recentOrders
    };
  }
};
