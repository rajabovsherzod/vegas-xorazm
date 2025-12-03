import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "./controller";
import { validate } from "../../middlewares/validate";
import { createUserSchema, updateUserSchema } from "./validation";
import { protect, authorize } from "../../middlewares/auth"; 

const router = Router();

// Hamma route oldin "protect" dan o'tishi shart (Token kerak)
router.use(protect); 

router.route("/")
  .get(authorize('owner', 'cashier'), getUsers) // Faqat Owner va Kassir ko'ra olsin
  .post(authorize('owner'), validate(createUserSchema), createUser); 

router.route("/:id")
  .get(getUserById)
  .patch(authorize('owner'), validate(updateUserSchema), updateUser) 
  .delete(authorize('owner'), deleteUser); 

export default router;