import { db } from "@/db";
import { orders, orderItems, products, NewOrder } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import ApiError from "@/utils/ApiError";
import logger from "@/utils/logger";
import { getIO } from "@/socket";
import { CreateOrderInput, UpdateOrderStatusInput, UpdateOrderInput } from "./validation";

export const orderService = {
  
  /**
   * 1. GET BY SELLER ID
   * Sellerga tegishli barcha buyurtmalarni olish
   */
  getBySellerId: async (sellerId: number) => {
    if (!sellerId) {
      throw new ApiError(400, "Seller ID kiritilmagan");
    }

    // So'rovni amalga oshiramiz
    const sellerOrders = await db.query.orders.findMany({
      where: eq(orders.sellerId, sellerId),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: {
        seller: { columns: { fullName: true, username: true } },
        partner: { columns: { name: true, phone: true } },
        items: { with: { product: true } }
      }
    });

    return sellerOrders;
  },

  /**
   * 2. CREATE DRAFT
   * Yangi buyurtma yaratish (Transaction bilan)
   */
  create: async (userId: number, payload: CreateOrderInput) => {
    return await db.transaction(async (tx) => {
      // 1. Valyuta kursi va mahsulotlarni tekshirish
      const currentRate = parseFloat(payload.exchangeRate || "1");
      const productIds = payload.items.map((item) => item.productId);

      if (productIds.length === 0) throw new ApiError(400, "Mahsulotlar tanlanmagan");

      const dbProducts = await tx.query.products.findMany({
        where: inArray(products.id, productIds),
      });

      let totalAmount = 0;
      const itemsToInsert: any[] = [];
      const changedStocks: { id: number; quantity: number }[] = [];

      // 2. Har bir itemni hisoblash va omborni yangilash
      for (const item of payload.items) {
        const product = dbProducts.find((p) => p.id === item.productId);

        // Mahsulot validatsiyasi
        if (!product || !product.isActive || product.isDeleted) {
          throw new ApiError(400, `Mahsulot topilmadi yoki nofaol (ID: ${item.productId})`);
        }

        const currentStock = Number(product.stock);
        const requestQty = Number(item.quantity);

        if (currentStock < requestQty) {
          throw new ApiError(409, `Omborda yetarli emas: ${product.name}`);
        }

        // Ombordan ayiramiz
        await tx.update(products)
          .set({
            stock: String(currentStock - requestQty),
            updatedAt: new Date()
          })
          .where(eq(products.id, product.id));

        changedStocks.push({ id: product.id, quantity: requestQty });

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

      // 3. Buyurtmani bazaga yozish
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

      // 4. Itemlarni ulash
      if (itemsToInsert.length > 0) {
        await tx.insert(orderItems).values(
          itemsToInsert.map(item => ({ ...item, orderId: newOrder.id }))
        );
      }

      // 5. Socket Xabarlarini yuborish
      try {
        const io = getIO();
        io.to("admin_room").emit("new_order", {
          id: newOrder.id,
          sellerId: userId,
          customerName: newOrder.customerName,
          totalAmount: newOrder.totalAmount,
          createdAt: newOrder.createdAt
        });

        io.emit("stock_update", { action: "subtract", items: changedStocks });
      } catch (error) {
        logger.error("Socket notification error:", error);
      }

      return newOrder;
    });
  },

  /**
   * 3. GET ALL
   * Adminlar uchun hamma buyurtmalar
   */
  getAll: async () => {
    return await db.query.orders.findMany({
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: {
        seller: { columns: { fullName: true, username: true } },
        partner: { columns: { name: true, phone: true } },
        items: { with: { product: true } }
      }
    });
  },

  /**
   * 4. GET BY ID
   * Bitta buyurtmani to'liq ma'lumotlari bilan olish
   */
  getById: async (orderId: number) => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        seller: { columns: { id: true, fullName: true, username: true } },
        partner: { columns: { id: true, name: true, phone: true } },
        items: {
          with: {
            product: {
              columns: { id: true, name: true, price: true, currency: true, stock: true, unit: true, isActive: true }
            }
          }
        }
      }
    });

    if (!order) throw new ApiError(404, "Buyurtma topilmadi");
    return order;
  },

  /**
   * 5. UPDATE STATUS
   * Statusni o'zgartirish (Cancelled bo'lsa omborni qaytarish)
   */
  updateStatus: async (orderId: number, adminId: number, payload: UpdateOrderStatusInput) => {
    return await db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: { items: true }
      });

      if (!order) throw new ApiError(404, "Buyurtma topilmadi");
      if (order.status !== 'draft') throw new ApiError(400, "Buyurtma allaqachon yopilgan");

      // Agar 'cancelled' bo'lsa, mahsulotlarni omborga qaytaramiz
      if (payload.status === 'cancelled') {
        const restoredStocks: { id: number; quantity: number }[] = [];

        for (const item of order.items) {
          // Atomic update (Race condition oldini olish uchun SQL ishlatamiz)
          await tx.execute(
            sql`UPDATE products SET stock = stock + ${item.quantity} WHERE id = ${item.productId}`
          );
          restoredStocks.push({ id: item.productId, quantity: Number(item.quantity) });
        }

        // Socket: Mahsulotlar qaytganini bildirish
        try {
          const io = getIO();
          io.emit("stock_update", { action: "add", items: restoredStocks });
          io.emit("order_status_change", { id: orderId, status: "cancelled" });
        } catch (e) { logger.error("Socket error", e); }
      }

      // Statusni yangilash
      const [updatedOrder] = await tx.update(orders)
        .set({
          status: payload.status,
          cashierId: adminId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      if (payload.status === 'completed') {
        try {
          getIO().emit("order_status_change", { id: orderId, status: "completed" });
        } catch (e) { logger.error("Socket error", e); }
      }

      return updatedOrder;
    });
  },

  /**
   * 6. UPDATE ORDER (EDIT)
   * Draft orderni tahrirlash (Eski itemlarni qaytarish -> Yangisini olish)
   */
  update: async (orderId: number, userId: number, userRole: string, payload: UpdateOrderInput) => {
    return await db.transaction(async (tx) => {
      // 1. Orderni tekshirish
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: { items: true }
      });

      if (!order) throw new ApiError(404, "Buyurtma topilmadi");
      if (order.status !== 'draft') throw new ApiError(400, "Faqat kutilayotgan orderlarni tahrir qilish mumkin");
      if (userRole === 'seller' && order.sellerId !== userId) throw new ApiError(403, "Ruxsat yo'q");

      const stockChanges: { id: number; quantity: number; action: 'add' | 'subtract' }[] = [];

      // 2. A) ESKI ITEMLARNI QAYTARISH (Rollback stock)
      for (const oldItem of order.items) {
        await tx.execute(
          sql`UPDATE products SET stock = stock + ${oldItem.quantity} WHERE id = ${oldItem.productId}`
        );
        stockChanges.push({ id: oldItem.productId, quantity: Number(oldItem.quantity), action: 'add' });
      }

      // 2. B) ESKI ITEMLARNI BAZADAN O'CHIRISH
      await tx.delete(orderItems).where(eq(orderItems.orderId, orderId));

      // 3. YANGI ITEMLARNI QAYTA HISOBLASH VA OLISH
      const newItems = payload.items;
      const newProductIds = newItems.map(item => item.productId);
      const dbProducts = await tx.query.products.findMany({ where: inArray(products.id, newProductIds) });

      let totalAmount = 0;
      const itemsToInsert: any[] = [];
      const currentRate = parseFloat(payload.exchangeRate || order.exchangeRate || "1");

      for (const newItem of newItems) {
        const product = dbProducts.find(p => p.id === newItem.productId);
        if (!product || !product.isActive) throw new ApiError(400, `Mahsulot xatosi (ID: ${newItem.productId})`);

        // Hozirgi stockni yangidan olamiz (qaytarilganidan keyin)
        const [freshData] = await tx.select({ stock: products.stock }).from(products).where(eq(products.id, product.id));
        const currentStock = Number(freshData?.stock || 0);
        const requestQty = Number(newItem.quantity);

        if (currentStock < requestQty) {
          throw new ApiError(409, `Yetarli emas: ${product.name}. Mavjud: ${currentStock}`);
        }

        // Ombordan ayiramiz
        await tx.update(products)
          .set({ stock: String(currentStock - requestQty), updatedAt: new Date() })
          .where(eq(products.id, product.id));

        stockChanges.push({ id: product.id, quantity: requestQty, action: 'subtract' });

        // Narx
        let finalPrice = Number(product.price);
        if (product.currency === 'USD') finalPrice *= currentRate;
        const lineTotal = finalPrice * requestQty;
        totalAmount += lineTotal;

        itemsToInsert.push({
          orderId: orderId,
          productId: product.id,
          quantity: String(requestQty),
          price: String(finalPrice),
          originalCurrency: product.currency,
          totalPrice: String(lineTotal),
        });
      }

      // 4. YANGI ITEMLARNI SAQLASH
      if (itemsToInsert.length > 0) {
        await tx.insert(orderItems).values(itemsToInsert);
      }

      // 5. ORDERNI YANGILASH
      const [updatedOrder] = await tx.update(orders)
        .set({
          customerName: payload.customerName ?? order.customerName,
          paymentMethod: (payload.paymentMethod ?? order.paymentMethod) as any,
          type: (payload.type ?? order.type) as any,
          exchangeRate: String(currentRate),
          totalAmount: String(totalAmount),
          finalAmount: String(totalAmount),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      // 6. SOCKET NOTIFICATION
      try {
        const io = getIO();
        io.to("admin_room").emit("order_updated", { id: orderId, updatedBy: userId, totalAmount: updatedOrder.totalAmount });
        io.emit("stock_update", { action: "refresh", items: stockChanges }); // Refresh komandasi
      } catch (e) { logger.error("Socket error", e); }

      return updatedOrder;
    });
  },

  /**
   * 7. MARK AS PRINTED
   */
  markAsPrinted: async (id: number) => {
    const [updatedOrder] = await db.update(orders)
      .set({ isPrinted: true })
      .where(eq(orders.id, id))
      .returning();

    if (!updatedOrder) throw new ApiError(404, "Buyurtma topilmadi");
    return updatedOrder;
  }
};