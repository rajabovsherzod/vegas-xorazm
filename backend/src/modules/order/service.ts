import { db } from "@/db";
import { orders, orderItems, products, NewOrder } from "@/db/schema"; 
import { eq, inArray, sql } from "drizzle-orm";
import ApiError from "@/utils/ApiError";
import logger from "@/utils/logger";
import { CreateOrderInput, UpdateOrderStatusInput } from "./validation";
import { getIO } from "@/socket"; // <-- YANGI IMPORT (Socket olish uchun)

export const orderService = {
  // 1. CREATE DRAFT
  create: async (userId: number, payload: CreateOrderInput) => {
    return await db.transaction(async (tx) => {
      const currentRate = parseFloat(payload.exchangeRate || "1");

      const productIds = payload.items.map((item) => item.productId);
      if (productIds.length === 0) throw new ApiError(400, "Mahsulotlar tanlanmagan");

      const dbProducts = await tx.query.products.findMany({
        where: inArray(products.id, productIds),
      });

      let totalAmount = 0;
      const itemsToInsert: any[] = [];
      // Socket uchun o'zgargan mahsulotlarni yig'amiz
      const changedStocks: { id: number; quantity: number }[] = [];

      for (const item of payload.items) {
        const product = dbProducts.find((p) => p.id === item.productId);
        
        if (!product || !product.isActive || product.isDeleted) throw new ApiError(400, "Xato mahsulot");
        
        const currentStock = Number(product.stock);
        const requestQty = Number(item.quantity);
        
        if (currentStock < requestQty) throw new ApiError(409, "Ombor yetarli emas");

        // Ombordan ayiramiz
        await tx.update(products)
          .set({ 
            stock: String(currentStock - requestQty),
            updatedAt: new Date()
          })
          .where(eq(products.id, product.id));

        // Socket ro'yxatiga qo'shamiz
        changedStocks.push({ id: product.id, quantity: requestQty });

        let finalPrice = Number(product.price);
        if (product.currency === 'USD') {
          finalPrice = finalPrice * currentRate;
        }

        const lineTotal = finalPrice * requestQty;
        totalAmount += lineTotal;

        itemsToInsert.push({
          productId: product.id,
          quantity: String(requestQty),
          price: String(finalPrice),
          originalCurrency: product.currency,
          totalPrice: String(lineTotal),
        });
      }

      const newOrderData: NewOrder = {
        sellerId: userId,
        partnerId: payload.partnerId ?? null,
        customerName: payload.customerName || null,
        totalAmount: String(totalAmount),
        finalAmount: String(totalAmount),
        currency: 'UZS', 
        exchangeRate: String(currentRate),
        status: 'draft',
        type: payload.type as "retail" | "wholesale",
        paymentMethod: payload.paymentMethod as "cash" | "card" | "transfer" | "debt",
      };

      const [newOrder] = await tx.insert(orders).values(newOrderData).returning();

      const itemsWithOrderId = itemsToInsert.map(item => ({
        ...item,
        orderId: newOrder.id
      }));
      
      if (itemsWithOrderId.length > 0) {
        await tx.insert(orderItems).values(itemsWithOrderId);
      }

      logger.info(`Draft yaratildi. ID: ${newOrder.id}`);

      // 🔥 SOCKET SIGNAL (REAL TIME)
      try {
        const io = getIO();
        
        // 1. Adminga xabar: "Yangi zakaz tushdi!"
        io.to("admin_room").emit("new_order", {
          id: newOrder.id,
          sellerId: userId,
          customerName: newOrder.customerName,
          totalAmount: newOrder.totalAmount,
          createdAt: newOrder.createdAt
        });

        // 2. Hamma Sellerlarga: "Ombor yangilandi!"
        // Frontga qaysi IDlar qanchaga kamayganini yuboramiz
        io.emit("stock_update", {
            action: "subtract",
            items: changedStocks
        });

      } catch (error) {
        logger.error("Socket emit error:", error);
      }

      return newOrder;
    });
  },

  // 2. GET ALL (O'zgarishsiz)
  getAll: async () => {
    const data = await db.query.orders.findMany({
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: {
        seller: { columns: { fullName: true, username: true } },
        partner: { columns: { name: true, phone: true } },
        items: { with: { product: true } } 
      }
    });
    return data;
  },

  // 3. UPDATE STATUS
  updateStatus: async (orderId: number, adminId: number, payload: UpdateOrderStatusInput) => {
    return await db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: { items: true }
      });

      if (!order) throw new ApiError(404, "Buyurtma topilmadi");
      if (order.status !== 'draft') throw new ApiError(400, "Buyurtma allaqachon yopilgan");

      // Cancel bo'lsa omborni qaytarish (Socket xabari bilan)
      if (payload.status === 'cancelled') {
        const restoredStocks: { id: number; quantity: number }[] = [];

        for (const item of order.items) {
          await tx.execute(
            sql`UPDATE products SET stock = stock + ${item.quantity} WHERE id = ${item.productId}`
          );
          restoredStocks.push({ id: item.productId, quantity: Number(item.quantity) });
        }
        logger.info(`Order bekor qilindi, mahsulot qaytdi. ID: ${orderId}`);

        // 🔥 SOCKET: Omborni qayta tiklash haqida xabar
        try {
            const io = getIO();
            io.emit("stock_update", {
                action: "add",
                items: restoredStocks
            });
            io.emit("order_status_change", { id: orderId, status: "cancelled" });
        } catch (e) { console.error(e); }
      }

      const [updatedOrder] = await tx.update(orders)
        .set({
          status: payload.status,
          cashierId: adminId, 
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      // 🔥 SOCKET: Agar Completed bo'lsa, shunchaki status o'zgardi deb xabar beramiz
      if (payload.status === 'completed') {
          try {
              getIO().emit("order_status_change", { id: orderId, status: "completed" });
          } catch (e) { console.error(e); }
      }

      return updatedOrder;
    });
  }
};