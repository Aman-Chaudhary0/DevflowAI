import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  completeOAuthLogin,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  verifyEmail
} from "../../services/auth/auth.service.js";

const isProduction = process.env.NODE_ENV === "production";

// durationToMs is a utility function that converts a duration string (e.g., "15m", "1h") into milliseconds. It supports various time units (milliseconds, seconds, minutes, hours, days) and returns a fallback value if the input is invalid or not provided.
function durationToMs(value, fallbackMs) {
  if (!value) return fallbackMs;
  const match = /^(\d+)(ms|s|m|h|d)?$/.exec(value);
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = match[2] || "ms";
  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return amount * multipliers[unit];
}

//  CookieOptions function defines HTTP cookie settings based on environment and max age.
function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge
  };
}

// setAuthCookies sets the access and refresh tokens as HTTP cookies in the response, using the specified expiration durations from environment variables or default values.
function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(
    "accessToken",
    accessToken,
    cookieOptions(durationToMs(process.env.ACCESS_TOKEN_EXPIRY, 15 * 60 * 1000))
  );
  res.cookie(
    "refreshToken",
    refreshToken,
    cookieOptions(durationToMs(process.env.REFRESH_TOKEN_EXPIRY, 7 * 24 * 60 * 60 * 1000))
  );
}

// clearAuthCookies clears the access and refresh token cookies from the response, effectively logging the user out by removing their authentication tokens.
function clearAuthCookies(res) {
  res.clearCookie("accessToken", cookieOptions(0));
  res.clearCookie("refreshToken", cookieOptions(0));
}

// The following controller functions handle various authentication-related operations, including user registration, login, logout, token refresh, fetching the current user, password reset, email verification, and OAuth callbacks. Each function uses asyncHandler to manage asynchronous operations and sends structured API responses using the ApiResponse utility.
export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  setAuthCookies(res, result);
  res.status(201).json(new ApiResponse(201, { user: result.user, accessToken: result.accessToken }, "Registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  setAuthCookies(res, result);
  res.status(200).json(new ApiResponse(200, { user: result.user, accessToken: result.accessToken }, "Logged in successfully"));
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user._id);
  clearAuthCookies(res);
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await refreshUserToken(token);
  setAuthCookies(res, result);
  res.status(200).json(new ApiResponse(200, { user: result.user, accessToken: result.accessToken }, "Token refreshed"));
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);
  res.status(200).json(new ApiResponse(200, { user }, "Current user fetched"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await requestPasswordReset(req.body.email);
  res.status(200).json(new ApiResponse(200, null, "If that email exists, a reset link has been sent"));
});

export const handleResetPassword = asyncHandler(async (req, res) => {
  await resetPassword(req.body);
  clearAuthCookies(res);
  res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
});

export const handleVerifyEmail = asyncHandler(async (req, res) => {
  const user = await verifyEmail(req.body.token);
  res.status(200).json(new ApiResponse(200, { user }, "Email verified successfully"));
});

export const handleResendVerification = asyncHandler(async (req, res) => {
  await resendVerification(req.body.email);
  res.status(200).json(new ApiResponse(200, null, "Verification email sent"));
});

export const oauthCallback = asyncHandler(async (req, res) => {
  const result = await completeOAuthLogin(req.user);
  setAuthCookies(res, result);
  res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?auth=success`);
});
