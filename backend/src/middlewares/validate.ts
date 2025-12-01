import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import ApiError from "../utils/ApiError";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      // Agar bu Zod xatosi bo'lsa
      if (error instanceof ZodError) {
        // 🔥 FIX: Xavfsiz mapping
        const errorMessage = error.errors
          ? error.errors.map((issue) => issue.message).join(", ")
          : "Validatsiya xatosi (Aniqlab bo'lmadi)";

        return next(new ApiError(400, errorMessage));
      }
      // Boshqa xatoliklar
      return next(error);
    }
  };