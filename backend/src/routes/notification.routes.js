import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { deleteNotification, listNotifications, markAllNotificationsRead, markNotificationRead, markNotificationUnread } from "../controllers/notification.controller.js";

const router = Router();
router.use(requireAuth);
router.get("/", listNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:notificationId/read", markNotificationRead);
router.patch("/:notificationId/unread", markNotificationUnread);
router.delete("/:notificationId", deleteNotification);

export default router;
