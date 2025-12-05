import { Router } from "express";
import { 
  createProduct, 
  deleteProduct, 
  getProducts, 
  updateProduct, 
  addStock 
} from "./controller";
import { validate } from "@/middlewares/validate";
import { sanitizeInput } from "@/middlewares/sanitize";
import { createProductSchema, updateProductSchema, addStockSchema } from "./validation";
// 🔥 MUHIM: protect middleware import qiling
import { protect, authorize } from "@/middlewares/auth"; 

const router = Router();

router.use(protect); 
// --- PUBLIC ROUTES (Login shart emas bo'lsa) ---
// Agar mahsulotlarni hamma ko'rishi kerak bo'lsa, GET ni tashqarida qoldiring
router.get("/", getProducts);

// --- PROTECTED ROUTES (Login SHART) ---
// 🔥 MANA SHU YERDA 'protect' BO'LISHI KERAK
// Shunda controllerda req.user.id paydo bo'ladi

// Create Product
router.post(
  "/",
  // authorize('owner', 'admin'), // Agar kerak bo'lsa rol ham qo'shing
  sanitizeInput({ skipFields: ['password'] }),
  validate(createProductSchema),
  createProduct
);

// Stock qo'shish
router.post(
  "/:id/stock",
  sanitizeInput(),
  validate(addStockSchema),
  addStock
);

// Update & Delete
router.route("/:id")
  .patch(
    sanitizeInput({ skipFields: ['password'] }),
    validate(updateProductSchema),
    updateProduct
  )
  .delete(deleteProduct);

export default router;