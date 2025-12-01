import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ApiError from "@/utils/ApiError";
import logger from "@/utils/logger";
import bcrypt from "bcrypt";
import { getIO } from "@/socket"; // 🔌 SOCKET IMPORT
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
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, payload.username),
    });
    if (existingUser) throw new ApiError(409, "Bu login band!");

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

    const [newUser] = await db.insert(users).values({
      ...payload,
      password: hashedPassword,
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
    
    // User yaratilganda socket shart emas (Admin o'zi ko'rib turibdi), lekin xohlasangiz qo'shish mumkin.
    return newUser;
  },

  // 3. UPDATE (Bloklash mantig'i bilan)
  update: async (id: number, payload: UpdateUserInput) => {
    let updateData: any = { ...payload };
    
    if (payload.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(payload.password, saltRounds);
    }

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

    // 🔥 SOCKET: Agar user bloklangan bo'lsa (isActive = false)
    if (payload.isActive === false) {
        try {
            // Userni majburan tizimdan chiqarib yuboramiz
            getIO().emit("user_status_change", {
                userId: id,
                status: "blocked",
                message: "Sizning akkauntingiz ma'muriyat tomonidan bloklandi."
            });
            logger.warn(`User ${id} bloklandi va socket signali yuborildi.`);
        } catch (e) { console.error("Socket error:", e); }
    }

    return updatedUser;
  },

  // 4. DELETE (Majburiy Logout)
  delete: async (id: number) => {
    const [deleted] = await db
      .update(users)
      .set({ 
        isDeleted: true,
        isActive: false, // Login qila olmasligi uchun
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning({ id: users.id, username: users.username });

    if (!deleted) throw new ApiError(404, "Foydalanuvchi topilmadi");

    logger.warn(`Xodim ishdan bo'shatildi. ID: ${id}`);

    // 🔥 SOCKET: User o'chirilganda ham chiqarib yuboramiz
    try {
        getIO().emit("user_status_change", {
            userId: id,
            status: "deleted",
            message: "Akkaunt o'chirildi."
        });
    } catch (e) { console.error("Socket error:", e); }

    return deleted;
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