import { Router } from "express";
import { createOrder, getOrders, updateOrderStatus } from "./controller";
import { validate } from "../../middlewares/validate";
import { createOrderSchema, updateOrderStatusSchema } from "./validation"; // Schema import qilindi
import { protect, authorize } from "../../middlewares/auth";

const router = Router();

// Hamma order operatsiyalari uchun Login shart!
router.use(protect);

router.route("/")
  // GET: Faqat Owner va Admin hamma chekni ko'ra olsin
  .get(authorize('owner', 'admin'), getOrders) 
  
  // POST: Seller, Admin, Owner - hamma buyurtma yarata oladi
  // createOrderSchema bilan validatsiya qilamiz
  .post(validate(createOrderSchema), createOrder);

// Status o'zgartirish (Confirm/Cancel)
router.route("/:id/status")
  .patch(
    authorize('owner', 'admin'), // Faqat kattalar
    validate(updateOrderStatusSchema), // Status to'g'riligini tekshirish
    updateOrderStatus
  );

export default router;