import { Router } from "express";
import { analyticsSummary } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { analyticsSummarySchema } from "../validators/analytics.validator.js";

const router = Router();
router.get("/summary", requireAuth, validate(analyticsSummarySchema), analyticsSummary);

export default router;
