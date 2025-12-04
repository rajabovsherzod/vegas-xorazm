import { Router } from "express";
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrder, 
  updateOrderStatus, 
  markAsPrinted 
} from "./controller";
import { validate } from "../../middlewares/validate";
import { sanitizeInput } from "../../middlewares/sanitize";
import { createOrderSchema, updateOrderSchema, updateOrderStatusSchema } from "./validation";
import { protect, authorize } from "../../middlewares/auth";

const router = Router();

// 1. Hamma so'rovlar uchun himoya
router.use(protect);

// 2. Global marshrutlar
router.route("/")
  // GET: Hamma orderlar (Controller ichida user roliga qarab filterlanadi)
  .get(authorize('owner', 'cashier', 'seller'), getOrders)
  // POST: Yangi order yaratish
  .post(
    sanitizeInput({ skipFields: ['password'] }),
    validate(createOrderSchema),
    createOrder
  );

// 3. ID bo'yicha marshrutlar (MUHIM: Bu eng oxirida bo'lishi kerak emas, lekin statik yo'llardan keyin bo'lishi kerak)
router.route("/:id")
  // GET: Bitta orderni olish
  .get(authorize('owner', 'cashier', 'seller'), getOrderById)
  // PATCH: Tahrirlash (PUT shart emas, PATCH yetarli)
  .patch(
    authorize('owner', 'cashier', 'seller'),
    sanitizeInput({ skipFields: ['password'] }),
    validate(updateOrderSchema),
    updateOrder
  );

// 4. Maxsus amallar (ID bilan)
router.route("/:id/status")
  .patch(
    authorize('owner', 'cashier'),
    sanitizeInput({ skipFields: ['password'] }),
    validate(updateOrderStatusSchema),
    updateOrderStatus
  );

router.route("/:id/printed")
  .patch(
    authorize('owner', 'cashier'),
    markAsPrinted
  );

export default router;