import { Router } from "express";
import { createProduct, deleteProduct, getProducts, updateProduct } from "./controller";
import { validate } from "@/middlewares/validate";
import { sanitizeInput } from "@/middlewares/sanitize";
import { createProductSchema, updateProductSchema } from "./validation";

const router = Router();

// Sanitization middleware barcha POST/PUT requestlar uchun
router.route("/")
  .get(getProducts)
  .post(
    sanitizeInput({ skipFields: ['password'] }),
    validate(createProductSchema),
    createProduct
  );

router.route("/:id")
  .put(
    sanitizeInput({ skipFields: ['password'] }),
    validate(updateProductSchema),
    updateProduct
  )
  .delete(deleteProduct);

export default router;