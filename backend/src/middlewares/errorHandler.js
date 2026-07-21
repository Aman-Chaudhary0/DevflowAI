import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let errors = error.errors || [];

  if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = error.errors.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }));
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {}).join(", ");
    message = `${field || "Resource"} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined
  });
}
