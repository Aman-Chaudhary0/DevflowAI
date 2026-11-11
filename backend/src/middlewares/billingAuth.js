import { Workspace, WorkspaceMember } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireWorkspaceBillingAccess = asyncHandler(
  async (req, _res, next) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId
    });

    if (!member) {
      throw new ApiError(403, "Not a member of this workspace");
    }

    if (!["owner", "admin"].includes(member.role)) {
      throw new ApiError(403, "Insufficient permissions for billing management");
    }

    req.workspace = workspace;
    req.workspaceMember = member;
    next();
  }
);
