import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import logger from "./utils/logger";
import errorHandler from "./middlewares/errorHandler";
import ApiError from "./utils/ApiError";

// Routerlarni import qilish
import routes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. XAVFSIZLIK (MIDDLEWARES) ---

// Helmet: HTTP headerlarini himoyalaydi
app.use(helmet());

// CORS: Frontendga ruxsat berish
const whitelist = ["http://localhost:3000", "https://vegas-xorazm.uz"];
app.use(
  cors({
    origin: (origin, callback) => {
      // !origin - bu Postman yoki server-to-server zaproslar uchun ruxsat
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Rate Limiter: DDoS himoya (15 minutda 100 ta zapros)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Juda ko‘p so‘rov yuborildi, 15 daqiqadan keyin urinib ko‘ring.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Body Parser: JSON o'qish (limit 16kb - serverni og'irlashtirmaslik uchun)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// --- 2. ROUTELAR ---

// Test Route
app.get("/", (req, res) => {
  res.send("Vegas CRM API is running 🚀");
});

// Asosiy API yo'llari
app.use("/api/v1", routes);

// --- 3. 404 HANDLER ---
// Agar mavjud bo'lmagan yo'lga kirilsa
app.use((req, res, next) => {
  next(new ApiError(404, `Bunday manzil topilmadi: ${req.originalUrl}`));
});

// --- 4. GLOBAL ERROR HANDLER ---
app.use(errorHandler);

// --- 5. SERVER START ---
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server ${PORT}-portda ishga tushdi (Mode: ${process.env.NODE_ENV})`);
});

// Unhandled Rejection (Baza o'chib qolsa serverni toza o'chirish)
process.on("unhandledRejection", (err: any) => {
  logger.error("UNHANDLED REJECTION! 💥 Server o‘chirilmoqda...");
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});