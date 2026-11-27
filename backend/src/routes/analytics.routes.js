import { Router } from "express";
import { analyticsLeaderboard, analyticsSummary } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { analyticsLeaderboardSchema, analyticsSummarySchema } from "../validators/analytics.validator.js";

const router = Router();
router.get("/summary", requireAuth, validate(analyticsSummarySchema), analyticsSummary);
router.get("/leaderboard", requireAuth, validate(analyticsLeaderboardSchema), analyticsLeaderboard);

export default router;
