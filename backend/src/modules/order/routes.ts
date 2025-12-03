import { Router } from "express";
import { createOrder, getOrders, getOrderById, updateOrder, updateOrderStatus, markAsPrinted } from "./controller";
import { validate } from "../../middlewares/validate";
import { sanitizeInput } from "../../middlewares/sanitize";
import { createOrderSchema, updateOrderSchema, updateOrderStatusSchema } from "./validation";
import { protect, authorize } from "../../middlewares/auth";

const router = Router();

// Hamma order operatsiyalari uchun Login shart!
router.use(protect);

router.route("/")
  // GET: Faqat Owner va Kassir hamma chekni ko'ra olsin
  .get(authorize('owner', 'cashier'), getOrders)

  // POST: Seller, Kassir, Owner - hamma buyurtma yarata oladi
  .post(
    sanitizeInput({ skipFields: ['password'] }),
    validate(createOrderSchema),
    createOrder
  );

// Bitta orderni olish va tahrir qilish
router.route("/:id")
  .get(authorize('owner', 'cashier', 'seller'), getOrderById)
  .patch(
    authorize('owner', 'cashier', 'seller'),
    sanitizeInput({ skipFields: ['password'] }),
    validate(updateOrderSchema),
    updateOrder
  );

// Status o'zgartirish (Confirm/Cancel)
router.route("/:id/status")
  .patch(
    authorize('owner', 'cashier'),
    sanitizeInput({ skipFields: ['password'] }),
    validate(updateOrderStatusSchema),
    updateOrderStatus
  );

// Chek chiqarilganini belgilash
router.route("/:id/printed")
  .patch(
    authorize('owner', 'cashier'),
    markAsPrinted
  );

export default router;