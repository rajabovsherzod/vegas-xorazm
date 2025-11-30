import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ApiError from "@/utils/ApiError";
import logger from "@/utils/logger";
import bcrypt from "bcrypt";
import { CreateUserInput, UpdateUserInput } from "./validation";

export const userService = {
  // 1. GET ALL
  getAll: async () => {
    const data = await db.query.users.findMany({
      where: eq(users.isDeleted, false),
      orderBy: desc(users.createdAt),
      columns: {
        password: false,
      }
    });
    return data;
  },

  // 2. CREATE
  create: async (payload: CreateUserInput) => {
    // A) Login band emasligini tekshirish
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, payload.username),
    });
    if (existingUser) {
      throw new ApiError(409, "Bu login allaqachon band qilingan!");
    }

    // B) Parolni shifrlash
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

    // C) Bazaga yozish
    const [newUser] = await db.insert(users).values({
      ...payload,
      password: hashedPassword,
      // 🔴 TUZATISH: TypeScriptga bu aniq ro'l ekanligini bildiramiz
      role: payload.role as "owner" | "admin" | "seller", 
    }).returning({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    });

    logger.info(`Yangi foydalanuvchi yaratildi. ID: ${newUser.id}, Role: ${newUser.role}`);
    
    return newUser;
  },

  // 3. UPDATE
  update: async (id: number, payload: UpdateUserInput) => {
    let updateData: any = { ...payload }; // 'any' qilib oldik, erkinroq ishlash uchun
    
    if (payload.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(payload.password, saltRounds);
    }

    // 🔴 TUZATISH: Agar role kelgan bo'lsa, uni majburlab tipini to'g'irlaymiz
    if (payload.role) {
        updateData.role = payload.role as "owner" | "admin" | "seller";
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isActive: users.isActive,
        updatedAt: users.updatedAt
      });

    if (!updatedUser) throw new ApiError(404, "Foydalanuvchi topilmadi");

    logger.info(`Foydalanuvchi yangilandi. ID: ${id}`);
    return updatedUser;
  },

  // 4. DELETE
  delete: async (id: number) => {
    const deleted = await db
      .update(users)
      .set({ 
        isDeleted: true,
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning({ id: users.id, username: users.username });

    if (!deleted.length) throw new ApiError(404, "Foydalanuvchi topilmadi");

    logger.warn(`Xodim ishdan bo'shatildi (Soft Delete). ID: ${id}`);
    return deleted[0];
  },
  
  // 5. GET BY ID
  getById: async (id: number) => {
      const user = await db.query.users.findFirst({
          where: eq(users.id, id),
          columns: { password: false }
      });
      if (!user) throw new ApiError(404, "Foydalanuvchi topilmadi");
      return user;
  }
};