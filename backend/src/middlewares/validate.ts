import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";
import ApiError from "../utils/ApiError";

export const validate =
  (schema: any) => // AnyZodObject o'rniga ZodObject<any> ishlatgan edingiz, uni soddaroq qilamiz
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        
        // ULTIMATE FIX: error obyekti aniq 'errors' massiviga ega ekanligini tasdiqlaymiz.
        // ZodError<unknown> muammosini hal qilish uchun 'as any' ishlatildi.
        const errors = (error as any).errors.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        
        next(new ApiError(400, "Validatsiya xatosi", errors));
      } else {
        next(error);
      }
    }
  };