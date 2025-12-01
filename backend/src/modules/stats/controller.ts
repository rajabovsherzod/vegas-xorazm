import { Request, Response } from "express";
import asyncHandler from "@/utils/asyncHandler";
import ApiResponse from "@/utils/ApiResponse";
import { statsService } from "./service";

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await statsService.getDashboardStats();
  res.status(200).json(new ApiResponse(200, stats, "Dashboard statistikasi"));
});

