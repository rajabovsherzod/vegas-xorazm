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

const router = Router();

// Asosiy /products
router.route("/")
  .get(getProducts)
  .post(
    sanitizeInput({ skipFields: ['password'] }),
    validate(createProductSchema),
    createProduct
  );

// 2. STOCK QO'SHISH (Maxsus action)
router.post(
  "/:id/stock",
  sanitizeInput(),
  validate(addStockSchema),
  addStock
);

// 3. ID BO'YICHA (UPDATE & DELETE)
router.route("/:id")
  // 🔥 O'ZGARISH SHU YERDA: .put() emas, .patch() bo'lishi kerak!
  .patch(
    sanitizeInput({ skipFields: ['password'] }),
    validate(updateProductSchema),
    updateProduct
  )
  .delete(deleteProduct);

export default router;