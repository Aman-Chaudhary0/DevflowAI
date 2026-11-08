import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  cancelDeploymentForUser,
  createDeploymentForUser,
  getDeploymentForUser,
  getDeploymentLogsForUser,
  getDeploymentStatsForUser,
  listDeploymentsForUser,
  redeployForUser,
  rollbackForUser
} from "../services/deployment.service.js";

export const createDeployment = asyncHandler(async (req, res) => {
  const result = await createDeploymentForUser(req.user, req.body || {}, req.app.get("io"));
  res.status(202).json(new ApiResponse(202, result, "Deployment queued successfully"));
});

export const listDeployments = asyncHandler(async (req, res) => {
  const result = await listDeploymentsForUser(req.user._id, req.query || {});
  res.status(200).json(new ApiResponse(200, result, "Deployments fetched successfully"));
});

export const deploymentStats = asyncHandler(async (req, res) => {
  const result = await getDeploymentStatsForUser(req.user._id);
  res.status(200).json(new ApiResponse(200, result, "Deployment stats fetched successfully"));
});

export const getDeployment = asyncHandler(async (req, res) => {
  const result = await getDeploymentForUser(req.user._id, req.params.deploymentId, {
    refresh: req.query?.refresh === "1"
  });
  res.status(200).json(new ApiResponse(200, result, "Deployment fetched successfully"));
});

export const redeploy = asyncHandler(async (req, res) => {
  const result = await redeployForUser(req.user, req.params.deploymentId, req.app.get("io"));
  res.status(202).json(new ApiResponse(202, result, "Redeployment queued successfully"));
});

export const rollbackDeployment = asyncHandler(async (req, res) => {
  const result = await rollbackForUser(req.user, req.params.deploymentId, req.body || {}, req.app.get("io"));
  res.status(202).json(new ApiResponse(202, result, "Rollback queued successfully"));
});

export const cancelDeployment = asyncHandler(async (req, res) => {
  const result = await cancelDeploymentForUser(req.user, req.params.deploymentId, req.app.get("io"));
  res.status(200).json(new ApiResponse(200, result, "Deployment cancelled successfully"));
});

export const deploymentLogs = asyncHandler(async (req, res) => {
  const result = await getDeploymentLogsForUser(req.user._id, req.params.deploymentId, req.query || {});
  res.status(200).json(new ApiResponse(200, result, "Deployment logs fetched successfully"));
});
