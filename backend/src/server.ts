import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createServer } from "http"; // <-- YANGI
import { initSocket } from "./socket"; // <-- YANGI

import logger from "./utils/logger";
import errorHandler from "./middlewares/errorHandler";
import ApiError from "./utils/ApiError";

// Routerlarni import qilish
import routes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. XAVFSIZLIK (MIDDLEWARES) ---

app.use(helmet());

// Socket ishlashi uchun CORSni biroz yumshatamiz (yoki aniq domen yozing)
const whitelist = ["http://localhost:3000", "https://vegas-xorazm.uz"];
app.use(
  cors({
    origin: "*", // Socket uchun vaqtincha "*" (keyin whitelistga o'tkazasiz)
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 daqiqa
  max: 200, // 1 daqiqada 200 ta so'rov (har bir foydalanuvchi uchun)
  message: "Juda ko'p so'rov yuborildi, bir daqiqadan keyin urinib ko'ring.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Socket.io ulanishlarini o'tkazib yuborish
    return req.path.includes('/socket.io');
  }
});
app.use("/api", limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// --- 2. ROUTELAR ---

app.get("/", (req, res) => {
  res.send("Vegas CRM API is running 🚀");
});

app.use("/api/v1", routes);

// --- 3. 404 HANDLER ---
app.use((req, res, next) => {
  next(new ApiError(404, `Bunday manzil topilmadi: ${req.originalUrl}`));
});

// --- 4. GLOBAL ERROR HANDLER ---
app.use(errorHandler);

// --- 5. SERVER START (INTEGRATSIYA) ---

// Expressni HTTP serverga o'raymiz
const httpServer = createServer(app);

// Socketni ishga tushiramiz
initSocket(httpServer);

// app.listen EMAS, httpServer.listen!
const server = httpServer.listen(PORT, () => {
  logger.info(`🚀 Server (HTTP + Socket) ${PORT}-portda ishga tushdi (Mode: ${process.env.NODE_ENV})`);
});

// Unhandled Rejection
process.on("unhandledRejection", (err: any) => {
  logger.error("UNHANDLED REJECTION! 💥 Server o‘chirilmoqda...");
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});