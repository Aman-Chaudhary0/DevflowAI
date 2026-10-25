import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Task from "../models/Task.js";
import TaskComment from "../models/TaskComment.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import { ApiError } from "../utils/ApiError.js";
import { getProjectForUser } from "./project.service.js";

const TASK_STATUSES = ["todo", "in_progress", "review", "blocked", "done"];
const TASK_PRIORITIES = ["low", "medium", "high", "urgent"];

function normalizeString(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function safeUser(userDoc) {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  delete user.refreshToken;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.twoFactorSecret;
  delete user.twoFactorSetupSecret;
  delete user.twoFactorRecoveryCodes;
  delete user.twoFactorPendingTokenHash;
  delete user.twoFactorChallengeExpires;
  delete user.twoFactorFailedAttempts;
  delete user.twoFactorLockUntil;
  return user;
}

function toTaskResponse(taskDoc) {
  if (!taskDoc) return null;
  const task = taskDoc.toObject ? taskDoc.toObject() : { ...taskDoc };

  if (task.createdBy && typeof task.createdBy === "object") {
    task.createdBy = safeUser(task.createdBy);
  }

  if (task.assignee && typeof task.assignee === "object") {
    task.assignee = safeUser(task.assignee);
  }

  if (task.project && typeof task.project === "object") {
    task.project = {
      _id: task.project._id,
      name: task.project.name,
      slug: task.project.slug || ""
    };
  }

  if (task.workspace && typeof task.workspace === "object") {
    task.workspace = {
      _id: task.workspace._id,
      name: task.workspace.name,
      slug: task.workspace.slug || ""
    };
  }

  return task;
}

function toCommentResponse(commentDoc) {
  if (!commentDoc) return null;
  const comment = commentDoc.toObject ? commentDoc.toObject() : { ...commentDoc };

  if (comment.author && typeof comment.author === "object") {
    comment.author = safeUser(comment.author);
  }

  if (comment.project && typeof comment.project === "object") {
    comment.project = { _id: comment.project._id, name: comment.project.name || "" };
  }

  if (comment.workspace && typeof comment.workspace === "object") {
    comment.workspace = { _id: comment.workspace._id, name: comment.workspace.name || "" };
  }

  return comment;
}

async function assertWorkspaceAccess(userId, workspaceId) {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid workspace id");
  }

  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const membership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
    status: "active"
  }).lean();

  if (!membership) {
    throw new ApiError(403, "You do not have access to this workspace");
  }

  return workspace;
}

async function resolveAssignee(projectId, workspaceId, assigneeId) {
  if (!assigneeId || assigneeId === "null") return null;

  if (!mongoose.isValidObjectId(assigneeId)) {
    throw new ApiError(400, "Invalid assignee id");
  }

  const assignee = await User.findById(assigneeId).lean();
  if (!assignee) {
    throw new ApiError(404, "Assignee not found");
  }

  const projectMember = await ProjectMember.findOne({ project: projectId, user: assigneeId }).lean();
  const workspaceMember = await WorkspaceMember.findOne({ workspace: workspaceId, user: assigneeId, status: "active" }).lean();

  if (!projectMember && !workspaceMember) {
    throw new ApiError(400, "Assignee must be a project or workspace member");
  }

  return assignee;
}

async function createTaskActivity({ actor, workspace, project, task, action, metadata = {} }) {
  return Activity.create({
    actor,
    workspace,
    project,
    entityType: "task",
    entityId: String(task?._id || task || ""),
    action,
    metadata: metadata || {}
  });
}

export async function listTasksForUser(user, query = {}) {
  const { projectId, workspaceId, status, priority, search, assignee, sortBy = "updatedAt", sortOrder = "desc", page = 1, limit = 25 } = query;

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 100) : 25;

  let projectFilter = [];

  if (projectId) {
    const project = await getProjectForUser(user._id, projectId);
    projectFilter = [project._id];
  } else if (workspaceId) {
    await assertWorkspaceAccess(user._id, workspaceId);
    const projectIds = await Project.find({ workspace: workspaceId }, { _id: 1 }).lean();
    projectFilter = projectIds.map((item) => item._id);
  } else {
    const projects = await Project.find({
      $or: [
        { owner: user._id },
        { _id: { $in: await ProjectMember.find({ user: user._id }, { project: 1 }).lean().then((rows) => rows.map((row) => row.project)) } }
      ]
    }, { _id: 1 }).lean();
    projectFilter = projects.map((project) => project._id);
  }

  const filter = {
    project: projectFilter.length ? { $in: projectFilter } : { $in: [] },
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(assignee ? { assignee } : {}),
    ...(search ? {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    } : {})
  };

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate("project", "_id name slug")
      .populate("workspace", "_id name slug")
      .populate("createdBy", "_id name email avatar")
      .populate("assignee", "_id name email avatar")
      .sort(sort)
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    Task.countDocuments(filter)
  ]);

  return {
    tasks: tasks.map((task) => toTaskResponse(task)),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit))
  };
}

