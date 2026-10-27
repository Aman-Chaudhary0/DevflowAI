import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as invitationService from "../services/invitation.service.js";

export const createWorkspaceInvitation = asyncHandler(async (req, res) => {
  const invitation = await invitationService.createWorkspaceInvitation(req.user, req.params.workspaceId, req.body);
  res.status(201).json(new ApiResponse(201, { invitation }, "Invitation email sent"));
});
export const listWorkspaceInvitations = asyncHandler(async (req, res) => {
  const invitations = await invitationService.listWorkspaceInvitations(req.user, req.params.workspaceId);
  res.status(200).json(new ApiResponse(200, { invitations }, "Invitations fetched"));
});
export const createProjectInvitation = asyncHandler(async (req, res) => {
  const invitation = await invitationService.createProjectInvitation(req.user, req.params.projectId, req.body);
  res.status(201).json(new ApiResponse(201, { invitation }, "Invitation email sent"));
});
export const listProjectInvitations = asyncHandler(async (req, res) => {
  const invitations = await invitationService.listProjectInvitations(req.user, req.params.projectId);
  res.status(200).json(new ApiResponse(200, { invitations }, "Invitations fetched"));
});
export const revokeInvitation = asyncHandler(async (req, res) => {
  const invitation = await invitationService.revokeInvitation(req.user, req.params.invitationId);
  res.status(200).json(new ApiResponse(200, { invitation }, "Invitation revoked"));
});
export const getInvitationDetails = asyncHandler(async (req, res) => {
  const invitation = await invitationService.getInvitationDetails(req.user, req.body.token);
  res.status(200).json(new ApiResponse(200, { invitation }, "Invitation fetched"));
});
export const acceptInvitation = asyncHandler(async (req, res) => {
  const membership = await invitationService.acceptInvitation(req.user, req.body.token);
  res.status(200).json(new ApiResponse(200, { membership }, "Invitation accepted"));
});
export const declineInvitation = asyncHandler(async (req, res) => {
  const invitation = await invitationService.declineInvitation(req.user, req.body.token);
  res.status(200).json(new ApiResponse(200, { invitation }, "Invitation declined"));
});
