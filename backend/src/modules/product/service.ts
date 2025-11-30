import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc, ilike, or, sql, SQL, and } from "drizzle-orm";
import ApiError from "@/utils/ApiError";
import logger from "@/utils/logger"; // ✅ Logger import qilindi
import { CreateProductInput, UpdateProductInput } from "./validation";

export const productService = {
  // 1. GET ALL
  getAll: async (query: any) => {
    const { search, limit = "20", page = "1", categoryId, showHidden } = query;
    const limitNum = Number(limit);
    const offsetNum = (Number(page) - 1) * limitNum;

    const conditions: SQL[] = [];

    // Faqat o'chirilmaganlarni ko'rsatamiz
    conditions.push(eq(products.isDeleted, false));

    // Admin bo'lmasa faqat aktivlarni ko'rsatish
    if (showHidden !== 'true') {
        conditions.push(eq(products.isActive, true));
    }

    if (search) {
      conditions.push(or(ilike(products.name, `%${search}%`), ilike(products.barcode, `%${search}%`))!);
    }
    if (categoryId && categoryId !== "all") {
      conditions.push(eq(products.categoryId, Number(categoryId)));
    }

    const data = await db.query.products.findMany({
      where: (table, { and }) => and(...conditions),
      limit: limitNum,
      offset: offsetNum,
      orderBy: desc(products.createdAt),
      with: { category: true },
    });

    const totalRes = await db.select({ count: sql<number>`count(*)` }).from(products).where(and(...conditions));
    const total = Number(totalRes[0].count);

    return {
      products: data,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },

  // 2. CREATE
  create: async (payload: CreateProductInput) => {
    if (payload.barcode) {
      const existing = await db.query.products.findFirst({
        where: eq(products.barcode, payload.barcode),
      });
      if (existing) throw new ApiError(400, "Bu shtrix-kod allaqachon mavjud!");
    }

    const newProduct = await db.insert(products).values({
      ...payload,
      price: String(payload.price),
      stock: String(payload.stock),
      categoryId: payload.categoryId ? Number(payload.categoryId) : null,
    }).returning();

    // ✅ LOG: Yaratilganlik haqida axborot
    logger.info(`Mahsulot yaratildi. ID: ${newProduct[0].id}, Nom: ${newProduct[0].name}, Narx: ${newProduct[0].price}`);

    return newProduct[0];
  },

  // 3. UPDATE
  update: async (id: number, payload: UpdateProductInput) => {
    if (payload.barcode) {
      const existing = await db.query.products.findFirst({
        where: eq(products.barcode, payload.barcode),
      });
      if (existing && existing.id !== id) {
        throw new ApiError(400, "Bu shtrix-kod boshqa mahsulotda mavjud!");
      }
    }

    const updatedProduct = await db
      .update(products)
      .set({
        ...payload,
        price: payload.price ? String(payload.price) : undefined,
        stock: payload.stock ? String(payload.stock) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, id), eq(products.isDeleted, false)))
      .returning();

    if (!updatedProduct.length) throw new ApiError(404, "Mahsulot topilmadi");

    // ✅ LOG: Nimalar o'zgarganini yozib qo'yamiz
    const changedFields = Object.keys(payload).join(", ");
    logger.info(`Mahsulot yangilandi. ID: ${id}, O'zgargan maydonlar: [${changedFields}]`);

    return updatedProduct[0];
  },

  // 4. SOFT DELETE
  delete: async (id: number) => {
    const deleted = await db
      .update(products)
      .set({ 
        isDeleted: true,
        updatedAt: new Date()
      })
      .where(and(eq(products.id, id), eq(products.isDeleted, false)))
      .returning();

    if (!deleted.length) throw new ApiError(404, "Mahsulot topilmadi");

    // ✅ LOG: O'chirish muhim operatsiya, shuning uchun buni qayd etamiz
    // Agar xohlasangiz logger.warn() ishlatish mumkin, lekin info ham bo'laveradi.
    logger.info(`Mahsulot o'chirildi (Soft Delete). ID: ${id}, Nom: ${deleted[0].name}`);

    return deleted[0];
  },
};