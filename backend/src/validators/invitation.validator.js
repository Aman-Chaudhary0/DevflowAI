import { z } from "zod";

const id = z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid id");
const token = z.string().regex(/^[a-fA-F0-9]{64}$/, "Invalid invitation token");

export const createWorkspaceInvitationSchema = z.object({
  body: z.object({ email: z.string().trim().email().max(254).toLowerCase(), role: z.enum(["admin", "member", "viewer"]), message: z.string().trim().max(1000).optional().default("") }),
  params: z.object({ workspaceId: id })
});
export const createProjectInvitationSchema = z.object({
  body: z.object({ email: z.string().trim().email().max(254).toLowerCase(), role: z.enum(["admin", "editor", "viewer"]), message: z.string().trim().max(1000).optional().default("") }),
  params: z.object({ projectId: id })
});
export const workspaceInvitationsSchema = z.object({ params: z.object({ workspaceId: id }) });
export const projectInvitationsSchema = z.object({ params: z.object({ projectId: id }) });
export const invitationIdSchema = z.object({ params: z.object({ invitationId: id }) });
export const invitationTokenSchema = z.object({ params: z.object({ token }) });
export const invitationTokenBodySchema = z.object({ body: z.object({ token }) });
