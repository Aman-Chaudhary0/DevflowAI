import Notification from "../models/Notification.js";
import { randomUUID } from "node:crypto";
import { userRoom, REALTIME_EVENTS } from "../realtime/events.js";

/**
 * Centralized notification creation helper
 * Handles persistence and real-time delivery
 * Failures are logged but do not block the original operation
 */
export async function createNotification(io, {
  recipient,
  actor,
  workspace,
  project,
  type,
  title,
  message,
  targetUrl = "",
  metadata = {}
}) {
  try {
    if (!recipient) throw new Error("Recipient required");
    if (!type) throw new Error("Type required");
    if (!title) throw new Error("Title required");
    if (!message) throw new Error("Message required");

    const notification = await Notification.create({
      recipient,
      actor: actor || null,
      workspace: workspace || null,
      project: project || null,
      type,
      title,
      message,
      targetUrl,
      metadata,
      readAt: null
    });

    // Emit real-time event to recipient
    if (io) {
      io.to(userRoom(String(recipient))).emit(REALTIME_EVENTS.notificationCreated, {
        eventId: randomUUID(),
        type: REALTIME_EVENTS.notificationCreated,
        occurredAt: new Date().toISOString(),
        notification: notification.toObject()
      });
    }

    return notification;
  } catch (error) {
    console.error("[Notification Helper] Failed to create notification:", error.message);
    return null;
  }
}

/**
 * Create task assignment notification
 */
export async function notifyTaskAssignment(io, { task, assignee, assigner, workspace, project }) {
  if (!assignee) return null;
  return createNotification(io, {
    recipient: assignee._id || assignee,
    actor: assigner?._id || assigner,
    workspace: workspace?._id || workspace,
    project: project?._id || project,
    type: "task",
    title: "Task Assigned",
    message: `${assigner?.name || "Someone"} assigned you a task: ${task?.title || "Untitled"}`,
    targetUrl: `/dashboard/tasks`,
    metadata: { taskId: String(task?._id || task), assignerId: String(assigner?._id || assigner) }
  });
}

/**
 * Create task comment notification
 */
export async function notifyTaskComment(io, { task, comment, commenter, recipients, workspace, project }) {
  if (!recipients || recipients.length === 0) return [];
  const notifications = [];
  for (const recipient of recipients) {
    if (String(recipient) === String(commenter?._id || commenter)) continue; // Don't notify self
    const notif = await createNotification(io, {
      recipient,
      actor: commenter?._id || commenter,
      workspace: workspace?._id || workspace,
      project: project?._id || project,
      type: "comment",
      title: "New Comment on Task",
      message: `${commenter?.name || "Someone"} commented on: ${task?.title || "Untitled"}`,
      targetUrl: `/dashboard/tasks`,
      metadata: { taskId: String(task?._id || task), commentId: String(comment?._id || comment) }
    });
    if (notif) notifications.push(notif);
  }
  return notifications;
}

/**
 * Create invitation notification
 */
export async function notifyInvitationAccepted(io, { inviter, invitee, workspace, project }) {
  if (!inviter) return null;
  return createNotification(io, {
    recipient: inviter._id || inviter,
    actor: invitee?._id || invitee,
    workspace: workspace?._id || workspace,
    project: project?._id || project,
    type: "invitation",
    title: "Invitation Accepted",
    message: `${invitee?.name || "Someone"} accepted your invitation to ${workspace?.name || project?.name || "join"}`,
    targetUrl: `/dashboard/team`,
    metadata: { inviteeId: String(invitee?._id || invitee) }
  });
}

/**
 * Create system notification
 */
export async function notifySystem(io, { recipient, title, message, targetUrl = "", metadata = {} }) {
  return createNotification(io, {
    recipient,
    actor: null,
    workspace: null,
    project: null,
    type: "system",
    title,
    message,
    targetUrl,
    metadata
  });
}
