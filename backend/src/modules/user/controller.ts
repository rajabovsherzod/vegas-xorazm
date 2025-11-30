import { Request, Response } from "express";
import { userService } from "./service";
import asyncHandler from "@/utils/asyncHandler";
import ApiResponse from "@/utils/ApiResponse";

// 1. GET ALL (Barcha xodimlar)
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getAll();
  res.status(200).json(new ApiResponse(200, result, "Xodimlar ro'yxati yuklandi"));
});

// 2. CREATE (Yangi xodim yaratish - Owner tomonidan)
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.create(req.body);
  res.status(201).json(new ApiResponse(201, result, "Yangi xodim muvaffaqiyatli yaratildi"));
});

// 3. GET BY ID (Bittasini ko'rish)
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getById(Number(req.params.id));
  res.status(200).json(new ApiResponse(200, result, "Xodim ma'lumotlari"));
});

// 4. UPDATE (Tahrirlash)
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.update(Number(req.params.id), req.body);
  res.status(200).json(new ApiResponse(200, result, "Xodim ma'lumotlari yangilandi"));
});

// 5. DELETE (Ishdan bo'shatish - Soft Delete)
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.delete(Number(req.params.id));
  res.status(200).json(new ApiResponse(200, null, "Xodim tizimdan o'chirildi (Soft delete)"));
});