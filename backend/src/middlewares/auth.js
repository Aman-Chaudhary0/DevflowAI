import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/generateToken.js";

// The requireAuth middleware function checks for the presence of an access token in the request headers or cookies. It verifies the token, retrieves the associated user from the database, and attaches the user object to the request for further processing. If authentication fails, it throws an ApiError with a 401 status code.
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  const token = req.cookies?.accessToken || bearerToken;

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new ApiError(401, "Invalid authentication token");
  }

  req.user = user;
  next();
});
