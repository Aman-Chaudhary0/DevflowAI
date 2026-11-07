import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createWorkflowForUser,
  deleteWorkflowForUser,
  getWorkflowForUser,
  listWorkflowRunsForUser,
  listWorkflowsForUser,
  retryWorkflowRunForUser,
  runWorkflowForUser,
  transitionWorkflowStatusForUser,
  updateWorkflowForUser,
  getWorkflowRunForUser
} from "../services/workflow.service.js";

export const listWorkflows = asyncHandler(async (req, res) => {
  const result = await listWorkflowsForUser(req.user, req.query || {});
  res.status(200).json(new ApiResponse(200, result, "Workflows fetched successfully"));
});

export const createWorkflow = asyncHandler(async (req, res) => {
  const workflow = await createWorkflowForUser(req.user, req.body || {});
  res.status(201).json(new ApiResponse(201, { workflow }, "Workflow created successfully"));
});

export const getWorkflow = asyncHandler(async (req, res) => {
  const workflow = await getWorkflowForUser(req.user._id, req.params.workflowId);
  res.status(200).json(new ApiResponse(200, { workflow }, "Workflow fetched successfully"));
});

export const updateWorkflow = asyncHandler(async (req, res) => {
  const workflow = await updateWorkflowForUser(req.user, req.params.workflowId, req.body || {});
  res.status(200).json(new ApiResponse(200, { workflow }, "Workflow updated successfully"));
});

export const deleteWorkflow = asyncHandler(async (req, res) => {
  const result = await deleteWorkflowForUser(req.user, req.params.workflowId);
  res.status(200).json(new ApiResponse(200, result, "Workflow deleted successfully"));
});

export const changeWorkflowStatus = asyncHandler(async (req, res) => {
  const workflow = await transitionWorkflowStatusForUser(req.user, req.params.workflowId, req.body?.status || "active");
  res.status(200).json(new ApiResponse(200, { workflow }, "Workflow status updated successfully"));
});

export const triggerWorkflow = asyncHandler(async (req, res) => {
  const result = await runWorkflowForUser(req.user, req.params.workflowId, {
    manualTest: req.body?.manualTest === true,
    payload: req.body?.payload || {},
    triggerType: req.body?.triggerType || "manual"
  });
  res.status(202).json(new ApiResponse(202, result, "Workflow execution queued successfully"));
});

export const listWorkflowRuns = asyncHandler(async (req, res) => {
  const result = await listWorkflowRunsForUser(req.user._id, req.params.workflowId, req.query || {});
  res.status(200).json(new ApiResponse(200, result, "Workflow runs fetched successfully"));
});

export const getWorkflowRun = asyncHandler(async (req, res) => {
  const run = await getWorkflowRunForUser(req.user._id, req.params.workflowId, req.params.runId);
  res.status(200).json(new ApiResponse(200, { run }, "Workflow run fetched successfully"));
});

export const retryWorkflowRun = asyncHandler(async (req, res) => {
  const result = await retryWorkflowRunForUser(req.user, req.params.workflowId, req.params.runId);
  res.status(202).json(new ApiResponse(202, result, "Workflow execution queued successfully"));
});
