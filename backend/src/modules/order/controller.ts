import { Request, Response } from "express";
import { orderService } from "./service";
import asyncHandler from "@/utils/asyncHandler";
import ApiResponse from "@/utils/ApiResponse";
import { AuthRequest } from "@/middlewares/auth"; // User ID olish uchun

// 1. CREATE ORDER (Seller yaratadi)
export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Token ichidan user ID sini olamiz (bu Seller ID bo'ladi)
  const userId = req.user.id;

  // Serviceni chaqiramiz
  const result = await orderService.create(userId, req.body);

  res.status(201).json(new ApiResponse(201, result, "Buyurtma qabul qilindi (Draft)"));
});

// 2. GET ALL ORDERS (Tarixni ko'rish)
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.getAll();
  res.status(200).json(new ApiResponse(200, result, "Buyurtmalar tarixi"));
});

// 3. UPDATE STATUS (Confirm/Reject - Admin qiladi)
export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orderId = Number(req.params.id);
  const adminId = req.user.id; // Token egasi (Admin)

  const result = await orderService.updateStatus(orderId, adminId, req.body);

  res.status(200).json(new ApiResponse(200, result, `Buyurtma holati o'zgartirildi: ${req.body.status}`));
});

// 4. MARK AS PRINTED
export const markAsPrinted = asyncHandler(async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const result = await orderService.markAsPrinted(orderId);
  res.status(200).json(new ApiResponse(200, result, "Buyurtma cheki chiqarildi"));
});