import { Router } from "express";
import { createOrder, getOrders, updateOrderStatus, markAsPrinted } from "./controller";
import { validate } from "../../middlewares/validate";
import { sanitizeInput } from "../../middlewares/sanitize";
import { createOrderSchema, updateOrderStatusSchema } from "./validation";
import { protect, authorize } from "../../middlewares/auth";

const router = Router();

// Hamma order operatsiyalari uchun Login shart!
router.use(protect);

router.route("/")
  // GET: Faqat Owner va Admin hamma chekni ko'ra olsin
  .get(authorize('owner', 'admin'), getOrders)

  // POST: Seller, Admin, Owner - hamma buyurtma yarata oladi
  .post(
    sanitizeInput({ skipFields: ['password'] }),
    validate(createOrderSchema),
    createOrder
  );

// Status o'zgartirish (Confirm/Cancel)
router.route("/:id/status")
  .patch(
    authorize('owner', 'admin'),
    sanitizeInput({ skipFields: ['password'] }),
    validate(updateOrderStatusSchema),
    updateOrderStatus
  );

// Chek chiqarilganini belgilash
router.route("/:id/printed")
  .patch(
    authorize('owner', 'admin'),
    markAsPrinted
  );

export default router;