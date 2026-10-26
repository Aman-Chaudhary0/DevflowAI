import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { randomUUID } from "node:crypto";
import { REALTIME_EVENTS, userRoom } from "../realtime/events.js";
import {
  deleteNotificationForUser,
  listNotificationsForUser,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
  markNotificationUnreadForUser
} from "../services/notification.service.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await listNotificationsForUser(req.user._id);
  res.status(200).json(new ApiResponse(200, { notifications }, "Notifications fetched successfully"));
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationReadForUser(req.user._id, req.params.notificationId);
  req.app.get("io")?.to(userRoom(req.user._id)).emit(REALTIME_EVENTS.notificationRead, { eventId: randomUUID(), type: REALTIME_EVENTS.notificationRead, occurredAt: new Date().toISOString(), data: { notificationId: String(notification._id), readAt: notification.readAt }, notificationId: String(notification._id), readAt: notification.readAt });
  res.status(200).json(new ApiResponse(200, { notification }, "Notification marked as read"));
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsReadForUser(req.user._id);
  req.app.get("io")?.to(userRoom(req.user._id)).emit(REALTIME_EVENTS.notificationsReadAll, { eventId: randomUUID(), type: REALTIME_EVENTS.notificationsReadAll, occurredAt: new Date().toISOString(), data: {}, readAt: new Date().toISOString() });
  res.status(200).json(new ApiResponse(200, result, "Notifications marked as read"));
});

export const markNotificationUnread = asyncHandler(async (req, res) => {
  const notification = await markNotificationUnreadForUser(req.user._id, req.params.notificationId);
  req.app.get("io")?.to(userRoom(req.user._id)).emit(REALTIME_EVENTS.notificationRead, { eventId: randomUUID(), type: REALTIME_EVENTS.notificationRead, occurredAt: new Date().toISOString(), data: { notificationId: String(notification._id), readAt: null }, notificationId: String(notification._id), readAt: null });
  res.status(200).json(new ApiResponse(200, { notification }, "Notification marked as unread"));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await deleteNotificationForUser(req.user._id, req.params.notificationId);
  req.app.get("io")?.to(userRoom(req.user._id)).emit(REALTIME_EVENTS.notificationDeleted, { eventId: randomUUID(), type: REALTIME_EVENTS.notificationDeleted, occurredAt: new Date().toISOString(), data: { notificationId: req.params.notificationId }, notificationId: req.params.notificationId });
  res.status(200).json(new ApiResponse(200, result, "Notification deleted"));
});
