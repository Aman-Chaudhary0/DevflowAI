import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createFeedback, listMyFeedback } from "../controllers/feedback.controller.js";
import { optionalAuth, requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createFeedbackSchema } from "../validators/feedback.validator.js";

const router = Router();
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many feedback submissions. Please try again later." }
});

router.post("/", submissionLimiter, optionalAuth, validate(createFeedbackSchema), createFeedback);
router.get("/mine", requireAuth, listMyFeedback);

export default router;
