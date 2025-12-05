import { db } from "@/db";
import { orders, orderItems, products, NewOrder } from "@/db/schema";
import { eq, inArray, sql, desc } from "drizzle-orm";
import ApiError from "@/utils/ApiError";
import logger from "@/utils/logger";
import { getIO } from "@/socket";
import { CreateOrderInput, UpdateOrderStatusInput, UpdateOrderInput } from "./validation";

export const orderService = {
  
  /**
   * 1. GET BY SELLER ID
   */
  getBySellerId: async (sellerId: number) => {
    if (!sellerId) throw new ApiError(400, "Seller ID kiritilmagan");

    return await db.query.orders.findMany({
      where: eq(orders.sellerId, sellerId),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: {
        seller: { columns: { fullName: true, username: true } },
        partner: { columns: { name: true, phone: true } },
        items: { with: { product: true } }
      }
    });
  },

  /**
   * 2. CREATE (BETON NARX VA CHEGIRMA LOGIKASI)
   */
  create: async (userId: number, payload: CreateOrderInput) => {
    return await db.transaction(async (tx) => {
      const currentRate = parseFloat(String(payload.exchangeRate || "1"));
      const productIds = payload.items.map((item) => item.productId);

      if (productIds.length === 0) throw new ApiError(400, "Mahsulotlar tanlanmagan");

      const dbProducts = await tx.query.products.findMany({
        where: inArray(products.id, productIds),
      });

      let totalAmount = 0; // Asl narxlar yig'indisi (Chegirmasiz)
      let itemsTotal = 0;  // Item chegirmalari ayirilgan summa
      const itemsToInsert: any[] = [];
      const changedStocks: { id: number; quantity: number }[] = [];

      for (const item of payload.items) {
        const product = dbProducts.find((p) => p.id === item.productId);
        if (!product || !product.isActive || product.isDeleted) {
          throw new ApiError(400, `Mahsulot xatosi (ID: ${item.productId})`);
        }

        // 1. Stock Tekshirish va Yangilash
        const currentStock = Number(product.stock);
        const requestQty = Number(item.quantity);

        if (currentStock < requestQty) {
          throw new ApiError(409, `Omborda yetarli emas: ${product.name}`);
        }

        await tx.update(products)
          .set({
            stock: String(currentStock - requestQty),
            updatedAt: new Date()
          })
          .where(eq(products.id, product.id));

        changedStocks.push({ id: product.id, quantity: requestQty });

        // 2. Narx Mantiqi (Item Price Logic)
        const originalPrice = Number(product.price); // Katalogdagi asl narx
        
        // Sotiladigan narxni aniqlash:
        // A) Agar frontend 'price' yuborgan bo'lsa (Manual Discount), o'shani olamiz.
        // B) Agar yubormagan bo'lsa, lekin mahsulotda AKSIYA (discountPrice) bo'lsa, o'shani olamiz.
        // C) Bo'lmasa, asl narxni olamiz.
        let soldPrice = item.price !== undefined ? Number(item.price) : originalPrice;

        if (item.price === undefined && Number(product.discountPrice) > 0) {
            soldPrice = Number(product.discountPrice);
        }

        // Valyuta konvertatsiyasi (USD -> UZS)
        if (product.currency === 'USD') {
          soldPrice = soldPrice * currentRate;
          // originalPrice ni ham UZS ga o'giramiz (totalAmount hisobi uchun)
        }
        const originalPriceInUzs = product.currency === 'USD' ? originalPrice * currentRate : originalPrice;

        // Summalarni hisoblash
        const lineTotalOriginal = originalPriceInUzs * requestQty;
        const lineTotalSold = soldPrice * requestQty;

        totalAmount += lineTotalOriginal;
        itemsTotal += lineTotalSold;

        itemsToInsert.push({
          productId: product.id,
          quantity: String(requestQty),
          price: String(soldPrice), // Sotilgan narx
          originalPrice: String(originalPriceInUzs), // Asl narx (Statistika va Vozvrat uchun)
          totalPrice: String(lineTotalSold),

          // 🔥 YANGI: Item Discount Tarixi
          manualDiscountValue: String(item.manualDiscountValue || 0),
          manualDiscountType: item.manualDiscountType || 'fixed',
        });
      }

      // 3. Umumiy Chegirma Mantiqi (Global Discount Logic)
      const discountValue = Number(payload.discountValue || 0);
      const discountType = payload.discountType || 'fixed';
      
      let globalDiscountAmount = 0;

      if (discountValue > 0) {
        if (discountType === 'percent') {
          // Foiz bo'lsa: Itemlar yig'indisidan foiz olinadi
          globalDiscountAmount = itemsTotal * (discountValue / 100);
        } else {
          // Fixed bo'lsa: Aniq summa
          globalDiscountAmount = discountValue;
        }
      }

      // Final Summa
      const finalAmount = itemsTotal - globalDiscountAmount;

      if (finalAmount < 0) throw new ApiError(400, "Chegirma summasi umumiy summadan oshib ketdi");

      // 4. Order Yaratish
      const newOrderData: NewOrder = {
        sellerId: userId,
        partnerId: payload.partnerId ?? null,
        customerName: payload.customerName || null,
        
        totalAmount: String(totalAmount),       // Chegirmasiz to'liq summa
        discountAmount: String(globalDiscountAmount), // Hisoblangan umumiy chegirma
        finalAmount: String(finalAmount),       // To'lanadigan summa
        
        // 🔥 Chegirma "Retsepti"
        discountValue: String(discountValue),   
        discountType: discountType,
        
        currency: 'UZS',
        exchangeRate: String(currentRate),
        status: 'draft',
        type: payload.type as any,
        paymentMethod: payload.paymentMethod as any,
      };

      const [newOrder] = await tx.insert(orders).values(newOrderData).returning();

      // Items ulash
      if (itemsToInsert.length > 0) {
        await tx.insert(orderItems).values(
          itemsToInsert.map(item => ({ ...item, orderId: newOrder.id }))
        );
      }

      // Socket Notification
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
      } catch (error) { logger.error("Socket error:", error); }

      return newOrder;
    });
  },

  /**
   * 3. GET ALL
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
   */
  getById: async (orderId: number) => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        seller: { columns: { id: true, fullName: true, username: true } },
        partner: { columns: { id: true, name: true, phone: true } },
        items: { with: { product: true } }
      }
    });
    if (!order) throw new ApiError(404, "Buyurtma topilmadi");
    return order;
  },

  /**
   * 5. UPDATE STATUS
   */
  updateStatus: async (orderId: number, adminId: number, payload: UpdateOrderStatusInput) => {
    return await db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: { items: true }
      });

      if (!order) throw new ApiError(404, "Buyurtma topilmadi");
      
      // Status validatsiyasi
      if (order.status !== 'draft' && payload.status === 'cancelled') {
         throw new ApiError(400, "Faqat kutilayotgan buyurtmalarni bekor qilish mumkin");
      }

      // Bekor qilish logikasi (Stock qaytarish)
      if (payload.status === 'cancelled') {
        const restoredStocks: { id: number; quantity: number }[] = [];
        for (const item of order.items) {
          await tx.execute(
            sql`UPDATE products SET stock = stock + ${item.quantity} WHERE id = ${item.productId}`
          );
          restoredStocks.push({ id: item.productId, quantity: Number(item.quantity) });
        }
        try {
          const io = getIO();
          io.emit("stock_update", { action: "add", items: restoredStocks });
          io.emit("order_status_change", { id: orderId, status: "cancelled" });
        } catch (e) { logger.error(e); }
      }

      const [updatedOrder] = await tx.update(orders)
        .set({
          status: payload.status as any,
          cashierId: adminId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      if (payload.status === 'completed') {
        try { getIO().emit("order_status_change", { id: orderId, status: "completed" }); } 
        catch (e) { logger.error(e); }
      }

      return updatedOrder;
    });
  },

  /**
   * 6. UPDATE ORDER (EDIT) - (BETON YANGILASH)
   */
  update: async (orderId: number, userId: number, userRole: string, payload: UpdateOrderInput) => {
    return await db.transaction(async (tx) => {
      // 1. Orderni tekshirish
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: { items: true }
      });

      if (!order) throw new ApiError(404, "Buyurtma topilmadi");
      if (order.status !== 'draft') throw new ApiError(400, "Faqat kutilayotgan orderlar tahrirlanadi");
      if (userRole === 'seller' && order.sellerId !== userId) throw new ApiError(403, "Ruxsat yo'q");

      const stockChanges: { id: number; quantity: number; action: 'add' | 'subtract' }[] = [];
      const oldItemsMap = new Map(order.items.map(item => [item.productId, Number(item.quantity)]));
      const newItemsMap = new Map(payload.items.map(item => [item.productId, Number(item.quantity)]));

      // 2. STOCK O'ZGARISHLARINI HISOBLASH
      const allProductIds = new Set([...oldItemsMap.keys(), ...newItemsMap.keys()]);

      for (const productId of allProductIds) {
        const oldQty = oldItemsMap.get(productId) || 0;
        const newQty = newItemsMap.get(productId) || 0;
        const diff = newQty - oldQty;

        if (diff === 0) continue; // O'zgarish yo'q

        if (diff > 0) { // Mahsulot soni oshdi (ombordan yechish kerak)
          await tx.execute(sql`UPDATE products SET stock = stock - ${diff} WHERE id = ${productId}`);
          stockChanges.push({ id: productId, quantity: diff, action: 'subtract' });
        } else { // Mahsulot soni kamaydi (omborga qaytarish kerak)
          const returnQty = Math.abs(diff);
          await tx.execute(sql`UPDATE products SET stock = stock + ${returnQty} WHERE id = ${productId}`);
          stockChanges.push({ id: productId, quantity: returnQty, action: 'add' });
        }
      }

      // Eski itemsni o'chirish
      await tx.delete(orderItems).where(eq(orderItems.orderId, orderId));

      // 3. YANGI ITEMLARNI QO'SHISH (Create dagi mantiq bilan bir xil)
      const newItems = payload.items;
      const newProductIds = newItems.map(item => item.productId);
      const dbProducts = await tx.query.products.findMany({ where: inArray(products.id, newProductIds) });

      let totalAmount = 0;
      let itemsTotal = 0;
      const itemsToInsert: any[] = [];
      const currentRate = parseFloat(String(payload.exchangeRate || order.exchangeRate || "1"));

      for (const newItem of newItems) {
        const product = dbProducts.find(p => p.id === newItem.productId);
        if (!product || !product.isActive) throw new ApiError(400, "Xato mahsulot");

        // Yangi stock tekshiruvi
        const currentStock = Number(product.stock); 
        const requestQty = Number(newItem.quantity);

        // Stock tekshiruvi yuqorida, diff orqali qilingan.
        // Bu yerda qayta tekshirish va o'zgartirish shart emas.
        const productStock = (await tx.query.products.findFirst({ where: eq(products.id, product.id) }))?.stock || '0';
        if (Number(productStock) < 0) {
            throw new ApiError(409, `Omborda yetarli emas: ${product.name}`);
        }

        // Narx Mantiqi
        const originalPrice = Number(product.price);
        let soldPrice = newItem.price !== undefined ? Number(newItem.price) : originalPrice;

        if (newItem.price === undefined && Number(product.discountPrice) > 0) {
            soldPrice = Number(product.discountPrice);
        }

        if (product.currency === 'USD') {
          soldPrice = soldPrice * currentRate;
        }
        const originalPriceInUzs = product.currency === 'USD' ? originalPrice * currentRate : originalPrice;

        const lineTotalOriginal = originalPriceInUzs * requestQty;
        const lineTotalSold = soldPrice * requestQty;

        totalAmount += lineTotalOriginal;
        itemsTotal += lineTotalSold;

        itemsToInsert.push({
          orderId: orderId,
          productId: product.id,
          quantity: String(requestQty),
          price: String(soldPrice),
          originalPrice: String(originalPriceInUzs),
          totalPrice: String(lineTotalSold),
          
          // 🔥 YANGI: Update paytida ham tarix saqlanadi
          manualDiscountValue: String(newItem.manualDiscountValue || 0),
          manualDiscountType: newItem.manualDiscountType || 'fixed',
        });
      }

      if (itemsToInsert.length > 0) {
        await tx.insert(orderItems).values(itemsToInsert);
      }

      // UMUMIY CHEGIRMA (Recalculate)
      const discountValue = Number(payload.discountValue || 0);
      const discountType = payload.discountType || 'fixed';
      
      let globalDiscountAmount = 0;
      if (discountValue > 0) {
        if (discountType === 'percent') {
          globalDiscountAmount = itemsTotal * (discountValue / 100);
        } else {
          globalDiscountAmount = discountValue;
        }
      }
      
      // Frontenddan discountAmount kelsa ham, biz backend hisobiga ustunlik beramiz yoki solishtiramiz.
      // Beton tizimda backend hisoblagani ma'qul.
      
      const finalAmount = itemsTotal - globalDiscountAmount;
      if (finalAmount < 0) throw new ApiError(400, "Chegirma xato");

      const [updatedOrder] = await tx.update(orders)
        .set({
          customerName: payload.customerName ?? order.customerName,
          paymentMethod: (payload.paymentMethod ?? order.paymentMethod) as any,
          type: (payload.type ?? order.type) as any,
          exchangeRate: String(currentRate),
          
          totalAmount: String(totalAmount),
          discountAmount: String(globalDiscountAmount),
          finalAmount: String(finalAmount),
          
          // 🔥 Chegirma "Retsepti"ni yangilash
          discountValue: String(discountValue),
          discountType: discountType,
          
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      try {
        const io = getIO();
        io.to("admin_room").emit("order_updated", { id: orderId, updatedBy: userId, totalAmount: updatedOrder.totalAmount });
        
        // TODO: Bu xabar keraksiz toastlarga sabab bo'lmoqda. Vaqtincha o'chirildi.
        // if (stockChanges.length > 0) {
        //   io.to("admin_room").emit("stock_update", { action: "refresh", items: stockChanges });
        // }
      } catch (e) { logger.error(e); }

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