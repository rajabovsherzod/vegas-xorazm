import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import logger from "../utils/logger";
import { logsService } from "../modules/logs/service";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Something went wrong";

  // Winston logger ga yozish (backup)
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: error.stack,
    errors: error.errors,
  });

  // Bazaga saqlash (try-catch bilan - agar bazaga saqlashda xatolik bo'lsa, infinite loop bo'lmasin)
  // Async ishlatish uchun Promise qilamiz (Express 4 async middleware qo'llab-quvvatlamaydi)
  const userId = (req as any).user?.id || null;

  // context ni object sifatida yuboramiz, service ichida JSON.stringify qilinadi
  logsService.create({
    message: `[Backend] ${statusCode} - ${message}`,
    stack: error.stack || null,
    url: req.originalUrl || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
    level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warning' : 'info',
    context: JSON.stringify({
      method: req.method,
      statusCode,
      errors: error.errors,
      body: req.body,
      query: req.query,
      params: req.params,
    }) as any, // Type assertion - service ichida qayta JSON.stringify qilinmaydi
    ip: req.ip || null,
    userId,
  }).catch((dbError) => {
    // Agar bazaga saqlashda xatolik bo'lsa, faqat Winston ga yozamiz
    logger.error('Failed to save error to database:', dbError);
  });

  // Clientga javob qaytaramiz
  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors,
    // Productionda stack trace ko'rinmasin
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};

export default errorHandler;