import { Request, Response, NextFunction } from "express";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "@/utils/asyncHandler";
import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import logger from "@/utils/logger";

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  // 1. Userni qidirish
  const user = await db.query.users.findFirst({
    where: and(eq(users.username, username), eq(users.isDeleted, false)),
  });

  // 2. Tekshirish
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError(401, "Login yoki parol noto'g'ri"));
  }

  // 3. Aktivlikni tekshirish
  if (!user.isActive) {
    return next(new ApiError(403, "Sizning akkauntingiz vaqtincha bloklangan. Admin bilan bog'laning."));
  }

  // 4. Token Generatsiya (TUZATILGAN QISM)
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT_SECRET serverda sozlanmagan!");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRE || "1d",
    } as jwt.SignOptions // <--- MANA SHU "SEHRLI" YECHIM (Casting)
  );

  // 5. Javob qaytarish
  // @ts-ignore (passwordni olib tashlash uchun oddiy usul)
  const { password: _, ...userData } = user;

  logger.info(`User tizimga kirdi: ${user.username} (${user.role})`);

  res.status(200).json(new ApiResponse(200, {
    accessToken: token,
    user: userData
  }, "Muvaffaqiyatli kirish"));
});

// Me (O'z ma'lumotlarini olish - NextAuth sessiyani yangilashi uchun kerak bo'lishi mumkin)
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    // Middleware orqali req.user ga ma'lumot tushgan bo'ladi
    const user = (req as any).user; 
    
    res.status(200).json(new ApiResponse(200, user, "Foydalanuvchi ma'lumotlari"));
});