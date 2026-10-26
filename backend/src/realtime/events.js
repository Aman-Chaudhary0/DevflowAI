import { randomUUID } from "node:crypto";

export const REALTIME_EVENTS = Object.freeze({
  taskCreated: "task.created",
  taskUpdated: "task.updated",
  taskDeleted: "task.deleted",
  commentCreated: "task.comment.created",
  activityCreated: "activity.created",
  notificationCreated: "notification.created",
  notificationRead: "notification.read",
  notificationsReadAll: "notification.read-all",
  notificationDeleted: "notification.deleted",
  connectionReady: "connection.ready"
});

export const workspaceRoom = (id) => `workspace:${id}`;
export const projectRoom = (id) => `project:${id}`;
export const userRoom = (id) => `user:${id}`;

export function publishTaskEvent(io, event, task, actor, extra = {}) {
  if (!io || !task) return;
  const data = task.toObject ? task.toObject() : task;
  const workspaceId = data.workspace?._id || data.workspace;
  const projectId = data.project?._id || data.project;
  const assignee = data.assignee && typeof data.assignee === "object"
    ? { _id: data.assignee._id, name: data.assignee.name, avatar: data.assignee.avatar || "" }
    : data.assignee || null;
  const taskSummary = {
    _id: String(data._id || extra.taskId || ""),
    title: data.title || "",
    status: data.status || "",
    priority: data.priority || "",
    assignee,
    updatedAt: data.updatedAt || null
  };
  const payload = {
    eventId: randomUUID(),
    type: event,
    occurredAt: new Date().toISOString(),
    workspaceId: String(workspaceId),
    projectId: String(projectId),
    actor: { id: String(actor?._id || actor?.id || ""), name: actor?.name || "" },
    resource: { type: "task", id: String(data._id || extra.taskId || "") },
    data: { task: taskSummary },
    ...extra
  };
  io.to(workspaceRoom(workspaceId)).to(projectRoom(projectId)).emit(event, payload);
}
