import { Router } from "express";
import { 
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} from "./controller"; 
import { validate } from "../../middlewares/validate"; // Validatsiya Middleware
import { createCategorySchema, updateCategorySchema } from "./validation"; // Zod schemalar

const router = Router();

// Asosiy manzillar: POST (Yaratish) va GET (Hammasini olish)
// Endpoint: /api/v1/categories
router.route("/")
  .get(getCategories) // GET - Barcha kategoriyalar
  .post(validate(createCategorySchema), createCategory); // POST - Yangi yaratish, avval validatsiya

// ID bo'yicha manzillar: GET (Bittasini olish), PATCH (Yangilash), DELETE (O'chirish)
// Endpoint: /api/v1/categories/:id
router.route("/:id")
  .get(getCategoryById) // GET - Bittasini olish
  .patch(validate(updateCategorySchema), updateCategory) // PATCH - Yangilash, avval validatsiya
  .delete(deleteCategory); // DELETE - O'chirish

export default router;