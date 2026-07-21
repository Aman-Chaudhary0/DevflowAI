import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import { configurePassport } from "./config/passport.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import { ApiResponse } from "./utils/ApiResponse.js";

export const app = express();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

configurePassport(passport);

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: frontendUrl,
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(passport.initialize());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

app.get("/health", (_req, res) => {
  res.status(200).json(new ApiResponse(200, { status: "ok" }, "Backend is healthy"));
});

app.use("/api/auth", authLimiter, authRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
