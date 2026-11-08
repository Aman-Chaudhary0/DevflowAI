import { Router } from "express";
import {
  cancelDeployment,
  createDeployment,
  deploymentLogs,
  deploymentStats,
  getDeployment,
  listDeployments,
  redeploy,
  rollbackDeployment
} from "../controllers/deployment.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createDeploymentSchema,
  deploymentListSchema,
  deploymentLogsSchema,
  deploymentParamsSchema,
  rollbackSchema
} from "../validators/deployment.validator.js";

const router = Router();

router.post("/", requireAuth, validate(createDeploymentSchema), createDeployment);
router.get("/", requireAuth, validate(deploymentListSchema), listDeployments);
router.get("/stats", requireAuth, deploymentStats);
router.get("/:deploymentId", requireAuth, validate(deploymentParamsSchema), getDeployment);
router.post("/:deploymentId/redeploy", requireAuth, validate(deploymentParamsSchema), redeploy);
router.post("/:deploymentId/rollback", requireAuth, validate(rollbackSchema), rollbackDeployment);
router.post("/:deploymentId/cancel", requireAuth, validate(deploymentParamsSchema), cancelDeployment);
router.get("/:deploymentId/logs", requireAuth, validate(deploymentLogsSchema), deploymentLogs);

export default router;
