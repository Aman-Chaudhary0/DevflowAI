import { Router } from "express";
import {
  createTask,
  createTaskComment,
  deleteTask,
  getTask,
  getTaskActivity,
  getWorkspaceActivity,
  listProjectMembers,
  listTaskComments,
  listTasks,
  listWorkspaceMembers,
  updateTask
} from "../controllers/task.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createCommentSchema,
  createTaskSchema,
  projectMembersSchema,
  taskParamsSchema,
  taskQuerySchema,
  updateTaskSchema,
  workspaceMembersSchema
} from "../validators/task.validator.js";

const router = Router();

router.get("/workspace/:workspaceId/members", requireAuth, validate(workspaceMembersSchema), listWorkspaceMembers);
router.get("/workspace/:workspaceId/activity", requireAuth, validate(workspaceMembersSchema), getWorkspaceActivity);
router.get("/project/:projectId/members", requireAuth, validate(projectMembersSchema), listProjectMembers);
router.get("/", requireAuth, validate(taskQuerySchema), listTasks);
router.post("/", requireAuth, validate(createTaskSchema), createTask);
router.get("/:taskId", requireAuth, validate(taskParamsSchema), getTask);
router.patch("/:taskId", requireAuth, validate(taskParamsSchema), validate(updateTaskSchema), updateTask);
router.delete("/:taskId", requireAuth, validate(taskParamsSchema), deleteTask);
router.get("/:taskId/comments", requireAuth, validate(taskParamsSchema), listTaskComments);
router.post("/:taskId/comments", requireAuth, validate(taskParamsSchema), validate(createCommentSchema), createTaskComment);
router.get("/:taskId/activity", requireAuth, validate(taskParamsSchema), getTaskActivity);

export default router;
