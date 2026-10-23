import { Router } from "express";
import {
  archiveProject,
  createProject,
  dashboardSummary,
  deleteProject,
  getProject,
  listProjects,
  restoreProject,
  updateProject
} from "../controllers/project.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createProjectSchema,
  listProjectsSchema,
  projectParamsSchema,
  updateProjectSchema
} from "../validators/project.validator.js";

const router = Router();

router.get("/", requireAuth, validate(listProjectsSchema), listProjects);
router.post("/", requireAuth, validate(createProjectSchema), createProject);
router.get("/:projectId", requireAuth, validate(projectParamsSchema), getProject);
router.patch("/:projectId", requireAuth, validate(projectParamsSchema), validate(updateProjectSchema), updateProject);
router.post("/:projectId/archive", requireAuth, validate(projectParamsSchema), archiveProject);
router.post("/:projectId/restore", requireAuth, validate(projectParamsSchema), restoreProject);
router.delete("/:projectId", requireAuth, validate(projectParamsSchema), deleteProject);

export default router;

export const dashboardRouter = Router();
dashboardRouter.get("/summary", requireAuth, dashboardSummary);
