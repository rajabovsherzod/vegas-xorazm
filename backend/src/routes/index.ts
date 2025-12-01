import { Router } from "express";
// E'TIBOR BERING: Yo'l endi modules papkasiga olib boradi
import productRoutes from "@/modules/product/routes";
import categoryRoutes from "@/modules/category/routes";
import userRoutes from "@/modules/user/routes";
import authRoutes from "@/modules/auth/routes";
import orderRoutes from "@/modules/order/routes";
import statsRoutes from "@/modules/stats/routes";

const router = Router();

// Hamma modullarni shu yerga ulaymiz
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);
router.use("/stats", statsRoutes);

export default router;