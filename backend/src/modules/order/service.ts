import { db } from "@/db";
import { orders, orderItems, products, NewOrder } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import ApiError from "@/utils/ApiError";
import logger from "@/utils/logger";
import { CreateOrderInput, UpdateOrderStatusInput, UpdateOrderInput } from "./validation";
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

  // 2.5. GET BY ID (Tahrir uchun)
  getById: async (orderId: number) => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        seller: { columns: { id: true, fullName: true, username: true } },
        partner: { columns: { id: true, name: true, phone: true } },
        items: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                price: true,
                currency: true,
                stock: true,
                unit: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new ApiError(404, "Buyurtma topilmadi");
    }

    return order;
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
  },

  // 4. UPDATE ORDER (Tahrir qilish - Murakkab Stock Logika)
  update: async (orderId: number, userId: number, userRole: string, payload: UpdateOrderInput) => {
    return await db.transaction(async (tx) => {
      // 1. Orderni topish
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: { items: true }
      });

      if (!order) throw new ApiError(404, "Buyurtma topilmadi");
      if (order.status !== 'draft') throw new ApiError(400, "Faqat kutilayotgan orderlarni tahrir qilish mumkin");

      // 2. Ruxsat tekshirish (Seller faqat o'ziniki)
      if (userRole === 'seller' && order.sellerId !== userId) {
        throw new ApiError(403, "Bu buyurtma sizga tegishli emas");
      }

      // 3. STOCK HISOBLASH (Eng muhim qism!)
      const oldItems = order.items; // Eski mahsulotlar
      const newItems = payload.items; // Yangi mahsulotlar

      // Yangi mahsulotlar ID larini olamiz
      const newProductIds = newItems.map(item => item.productId);
      const dbProducts = await tx.query.products.findMany({
        where: inArray(products.id, newProductIds),
      });

      // Stock o'zgarishlarini kuzatish
      const stockChanges: { id: number; quantity: number; action: 'add' | 'subtract' }[] = [];

      // 3.1. ESKI ITEMLARNI QAYTARISH (Omborga)
      for (const oldItem of oldItems) {
        await tx.execute(
          sql`UPDATE products SET stock = stock + ${oldItem.quantity} WHERE id = ${oldItem.productId}`
        );
        stockChanges.push({
          id: oldItem.productId,
          quantity: Number(oldItem.quantity),
          action: 'add'
        });
      }

      // 3.2. YANGI ITEMLARNI AYIRISH (Ombordan)
      let totalAmount = 0;
      const itemsToInsert: any[] = [];
      const currentRate = parseFloat(payload.exchangeRate || order.exchangeRate || "1");

      for (const newItem of newItems) {
        const product = dbProducts.find(p => p.id === newItem.productId);

        if (!product || !product.isActive || product.isDeleted) {
          throw new ApiError(400, `Mahsulot topilmadi yoki faol emas (ID: ${newItem.productId})`);
        }

        // Hozirgi stock (eski itemlar qaytarilgandan keyin)
        const currentStockResult = await tx.query.products.findFirst({
          where: eq(products.id, product.id),
          columns: { stock: true }
        });

        const currentStock = Number(currentStockResult?.stock || 0);
        const requestQty = Number(newItem.quantity);

        if (currentStock < requestQty) {
          throw new ApiError(409, `Omborda yetarli mahsulot yo'q: ${product.name} (Mavjud: ${currentStock}, Kerak: ${requestQty})`);
        }

        // Ombordan ayiramiz
        await tx.update(products)
          .set({
            stock: String(currentStock - requestQty),
            updatedAt: new Date()
          })
          .where(eq(products.id, product.id));

        stockChanges.push({
          id: product.id,
          quantity: requestQty,
          action: 'subtract'
        });

        // Narxni hisoblash
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

      // 4. ESKI ORDER_ITEMS NI O'CHIRISH
      await tx.delete(orderItems).where(eq(orderItems.orderId, orderId));

      // 5. YANGI ORDER_ITEMS NI KIRITISH
      const itemsWithOrderId = itemsToInsert.map(item => ({
        ...item,
        orderId: orderId
      }));

      if (itemsWithOrderId.length > 0) {
        await tx.insert(orderItems).values(itemsWithOrderId);
      }

      // 6. ORDERNI YANGILASH
      const [updatedOrder] = await tx.update(orders)
        .set({
          customerName: payload.customerName ?? order.customerName,
          paymentMethod: (payload.paymentMethod ?? order.paymentMethod) as "cash" | "card" | "transfer" | "debt",
          type: (payload.type ?? order.type) as "retail" | "wholesale",
          exchangeRate: String(currentRate),
          totalAmount: String(totalAmount),
          finalAmount: String(totalAmount),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      logger.info(`Order tahrir qilindi. ID: ${orderId}, User: ${userId}`);

      // 7. SOCKET NOTIFICATION
      try {
        const io = getIO();

        // Adminga xabar
        io.to("admin_room").emit("order_updated", {
          id: orderId,
          updatedBy: userId,
          totalAmount: updatedOrder.totalAmount,
        });

        // Omborni yangilash (Real-time)
        io.emit("stock_update", {
          action: "refresh", // Butun omborni yangilash
          items: stockChanges
        });

      } catch (error) {
        logger.error("Socket emit error:", error);
      }

      return updatedOrder;
    });
  },

  // 5. MARK AS PRINTED
  markAsPrinted: async (id: number) => {
    const [updatedOrder] = await db
      .update(orders)
      .set({ isPrinted: true })
      .where(eq(orders.id, id))
      .returning();

    if (!updatedOrder) {
      throw new ApiError(404, "Buyurtma topilmadi");
    }

    return updatedOrder;
  }
};