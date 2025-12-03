import { Router } from "express";
import { getDashboardStats, getOwnerStats } from "./controller";
import { protect, authorize } from "@/middlewares/auth";

const router = Router();

// Admin uchun dashboard stats
router.get("/dashboard", protect, authorize("admin"), getDashboardStats);

// Owner uchun business analytics
router.get("/owner", protect, authorize("owner"), getOwnerStats);

export default router;


