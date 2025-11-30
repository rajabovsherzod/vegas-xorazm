import { db } from "@/db";
// NewOrder ni schema dan import qildik
import { orders, orderItems, products, NewOrder } from "@/db/schema"; 
import { eq, inArray, sql } from "drizzle-orm";
import ApiError from "@/utils/ApiError";
import logger from "@/utils/logger";
import { CreateOrderInput, UpdateOrderStatusInput } from "./validation";

export const orderService = {
  // 1. CREATE DRAFT
  create: async (userId: number, payload: CreateOrderInput) => {
    return await db.transaction(async (tx) => {
      // Kursni raqamga o'giramiz (Frontenddan string keladi)
      const currentRate = parseFloat(payload.exchangeRate || "1");

      const productIds = payload.items.map((item) => item.productId);
      if (productIds.length === 0) throw new ApiError(400, "Mahsulotlar tanlanmagan");

      const dbProducts = await tx.query.products.findMany({
        where: inArray(products.id, productIds),
      });

      let totalAmount = 0;
      const itemsToInsert: any[] = [];

      for (const item of payload.items) {
        const product = dbProducts.find((p) => p.id === item.productId);
        
        // ... (Mahsulot borligi va Ombor tekshiruvi o'zgarishsiz qoladi) ...
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

        // 🔥 NARXNI HISOBLASH (LOGIKA O'ZGARDI)
        let finalPrice = Number(product.price);

        // Agar mahsulot USD da bo'lsa, uni So'mga aylantiramiz
        if (product.currency === 'USD') {
          finalPrice = finalPrice * currentRate;
        }
        // Agar UZS bo'lsa, o'z holicha qoladi

        const lineTotal = finalPrice * requestQty;
        totalAmount += lineTotal;

        itemsToInsert.push({
          productId: product.id,
          quantity: String(requestQty),
          price: String(finalPrice), // Chekga SO'MDAGI narx yoziladi
          originalCurrency: product.currency, // Asl valyutasi saqlanadi (tarix uchun)
          totalPrice: String(lineTotal),
        });
      }

      const newOrderData: NewOrder = {
        sellerId: userId,
        partnerId: payload.partnerId ?? null,
        customerName: payload.customerName || null,
        
        totalAmount: String(totalAmount),
        finalAmount: String(totalAmount),
        
        currency: 'UZS', // Chek har doim so'mda yopiladi (Frontend shuni xohlagan)
        exchangeRate: String(currentRate), // O'sha paytdagi kursni muhrlaymiz
        
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

      logger.info(`Draft yaratildi. ID: ${newOrder.id}, Summa: ${totalAmount} UZS (Kurs: ${currentRate})`);
      return newOrder;
    });
  },

  // 2. GET ALL
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

      // Cancel bo'lsa omborni qaytarish
      if (payload.status === 'cancelled') {
        for (const item of order.items) {
          await tx.execute(
            sql`UPDATE products SET stock = stock + ${item.quantity} WHERE id = ${item.productId}`
          );
        }
        logger.info(`Order bekor qilindi, mahsulot qaytdi. ID: ${orderId}`);
      }

      const [updatedOrder] = await tx.update(orders)
        .set({
          status: payload.status,
          cashierId: adminId, 
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      return updatedOrder;
    });
  }
};