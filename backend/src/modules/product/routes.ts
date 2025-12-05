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
// Agar addStock uchun alohida validatsiya schema bo'lmasa, shart emas, 
// lekin quantity borligini tekshirish yaxshi bo'lar edi.

const router = Router();

// Asosiy /products
router.route("/")
  .get(getProducts)
  .post(
    sanitizeInput({ skipFields: ['password'] }),
    validate(createProductSchema),
    createProduct
  );

// 🔥 MUHIM: Maxsus actionlar ID routidan oldin yoki alohida yozilishi kerak,
// lekin bu yerda "/:id/stock" bo'lgani uchun "/:id" bilan konflikt qilmaydi.
// Baribir tartibni saqlash yaxshi odat.

// 2. STOCK QO'SHISH ROUTE (MANA SHU YETISHMAYOTGAN EDI)
router.post(
  "/:id/stock",
  sanitizeInput(),
  validate(addStockSchema),
  addStock
);

// ID bo'yicha operatsiyalar
router.route("/:id")
  .put(
    sanitizeInput({ skipFields: ['password'] }),
    validate(updateProductSchema),
    updateProduct
  )
  .delete(deleteProduct);

export default router;