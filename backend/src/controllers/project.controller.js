import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createProjectForUser,
  deleteProjectForUser,
  getDashboardSummaryForUser,
  getProjectForUser,
  listProjectsForUser,
  updateProjectForUser
} from "../services/project.service.js";

export const listProjects = asyncHandler(async (req, res) => {
  const { page, limit, search, status, visibility, sortBy, sortOrder } = req.query;
  const result = await listProjectsForUser(req.user, { page, limit, search, status, visibility, sortBy, sortOrder });

  res.status(200).json(new ApiResponse(200, result, "Projects fetched successfully"));
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await createProjectForUser(req.user, req.body);
  res.status(201).json(new ApiResponse(201, { project }, "Project created successfully"));
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await getProjectForUser(req.user._id, req.params.projectId);
  res.status(200).json(new ApiResponse(200, { project }, "Project fetched successfully"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await updateProjectForUser(req.user, req.params.projectId, req.body);
  res.status(200).json(new ApiResponse(200, { project }, "Project updated successfully"));
});

export const archiveProject = asyncHandler(async (req, res) => {
  const project = await updateProjectForUser(req.user, req.params.projectId, { status: "archived" });
  res.status(200).json(new ApiResponse(200, { project }, "Project archived successfully"));
});

export const restoreProject = asyncHandler(async (req, res) => {
  const project = await updateProjectForUser(req.user, req.params.projectId, { status: "active" });
  res.status(200).json(new ApiResponse(200, { project }, "Project restored successfully"));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const result = await deleteProjectForUser(req.user, req.params.projectId);
  res.status(200).json(new ApiResponse(200, result, "Project deleted successfully"));
});

export const dashboardSummary = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummaryForUser(req.user._id);
  res.status(200).json(new ApiResponse(200, summary, "Dashboard summary fetched successfully"));
});
