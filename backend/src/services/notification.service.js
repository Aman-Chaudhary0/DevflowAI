import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";

export async function listNotificationsForUser(userId) {
  return Notification.find({ recipient: userId })
    .populate("actor", "_id name avatar")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
}

export async function markNotificationReadForUser(userId, notificationId) {
  if (!mongoose.isValidObjectId(notificationId)) throw new ApiError(400, "Invalid notification id");
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { readAt: new Date() } },
    { new: true }
  ).lean();
  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
}

export async function markAllNotificationsReadForUser(userId) {
  await Notification.updateMany({ recipient: userId, readAt: null }, { $set: { readAt: new Date() } });
  return { updated: true };
}

export async function markNotificationUnreadForUser(userId, notificationId) {
  if (!mongoose.isValidObjectId(notificationId)) throw new ApiError(400, "Invalid notification id");
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { readAt: null } },
    { new: true }
  ).lean();
  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
}

export async function deleteNotificationForUser(userId, notificationId) {
  if (!mongoose.isValidObjectId(notificationId)) throw new ApiError(400, "Invalid notification id");
  const result = await Notification.deleteOne({ _id: notificationId, recipient: userId });
  if (!result.deletedCount) throw new ApiError(404, "Notification not found");
  return { deleted: true };
}
