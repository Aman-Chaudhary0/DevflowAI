import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createTaskCommentForUser,
  createTaskForUser,
  deleteTaskForUser,
  getTaskActivitiesForUser,
  getTaskForUser,
  listProjectMembersForUser,
  listTaskCommentsForUser,
  listTasksForUser,
  listWorkspaceMembersForUser,
  updateTaskForUser
} from "../services/task.service.js";

export const listTasks = asyncHandler(async (req, res) => {
  const tasks = await listTasksForUser(req.user, req.query);
  res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await createTaskForUser(req.user, req.body);
  res.status(201).json(new ApiResponse(201, { task }, "Task created successfully"));
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await getTaskForUser(req.user, req.params.taskId);
  res.status(200).json(new ApiResponse(200, { task }, "Task fetched successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await updateTaskForUser(req.user, req.params.taskId, req.body);
  res.status(200).json(new ApiResponse(200, { task }, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const result = await deleteTaskForUser(req.user, req.params.taskId);
  res.status(200).json(new ApiResponse(200, result, "Task deleted successfully"));
});

export const listTaskComments = asyncHandler(async (req, res) => {
  const comments = await listTaskCommentsForUser(req.user, req.params.taskId);
  res.status(200).json(new ApiResponse(200, { comments }, "Task comments fetched successfully"));
});

export const createTaskComment = asyncHandler(async (req, res) => {
  const comment = await createTaskCommentForUser(req.user, req.params.taskId, req.body);
  res.status(201).json(new ApiResponse(201, { comment }, "Comment created successfully"));
});

export const listWorkspaceMembers = asyncHandler(async (req, res) => {
  const members = await listWorkspaceMembersForUser(req.user, req.params.workspaceId);
  res.status(200).json(new ApiResponse(200, { members }, "Workspace members fetched successfully"));
});

export const listProjectMembers = asyncHandler(async (req, res) => {
  const members = await listProjectMembersForUser(req.user, req.params.projectId);
  res.status(200).json(new ApiResponse(200, { members }, "Project members fetched successfully"));
});

export const getTaskActivity = asyncHandler(async (req, res) => {
  const activity = await getTaskActivitiesForUser(req.user, req.params.taskId);
  res.status(200).json(new ApiResponse(200, { activity }, "Task activity fetched successfully"));
});
