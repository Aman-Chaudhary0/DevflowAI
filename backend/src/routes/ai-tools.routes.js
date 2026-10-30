import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { aiToolSchemas } from "../validators/aiTools.validator.js";
import { postAITool } from "../controllers/ai-tools.controller.js";

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: "draft-7", legacyHeaders: false, keyGenerator: (req) => String(req.user._id) });
router.use(requireAuth);
for (const [tool, schema] of Object.entries(aiToolSchemas)) router.post(`/${tool}`, limiter, validate(schema), postAITool(tool));
export default router;
