import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to check if user is a global administrator
 * Must be used after requireAuth middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Administrator access required");
  }

  next();
};

export default requireAdmin;
