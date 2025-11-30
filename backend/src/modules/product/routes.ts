import { Router } from "express";
import { createProduct, deleteProduct, getProducts, updateProduct } from "./controller";
import { validate } from "@/middlewares/validate";
import { createProductSchema, updateProductSchema } from "./validation"; 

const router = Router();

router.route("/")
  .get(getProducts)
  .post(validate(createProductSchema), createProduct);

router.route("/:id")
  .put(validate(updateProductSchema), updateProduct)  
  .delete(deleteProduct);

export default router;