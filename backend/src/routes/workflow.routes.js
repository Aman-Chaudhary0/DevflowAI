import { Router } from "express";
import {
  changeWorkflowStatus,
  createWorkflow,
  deleteWorkflow,
  getWorkflow,
  getWorkflowRun,
  listWorkflowRuns,
  listWorkflows,
  retryWorkflowRun,
  triggerWorkflow,
  updateWorkflow
} from "../controllers/workflow.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createWorkflowSchema,
  updateWorkflowSchema,
  workflowParamsSchema,
  workflowRunParamsSchema,
  workflowStatusSchema
} from "../validators/workflow.validator.js";

const router = Router();

router.get("/", requireAuth, listWorkflows);
router.post("/", requireAuth, validate(createWorkflowSchema), createWorkflow);
router.get("/:workflowId", requireAuth, validate(workflowParamsSchema), getWorkflow);
router.patch("/:workflowId", requireAuth, validate(workflowParamsSchema), validate(updateWorkflowSchema), updateWorkflow);
router.delete("/:workflowId", requireAuth, validate(workflowParamsSchema), deleteWorkflow);
router.post("/:workflowId/status", requireAuth, validate(workflowParamsSchema), validate(workflowStatusSchema), changeWorkflowStatus);
router.post("/:workflowId/run", requireAuth, validate(workflowParamsSchema), triggerWorkflow);
router.get("/:workflowId/runs", requireAuth, validate(workflowParamsSchema), listWorkflowRuns);
router.get("/:workflowId/runs/:runId", requireAuth, validate(workflowRunParamsSchema), getWorkflowRun);
router.post("/:workflowId/runs/:runId/retry", requireAuth, validate(workflowRunParamsSchema), retryWorkflowRun);

export default router;
