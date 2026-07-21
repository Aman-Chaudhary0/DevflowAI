import { Router } from "express";
import passport from "passport";
import {
  forgotPassword,
  handleResendVerification,
  handleResetPassword,
  handleVerifyEmail,
  login,
  logout,
  me,
  oauthCallback,
  refreshToken,
  register
} from "../controllers/auth/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", requireAuth, logout);
router.post("/refresh-token", refreshToken);
router.get("/me", requireAuth, me);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), handleResetPassword);
router.post("/verify-email", validate(verifyEmailSchema), handleVerifyEmail);
router.post("/resend-verification", validate(resendVerificationSchema), handleResendVerification);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/api/auth/oauth/failure", session: false }), oauthCallback);
router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get("/github/callback", passport.authenticate("github", { failureRedirect: "/api/auth/oauth/failure", session: false }), oauthCallback);
router.get("/oauth/failure", (_req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?auth=failed`);
});

export default router;