export async function createTaskForUser(user, input = {}) {
  const projectId = input.projectId || input.project;
  if (!projectId) {
    throw new ApiError(400, "Project id is required");
  }

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await getProjectForUser(user._id, projectId);
  const workspaceId = input.workspaceId || input.workspace || project.workspace?._id || project.workspace;

  if (!workspaceId) {
    throw new ApiError(400, "Workspace id is required");
  }

  if (project.workspace && project.workspace._id && workspaceId.toString() !== project.workspace._id.toString()) {
    throw new ApiError(400, "Project and workspace do not match");
  }

  const title = normalizeString(input.title, "").trim();
  if (!title) {
    throw new ApiError(400, "Task title is required");
  }

  const description = normalizeString(input.description, "");
  const status = TASK_STATUSES.includes(input.status) ? input.status : "todo";
  const priority = TASK_PRIORITIES.includes(input.priority) ? input.priority : "medium";

  const labels = Array.isArray(input.labels)
    ? input.labels.map((label) => String(label).trim()).filter(Boolean).slice(0, 20)
    : [];

  const dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.dueDate && Number.isNaN(dueDate.getTime())) {
    throw new ApiError(400, "Invalid due date");
  }

  const assigneeId = input.assigneeId || input.assignee;
  const assignee = await resolveAssignee(project._id, project.workspace._id, assigneeId);

  const task = await Task.create({
    title,
    description,
    project: project._id,
    workspace: project.workspace._id,
    createdBy: user._id,
    assignee: assignee ? assignee._id : null,
    status,
    priority,
    dueDate,
    labels
  });

  await createTaskActivity({
    actor: user._id,
    workspace: project.workspace._id,
    project: project._id,
    task,
    action: "created_task",
    metadata: {
      title,
      priority,
      status
    }
  });

  return await Task.findById(task._id)
    .populate("project", "_id name slug")
    .populate("workspace", "_id name slug")
    .populate("createdBy", "_id name email avatar")
    .populate("assignee", "_id name email avatar");
}

export async function getTaskForUser(user, taskId) {
  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }

  const task = await Task.findById(taskId)
    .populate("project", "_id name slug workspace")
    .populate("workspace", "_id name slug")
    .populate("createdBy", "_id name email avatar")
    .populate("assignee", "_id name email avatar")
    .lean();

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const project = await getProjectForUser(user._id, task.project._id.toString());
  if (!project) {
    throw new ApiError(404, "Task not found or access denied");
  }

  return toTaskResponse(task);
}

export async function updateTaskForUser(user, taskId, input = {}) {
  const existing = await getTaskForUser(user, taskId);
  const projectId = input.projectId || input.project || existing.project?._id;
  const workspaceId = input.workspaceId || input.workspace || existing.workspace?._id;

  if (projectId && projectId.toString() !== existing.project._id.toString()) {
    throw new ApiError(400, "Task project cannot be changed");
  }

  if (workspaceId && workspaceId.toString() !== existing.workspace._id.toString()) {
    throw new ApiError(400, "Task workspace cannot be changed");
  }

  const update = {};

  if (input.title !== undefined) {
    const title = normalizeString(input.title, "").trim();
    if (!title) throw new ApiError(400, "Task title is required");
    update.title = title;
  }

  if (input.description !== undefined) update.description = normalizeString(input.description, "");

  if (input.status !== undefined) {
    if (!TASK_STATUSES.includes(input.status)) throw new ApiError(400, "Invalid task status");
    update.status = input.status;
  }

  if (input.priority !== undefined) {
    if (!TASK_PRIORITIES.includes(input.priority)) throw new ApiError(400, "Invalid task priority");
    update.priority = input.priority;
  }

  if (input.labels !== undefined) {
    update.labels = Array.isArray(input.labels)
      ? input.labels.map((label) => String(label).trim()).filter(Boolean).slice(0, 20)
      : [];
  }

  if (input.dueDate !== undefined) {
    update.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.dueDate && Number.isNaN(update.dueDate.getTime())) {
      throw new ApiError(400, "Invalid due date");
    }
  }

  if (input.assigneeId !== undefined || input.assignee !== undefined) {
    const assigneeId = input.assigneeId ?? input.assignee;
    const assignee = await resolveAssignee(existing.project._id, existing.workspace._id, assigneeId);
    update.assignee = assignee ? assignee._id : null;
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "No valid task fields were provided");
  }

  const before = await Task.findById(taskId).lean();
  const updatedTask = await Task.findByIdAndUpdate(taskId, { $set: update }, { new: true })
    .populate("project", "_id name slug")
    .populate("workspace", "_id name slug")
    .populate("createdBy", "_id name email avatar")
    .populate("assignee", "_id name email avatar");

  const metadata = {};
  if (update.status && update.status !== before.status) metadata.status = { from: before.status, to: update.status };
  if (update.priority && update.priority !== before.priority) metadata.priority = { from: before.priority, to: update.priority };
  if (update.assignee && update.assignee.toString() !== String(before.assignee || "")) metadata.assignee = { from: before.assignee ? before.assignee.toString() : null, to: update.assignee.toString() };
  if (update.title && update.title !== before.title) metadata.title = { from: before.title, to: update.title };

  if (Object.keys(metadata).length) {
    await createTaskActivity({
      actor: user._id,
      workspace: existing.workspace._id,
      project: existing.project._id,
      task: updatedTask,
      action: update.status && update.status !== before.status ? "updated_task_status" : metadata.priority ? "updated_task_priority" : "updated_task",
      metadata
    });
  }

  return updatedTask;
}

