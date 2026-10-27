import { Router } from "express";
import rateLimit from "express-rate-limit";
import { invitationTokenBodySchema } from "../validators/invitation.validator.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createProjectInvitation, createWorkspaceInvitation, listProjectInvitations,
  listWorkspaceInvitations, revokeInvitation, getInvitationDetails,
  acceptInvitation, declineInvitation
} from "../controllers/invitation.controller.js";
import {
  createProjectInvitationSchema, createWorkspaceInvitationSchema,
  workspaceInvitationsSchema, projectInvitationsSchema, invitationIdSchema
} from "../validators/invitation.validator.js";

const router = Router();
const inviteLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false });
router.use(requireAuth);
router.post("/workspaces/:workspaceId", inviteLimiter, validate(createWorkspaceInvitationSchema), createWorkspaceInvitation);
router.get("/workspaces/:workspaceId", validate(workspaceInvitationsSchema), listWorkspaceInvitations);
router.post("/projects/:projectId", inviteLimiter, validate(createProjectInvitationSchema), createProjectInvitation);
router.get("/projects/:projectId", validate(projectInvitationsSchema), listProjectInvitations);
router.post("/details", inviteLimiter, validate(invitationTokenBodySchema), getInvitationDetails);
router.post("/accept", inviteLimiter, validate(invitationTokenBodySchema), acceptInvitation);
router.post("/decline", inviteLimiter, validate(invitationTokenBodySchema), declineInvitation);
router.delete("/:invitationId", validate(invitationIdSchema), revokeInvitation);

export default router;
