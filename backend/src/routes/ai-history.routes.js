import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  listHistorySchema,
  historyIdSchema,
  usageSummarySchema,
  usageTimeseriesSchema,
  usageByToolSchema,
  usageByModelSchema,
  usageByProjectSchema
} from "../validators/aiHistory.validator.js";
import {
  listHistory,
  getHistoryItem,
  deleteHistoryItem,
  getUsageSummary,
  getUsageTimeseries,
  getUsageByTool,
  getUsageByModel,
  getUsageByProject
} from "../controllers/ai-history.controller.js";

const router = Router();
router.use(requireAuth);

// History
router.get("/history", validate(listHistorySchema), listHistory);
router.get("/history/:id", validate(historyIdSchema), getHistoryItem);
router.delete("/history/:id", validate(historyIdSchema), deleteHistoryItem);

// Usage analytics
router.get("/usage/summary", validate(usageSummarySchema), getUsageSummary);
router.get("/usage/timeseries", validate(usageTimeseriesSchema), getUsageTimeseries);
router.get("/usage/by-tool", validate(usageByToolSchema), getUsageByTool);
router.get("/usage/by-model", validate(usageByModelSchema), getUsageByModel);
router.get("/usage/by-project", validate(usageByProjectSchema), getUsageByProject);

export default router;