export async function deleteTaskForUser(user, taskId) {
  const task = await getTaskForUser(user, taskId);

  await TaskComment.deleteMany({ task: task._id });
  await Activity.deleteMany({ entityType: "task", entityId: task._id.toString() });
  await Task.findByIdAndDelete(task._id);

  await createTaskActivity({
    actor: user._id,
    workspace: task.workspace?._id,
    project: task.project?._id,
    task: task._id,
    action: "deleted_task",
    metadata: { title: task.title }
  });

  return { deleted: true, taskId: task._id.toString() };
}

export async function listTaskCommentsForUser(user, taskId) {
  const task = await getTaskForUser(user, taskId);
  const comments = await TaskComment.find({ task: task._id })
    .populate("author", "_id name email avatar")
    .populate("project", "_id name slug")
    .populate("workspace", "_id name slug")
    .sort({ createdAt: 1 })
    .lean();

  return comments.map((comment) => toCommentResponse(comment));
}

export async function createTaskCommentForUser(user, taskId, input = {}) {
  const task = await getTaskForUser(user, taskId);
  const content = normalizeString(input.content, "").trim();

  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await TaskComment.create({
    task: task._id,
    project: task.project._id,
    workspace: task.workspace._id,
    author: user._id,
    content
  });

  await createTaskActivity({
    actor: user._id,
    workspace: task.workspace._id,
    project: task.project._id,
    task: task._id,
    action: "commented_on_task",
    metadata: { commentId: comment._id.toString() }
  });

  return await TaskComment.findById(comment._id)
    .populate("author", "_id name email avatar")
    .populate("project", "_id name slug")
    .populate("workspace", "_id name slug");
}

export async function listWorkspaceMembersForUser(user, workspaceId) {
  await assertWorkspaceAccess(user._id, workspaceId);

  const rows = await WorkspaceMember.find({ workspace: workspaceId })
    .populate("user", "_id name email avatar")
    .sort({ role: 1, createdAt: -1 })
    .lean();

  return rows.map((member) => ({
    _id: member._id,
    workspace: member.workspace,
    user: safeUser(member.user),
    role: member.role,
    status: member.status,
    invitedBy: member.invitedBy || null,
    joinedAt: member.joinedAt,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt
  }));
}

export async function listProjectMembersForUser(user, projectId) {
  const project = await getProjectForUser(user._id, projectId);

  const rows = await ProjectMember.find({ project: project._id })
    .populate("user", "_id name email avatar")
    .sort({ role: 1, createdAt: -1 })
    .lean();

  return rows.map((member) => ({
    _id: member._id,
    project: member.project,
    user: safeUser(member.user),
    role: member.role,
    addedBy: member.addedBy || null,
    joinedAt: member.joinedAt,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt
  }));
}

export async function getTaskActivitiesForUser(user, taskId) {
  const task = await getTaskForUser(user, taskId);
  return await Activity.find({
    entityType: "task",
    entityId: task._id.toString()
  })
    .populate("actor", "_id name email avatar")
    .sort({ createdAt: -1 })
    .lean();
}
