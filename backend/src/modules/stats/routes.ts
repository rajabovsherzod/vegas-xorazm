import { Router } from "express";
import { getDashboardStats } from "./controller";
import { protect, authorize } from "@/middlewares/auth";

const router = Router();

// Faqat Admin va Owner ko'ra oladi
router.get("/dashboard", protect, authorize("admin", "owner"), getDashboardStats);

export default router;

