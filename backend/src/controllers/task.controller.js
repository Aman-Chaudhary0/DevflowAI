import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createTaskCommentForUser,
  createTaskForUser,
  deleteTaskForUser,
  getTaskActivitiesForUser,
  getWorkspaceActivitiesForUser,
  getTaskForUser,
  listProjectMembersForUser,
  listTaskCommentsForUser,
  listTasksForUser,
  listWorkspaceMembersForUser,
  updateTaskForUser
} from "../services/task.service.js";
import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import { REALTIME_EVENTS, publishTaskEvent } from "../realtime/events.js";
import { userRoom } from "../realtime/events.js";

async function notifyTaskParticipants(req, task, type, message) {
  const io = req.app.get("io");
  const recipients = new Set([task.assignee?._id || task.assignee, task.createdBy?._id || task.createdBy]
    .filter(Boolean).map(String).filter((id) => id !== String(req.user._id)));
  for (const recipient of recipients) {
    try {
      const projectId = task.project?._id || task.project;
      const workspaceId = task.workspace?._id || task.workspace;
      const [project, projectMembership, workspaceMembership] = await Promise.all([
        Project.findById(projectId, { owner: 1 }).lean(),
        ProjectMember.exists({ project: projectId, user: recipient }),
        WorkspaceMember.exists({ workspace: workspaceId, user: recipient, status: "active" })
      ]);
      if (!project || (String(project.owner) !== recipient && !projectMembership && !workspaceMembership)) continue;
      const notification = await Notification.create({
        recipient,
        actor: req.user._id,
        workspace: workspaceId,
        project: projectId,
        type,
        title: type === "comment" ? "New task comment" : "Task assigned or updated",
        message: message.slice(0, 500),
        targetUrl: "/dashboard/tasks",
        metadata: { taskId: String(task._id) }
      });
      io?.to(userRoom(recipient)).emit(REALTIME_EVENTS.notificationCreated, {
        eventId: String(notification._id), type: REALTIME_EVENTS.notificationCreated,
        occurredAt: notification.createdAt,
        workspaceId: String(notification.workspace),
        projectId: String(notification.project),
        actor: { id: String(req.user._id), name: req.user.name || "" },
        resource: { type: "notification", id: String(notification._id) },
        data: { notification: notification.toObject() },
        notification: notification.toObject()
      });
    } catch (error) {
      console.warn("Notification persistence or delivery failed", error.name || "Error");
    }
  }
}

async function publishTaskActivity(req, taskId, since) {
  try {
    const activity = await Activity.findOne({ entityType: "task", entityId: String(taskId), actor: req.user._id, createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .populate("actor", "_id name avatar")
      .lean();
    const io = req.app.get("io");
    if (io && activity) {
      const payload = {
        eventId: `${activity._id}`,
        type: REALTIME_EVENTS.activityCreated,
        occurredAt: activity.createdAt,
        workspaceId: String(activity.workspace),
        projectId: String(activity.project),
        actor: { id: String(activity.actor?._id || ""), name: activity.actor?.name || "" },
        resource: { type: "task", id: String(taskId) },
        data: { activity }
      };
      io.to(`workspace:${activity.workspace}`).to(`project:${activity.project}`).emit(REALTIME_EVENTS.activityCreated, payload);
    }
  } catch (error) {
    console.warn("Realtime activity publication failed", error.name || "Error");
  }
}

export const listTasks = asyncHandler(async (req, res) => {
  const tasks = await listTasksForUser(req.user, req.query);
  res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

export const createTask = asyncHandler(async (req, res) => {
  const mutationStartedAt = new Date();
  const task = await createTaskForUser(req.user, req.body);
  publishTaskEvent(req.app.get("io"), REALTIME_EVENTS.taskCreated, task, req.user);
  await publishTaskActivity(req, task._id, mutationStartedAt);
  if (task.assignee && String(task.assignee._id || task.assignee) !== String(req.user._id)) {
    await notifyTaskParticipants(req, task, "task", `You were assigned to ${task.title}`);
  }
  res.status(201).json(new ApiResponse(201, { task }, "Task created successfully"));
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await getTaskForUser(req.user, req.params.taskId);
  res.status(200).json(new ApiResponse(200, { task }, "Task fetched successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
  const mutationStartedAt = new Date();
  const changesAssignee = req.body.assignee !== undefined || req.body.assigneeId !== undefined;
  let assignmentChanged = false;
  if (changesAssignee) {
    const existing = await getTaskForUser(req.user, req.params.taskId);
    const currentAssigneeId = String(existing.assignee?._id || existing.assignee || "").toLowerCase();
    const nextAssigneeId = String(req.body.assigneeId ?? req.body.assignee ?? "").toLowerCase();
    assignmentChanged = currentAssigneeId !== nextAssigneeId;
  }
  const task = await updateTaskForUser(req.user, req.params.taskId, req.body);
  publishTaskEvent(req.app.get("io"), REALTIME_EVENTS.taskUpdated, task, req.user);
  await publishTaskActivity(req, task._id, mutationStartedAt);
  if (assignmentChanged) {
    await notifyTaskParticipants(req, task, "task", `Task assignment updated: ${task.title}`);
  }
  res.status(200).json(new ApiResponse(200, { task }, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const mutationStartedAt = new Date();
  const task = await getTaskForUser(req.user, req.params.taskId);
  const result = await deleteTaskForUser(req.user, req.params.taskId);
  publishTaskEvent(req.app.get("io"), REALTIME_EVENTS.taskDeleted, task, req.user, { taskId: result.taskId });
  await publishTaskActivity(req, result.taskId, mutationStartedAt);
  res.status(200).json(new ApiResponse(200, result, "Task deleted successfully"));
});

export const listTaskComments = asyncHandler(async (req, res) => {
  const comments = await listTaskCommentsForUser(req.user, req.params.taskId);
  res.status(200).json(new ApiResponse(200, { comments }, "Task comments fetched successfully"));
});

export const createTaskComment = asyncHandler(async (req, res) => {
  const mutationStartedAt = new Date();
  const comment = await createTaskCommentForUser(req.user, req.params.taskId, req.body);
  const task = await getTaskForUser(req.user, req.params.taskId);
  publishTaskEvent(req.app.get("io"), REALTIME_EVENTS.commentCreated, task, req.user, { data: { comment: {
    _id: String(comment._id), task: String(comment.task), content: comment.content,
    author: { _id: String(comment.author?._id || comment.author), name: comment.author?.name || "", avatar: comment.author?.avatar || "" },
    createdAt: comment.createdAt
  } } });
  await publishTaskActivity(req, req.params.taskId, mutationStartedAt);
  await notifyTaskParticipants(req, task, "comment", `A new comment was added to ${task.title}`);
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

export const getWorkspaceActivity = asyncHandler(async (req, res) => {
  const activity = await getWorkspaceActivitiesForUser(req.user, req.params.workspaceId);
  res.status(200).json(new ApiResponse(200, { activity }, "Workspace activity fetched successfully"));
});
